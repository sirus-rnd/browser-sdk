import { v4 as uuid } from 'uuid';
import { delay } from 'bluebird';
import { Consola } from 'consola';
import { schema, Type, Database } from 'lovefield';
import {
  MessageType,
  Conversation,
  ConversationStatus,
  User,
  FileContent,
} from './p2p-chat';
import { UserChannel } from './user-channel';
import {
  IConversationStateManager,
  ConversationState,
  FileState,
} from './conversation-state';

export enum MessagingType {
  MessageNew = 'message:new',
  Typing = 'user:typing',
  MessageReceived = 'message:received',
  MessageRead = 'message:read',
  FileRequest = 'file:request',
  FileStart = 'file:start',
  FileChunk = 'file:chunk',
}

export const FILE_CHUNK_SIZE = 16384;

/**
 * new message payload contain actual message thath being sent or received by user
 * message can contain text message or id of a file
 * when message type are either file or image, message content contain id of file
 * that will be request on demand by receiver
 */
export interface NewMessagePayload {
  id: string;
  roomID: string;
  sendAt: Date;
  messageType: MessageType;
  messageContent: string; // message content or file id
  file?: FileInfo;
}

/**
 * contain file information
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

/**
 * send while use typing a message
 */
export interface TypingPayload {
  roomID: string;
}

/**
 * send when receiver read the message
 */
export interface MessageReadPayload {
  id: string;
}

/**
 * acknowledege message is received
 */
export interface MessageReceivedPayload {
  id: string;
}

/**
 * request file transfer, this payload need to send after peer receive file message
 */
export interface FileRequestPayload {
  id: string;
  startAt: number;
}

/**
 * give receiver information about how to transfer a file
 * @TODO add integrity check
 */
export interface FileStartPayload {
  id: string;
  size: number; // in byte
  chunkSize: number;
  numberOfChunk: number;
}

/**
 * contain chunk of file being transfered
 */
export interface FileChunkPayload {
  id: string;
  chunkIndex: number;
  chunk: string;
}

type MessagingPayload =
  | NewMessagePayload
  | TypingPayload
  | MessageReadPayload
  | MessageReceivedPayload
  | FileRequestPayload
  | FileStartPayload
  | FileChunkPayload;

export interface MessagingProtocol {
  type: MessagingType;
  payload: MessagingPayload;
}

export interface PendingMessage {
  id: string;
  channelId: string;
  type: MessagingType;
  payload: MessagingPayload;
}

/**
 * interface to manage messaging protocols between peers
 */
export interface IMessenger {
  // send message sequences
  sendMessage(channel: UserChannel, payload: NewMessagePayload): Promise<void>;
  onReceiveMessage(
    channel: UserChannel,
    payload: NewMessagePayload
  ): Promise<void>;
  receiveMessage(
    channel: UserChannel,
    payload: MessageReceivedPayload
  ): Promise<void>;
  onMessageReceived(
    channel: UserChannel,
    payload: MessageReceivedPayload
  ): Promise<void>;
  readMessage(channel: UserChannel, payload: MessageReadPayload): Promise<void>;
  onMessageRead(
    channel: UserChannel,
    payload: MessageReadPayload
  ): Promise<void>;

  // send file sequences
  requestFile(channel: UserChannel, payload: FileRequestPayload): Promise<void>;
  onFileRequest(
    channel: UserChannel,
    payload: FileRequestPayload
  ): Promise<void>;
  startFileTransfer(
    channel: UserChannel,
    payload: FileStartPayload
  ): Promise<void>;
  onFileTransferStart(
    channel: UserChannel,
    payload: FileStartPayload
  ): Promise<void>;
  sendFileChunk(channel: UserChannel, payload: FileChunkPayload): Promise<void>;
  onReceiveFileChunk(
    channel: UserChannel,
    payload: FileChunkPayload
  ): Promise<void>;

  // user typing
  typing(channel: UserChannel, payload: TypingPayload): Promise<void>;
  onUserType(channel: UserChannel, payload: TypingPayload): Promise<void>;

  send(channel: UserChannel, message: MessagingProtocol): Promise<void>;
  resendPendingMessages(channel: UserChannel): Promise<void>;
  handleIncomingMessage(channel: UserChannel, event: MessageEvent): void;
  reset(): Promise<void>;
}

export class Messenger implements IMessenger {
  private db: Database;

  constructor(
    private convMgr: IConversationStateManager,
    private logger: Consola
  ) {}

  async init() {
    const builder = schema.create('messenger', 1);
    builder
      .createTable('pendingMessage')
      .addColumn('id', Type.STRING)
      .addColumn('channelId', Type.STRING)
      .addColumn('type', Type.STRING)
      .addColumn('payload', Type.OBJECT)
      .addPrimaryKey(['id'])
      .addNullable(['payload']);

    this.db = await builder.connect();
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }

  private async getPendingMessages(
    channelId: string
  ): Promise<PendingMessage[]> {
    const msgTable = this.db.getSchema().table('pendingMessage');
    const results = await this.db
      .select()
      .from(msgTable)
      .where(msgTable.channelId.eq(channelId))
      .exec();
    return results as PendingMessage[];
  }

  private async addPendingMessage(
    channelId: string,
    message: MessagingProtocol
  ): Promise<PendingMessage> {
    const msgTable = this.db.getSchema().table('pendingMessage');
    const pendingMsg = {
      id: uuid(),
      channelId,
      type: message.type,
      payload: message.payload,
    } as PendingMessage;
    const row = msgTable.createRow(pendingMsg);
    const results = await this.db.insert().into(msgTable).values([row]).exec();
    if (results.length > 0) {
      return results[0] as PendingMessage;
    }
    return null;
  }

  private async removePendingMessage(id: string): Promise<PendingMessage> {
    const msgTable = this.db.getSchema().table('pendingMessage');
    const results = await this.db
      .delete()
      .from(msgTable)
      .where(msgTable.id.eq(id))
      .exec();
    if (results.length > 0) {
      return results[0] as PendingMessage;
    }
    return null;
  }

  async reset(): Promise<void> {
    const msgTable = this.db.getSchema().table('pendingMessage');
    await this.db.delete().from(msgTable).exec();
  }

  async send(channel: UserChannel, message: MessagingProtocol): Promise<void> {
    try {
      if (!channel.sendChannelReady || !channel.sendChannel) {
        throw new Error(`send channel ${channel.id} not connected`);
      }
      channel.sendChannel.send(JSON.stringify(message));
    } catch (err) {
      this.logger.error('failed to send message', err);
      this.logger.debug('add message to temporary pending message');
      await this.addPendingMessage(channel.id, message);
    }
  }

  async resendPendingMessages(channel: UserChannel): Promise<void> {
    // get pending message for this channel
    const messages = await this.getPendingMessages(channel.id);
    this.logger.debug('number of pending message', messages?.length);
    await Promise.all(
      messages.map(async (msg) => {
        this.logger.debug('resend pending message', msg.id);
        await this.send(channel, {
          type: msg.type,
          payload: msg.payload,
        });
        this.logger.debug('send pending message success', msg.id);
        await this.removePendingMessage(msg.id);
      })
    );
  }

  handleIncomingMessage(channel: UserChannel, event: MessageEvent): void {
    const msg: MessagingProtocol = JSON.parse(event.data);
    switch (msg?.type) {
      case MessagingType.MessageNew: {
        this.onReceiveMessage(channel, msg.payload as NewMessagePayload);
        break;
      }
      case MessagingType.MessageReceived: {
        this.onMessageReceived(channel, msg.payload as MessageReceivedPayload);
        break;
      }
      case MessagingType.MessageRead: {
        this.onMessageRead(channel, msg.payload as MessageReadPayload);
        break;
      }
      case MessagingType.Typing: {
        this.onUserType(channel, msg.payload as TypingPayload);
        break;
      }
      case MessagingType.FileRequest: {
        this.onFileRequest(channel, msg.payload as FileRequestPayload);
        break;
      }
      case MessagingType.FileStart: {
        this.onFileTransferStart(channel, msg.payload as FileStartPayload);
        break;
      }
      case MessagingType.FileChunk: {
        this.onReceiveFileChunk(channel, msg.payload as FileChunkPayload);
        break;
      }
      default:
        this.logger.error('message not recognized!', msg);
    }
  }

  // send message sequences
  async sendMessage(
    channel: UserChannel,
    payload: NewMessagePayload
  ): Promise<void> {
    this.logger.debug('send message', payload);
    await this.send(channel, {
      type: MessagingType.MessageNew,
      payload,
    });
  }

  async onReceiveMessage(
    channel: UserChannel,
    payload: NewMessagePayload
  ): Promise<void> {
    this.logger.debug('receive message payload', payload);
    if (
      payload.messageType === MessageType.FILE ||
      payload.messageType === MessageType.IMAGE
    ) {
      this.logger.debug('create new file', payload.file);
      await this.convMgr.receiveFile({
        id: payload.messageContent,
        owner: channel.id,
        name: payload.file?.name,
        size: payload.file?.size,
        type: payload.file?.type,
        numberOfChunks: Math.ceil(payload.file?.size / FILE_CHUNK_SIZE),
      });
    }
    const convState = await this.convMgr.receiveMessage({
      id: payload.id,
      roomID: payload.roomID,
      senderID: channel.id,
      content: payload.messageContent,
      type: payload.messageType,
      sentAt: new Date(payload.sendAt),
    });
    const conv = mapConversationFromState(mapChannelToUser(channel), convState);
    this.logger.debug('publish on receive message', conv);
    channel._onReceiveMessage.next(conv);
    // aknowledge file receivement
    await this.receiveMessage(channel, {
      id: payload.id,
    });
  }

  async receiveMessage(
    channel: UserChannel,
    payload: MessageReceivedPayload
  ): Promise<void> {
    this.logger.debug('confirm message receival', payload);
    await this.send(channel, {
      type: MessagingType.MessageReceived,
      payload,
    });
  }

  async onMessageReceived(
    channel: UserChannel,
    payload: MessageReceivedPayload
  ): Promise<void> {
    this.logger.debug('message received by', channel.id, payload.id);
    const convState = await this.convMgr.messageReceived({
      id: payload.id,
      receivedBy: channel.id,
    });
    const conv = mapConversationFromState(mapChannelToUser(channel), convState);
    this.logger.debug('publish on message received', conv);
    channel._onMessageReceived.next(conv);
  }

  async readMessage(
    channel: UserChannel,
    payload: MessageReadPayload
  ): Promise<void> {
    await this.convMgr.readMessage({
      id: payload.id,
    });
    this.logger.debug('read message', payload);
    await this.send(channel, {
      type: MessagingType.MessageRead,
      payload,
    });
  }

  async onMessageRead(
    channel: UserChannel,
    payload: MessageReadPayload
  ): Promise<void> {
    this.logger.debug('message read by', channel.id, payload.id);
    const convState = await this.convMgr.messageRead({
      id: payload.id,
      readerID: channel.id,
    });
    const conv = mapConversationFromState(mapChannelToUser(channel), convState);
    this.logger.debug('publish on message read', conv);
    channel._onMessageRead.next(conv);
  }

  // send file sequences
  async requestFile(
    channel: UserChannel,
    payload: FileRequestPayload
  ): Promise<void> {
    this.logger.debug('request file transfer', channel.id, payload);
    await this.send(channel, {
      type: MessagingType.FileRequest,
      payload,
    });
  }

  async onFileRequest(
    channel: UserChannel,
    payload: FileRequestPayload
  ): Promise<void> {
    // calculate file chunks
    let fileState = await this.convMgr.getFile(payload.id);
    const chunkSize = FILE_CHUNK_SIZE;
    const numberOfChunk = Math.ceil(fileState.size / chunkSize);
    // start file transfer
    await this.startFileTransfer(channel, {
      id: fileState.id,
      size: fileState.size,
      chunkSize,
      numberOfChunk,
    });
    // send each chunk of file
    for (let i = 0; i < numberOfChunk; i++) {
      const offset = (i + 1) * chunkSize;
      const chunk = fileState.binary.slice(
        i * chunkSize,
        offset >= fileState.size ? fileState.size : offset
      );
      await this.sendFileChunk(channel, {
        id: fileState.id,
        chunkIndex: i,
        chunk: ab2str(chunk),
      });
      // add 50ms delay to avoid data brutes
      await delay(50);
    }
    // all file finish transferred
    this.logger.debug('all file transferred', channel.id, payload);
    fileState = await this.convMgr.fileTransferred({
      id: payload.id,
      to: channel.id,
    });
    const file = mapFileContentFromState(fileState);
    channel._onFileTransferEnd.next(file);
  }

  async startFileTransfer(
    channel: UserChannel,
    payload: FileStartPayload
  ): Promise<void> {
    this.logger.debug('start file transfer', channel.id, payload);
    await this.send(channel, {
      type: MessagingType.FileStart,
      payload,
    });
  }

  async onFileTransferStart(
    channel: UserChannel,
    payload: FileStartPayload
  ): Promise<void> {
    this.logger.debug('request file transfer started', channel.id, payload);
    const fileState = await this.convMgr.getFile(payload.id);
    const file = mapFileContentFromState(fileState);
    this.logger.debug('publish start file transfer', file);
    channel._onFileTransferStart.next(file);
  }

  async sendFileChunk(
    channel: UserChannel,
    payload: FileChunkPayload
  ): Promise<void> {
    this.logger.debug('sending file chunk', channel.id, payload);
    await this.send(channel, {
      type: MessagingType.FileChunk,
      payload,
    });
  }

  async onReceiveFileChunk(
    channel: UserChannel,
    payload: FileChunkPayload
  ): Promise<void> {
    // get current state
    let fileState = await this.convMgr.getFile(payload.id);
    if (fileState.chunks?.length === fileState.numberOfChunks) {
      // all chunk already downloaded
      return null;
    }
    fileState = await this.convMgr.receiveFileChunk({
      id: payload.id,
      chunkIndex: payload.chunkIndex,
      chunk: str2ab(payload.chunk),
    });
    let file = mapFileContentFromState(fileState);
    channel._onReceiveFileChunk.next(file);
    // all chunk transfered
    if (file.downloaded >= 1) {
      this.logger.debug('all file chunk received', file);
      // avoid data race
      if (fileState.binary) {
        return;
      }
      fileState = await this.convMgr.allFileChunkReceived({
        id: payload.id,
      });
      file = mapFileContentFromState(fileState);
      channel._onFileTransferEnd.next(file);
    }
  }

  async typing(channel: UserChannel, payload: TypingPayload): Promise<void> {
    await this.send(channel, {
      type: MessagingType.Typing,
      payload,
    });
  }

  onUserType(channel: UserChannel, payload: TypingPayload): Promise<void> {
    this.logger.debug('publish user typing', channel.id, payload);
    channel._onUserTyping.next({
      user: {
        id: channel.id,
        name: channel.name,
        photo: channel.photo,
        online: channel.sendChannelReady,
      },
      roomID: payload.roomID,
    });
    return Promise.resolve();
  }
}

export function mapFileContentFromState(state: FileState): FileContent {
  let downloaded = (state?.chunks?.length || 0) / (state?.numberOfChunks || 1);
  if (!state?.numberOfChunks) {
    downloaded = 1;
  }
  return {
    id: state?.id,
    name: state?.name,
    createdAt: state?.createdAt,
    size: state?.size,
    type: state?.type,
    binary: state?.binary,
    downloaded,
  } as FileContent;
}

export function mapChannelToUser(channel: UserChannel): User {
  return {
    id: channel.id,
    name: channel.name,
    photo: channel.photo,
    online: channel.sendChannelReady,
  };
}

export function mapConversationFromState(
  sender: User,
  state: ConversationState
): Conversation {
  // set conversation status
  let status: ConversationStatus;
  if (!state.isReceiver) {
    if (state.errorCode || state.errorMessage) {
      status = ConversationStatus.FAILED;
    } else if (state.readBy?.length > 0) {
      status = ConversationStatus.READ;
    } else if (state.receivedBy?.length > 0) {
      status = ConversationStatus.RECEIVED;
    } else {
      status = ConversationStatus.SENT;
    }
  }
  if (state.isReceiver) {
    if (state.read) {
      status = ConversationStatus.READ;
    } else {
      status = ConversationStatus.RECEIVED;
    }
  }

  let content: string | FileContent = '';

  switch (state.messageType) {
    case MessageType.FILE:
    case MessageType.IMAGE: {
      content = mapFileContentFromState(state.messageBinary);
      break;
    }
    case MessageType.MESSAGE:
      content = state.messageText;
      break;
  }

  return {
    id: state.id,
    roomID: state.roomID,
    isReceiver: state.isReceiver,
    message: {
      type: state.messageType,
      content,
    },
    sendAt: state.sendAt,
    sender,
    status,
  } as Conversation;
}

function ab2str(buf: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function str2ab(str: string): ArrayBuffer {
  const binaryString = window.atob(str);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
