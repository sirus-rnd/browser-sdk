import { v4 as uuid } from 'uuid';
import { schema, Type, Database, Order } from 'lovefield';
import { MessageType } from './p2p-chat';

export enum ChatAction {
  SendMessage = 'send',
  MessageSent = 'sent',
  MessageFailedToSend = 'failed-to-send',
  ReceiveMessage = 'receive',
  MessageReceived = 'received',
  MessageRead = 'read', // our message read
  ReadMessage = 'read-message', // read others message
  NewFile = 'file:new',
  FileReceived = 'file:received',
  FileChunkReceived = 'file:chunk-received',
  FileTransferred = 'file:transferred',
  FileTransferDone = 'file:transfer-done',
  FileDeleted = 'file:deleted',
}

export type ChatActionPayload =
  | MessageSendPayload
  | MessageSentPayload
  | MessageFailedToSendPayload
  | ReceiveMessagePayload
  | MessageReceivedPayload
  | MessageReadPayload
  | ReadMessagePayload
  | NewFilePayload
  | ReceiveFilePayload
  | ReceiveFileChunkPayload
  | TransferredFilePayload
  | DeletedFilePayload
  | FileChunkTransferFinishedPayload;

export interface ChatActionModel {
  time: Date;
  type: ChatAction;
  payload: ChatActionPayload;
}

export interface MessageSendPayload {
  id: string;
  roomID: string;
  senderID: string;
  type: MessageType;
  content: string;
  participants: string[];
}

export interface MessageSentPayload {
  id: string;
  receiverID: string;
}

export interface MessageFailedToSendPayload {
  id: string;
  errorCode: number;
  errorMessage: string;
}

export interface ReceiveMessagePayload {
  id: string;
  roomID: string;
  senderID: string;
  type: MessageType;
  sentAt: Date;
  content: string;
}

export interface MessageReceivedPayload {
  id: string;
  receivedBy: string;
}

export interface MessageReadPayload {
  id: string;
  readerID: string;
}

export interface ReadMessagePayload {
  id: string;
}

export interface NewFilePayload {
  id: string;
  name: string;
  binary: ArrayBuffer;
  size: number;
  type: string;
}

export interface ReceiveFilePayload {
  id: string;
  owner: string;
  name: string;
  size: number;
  type: string;
  numberOfChunks: number;
}

export interface ReceiveFileChunkPayload {
  id: string;
  chunkIndex: number;
  chunk: ArrayBuffer;
}

export interface TransferredFilePayload {
  id: string;
  to: string;
}

export interface DeletedFilePayload {
  id: string;
}

export interface FileChunkTransferFinishedPayload {
  id: string;
}

export interface ConversationState {
  id: string;
  isReceiver: boolean;
  roomID: string;
  senderID: string;
  sendAt: Date;
  messageType: MessageType;
  messageText?: string;
  messageBinary?: FileState;
  receivers?: string[];
  read?: boolean;
  readBy?: string[];
  receivedBy?: string[];
  errorCode?: number;
  errorMessage?: string;
}

export interface FileState {
  id: string;
  name: string;
  binary: ArrayBuffer;
  size: number;
  type: string;
  createdAt: Date;
  isOwner: boolean;
  owner?: string;
  numberOfChunks?: number;
  chunks?: FileChunk[];
  transferredTo?: string[];
}

export interface FileChunk {
  index: number;
  binary: ArrayBuffer;
}

export interface IConversationStateManager {
  reset(): Promise<void>;
  getConversations(
    roomID: string,
    limit: number,
    skip: number
  ): Promise<ConversationState[]>;
  getConversation(id: string): Promise<ConversationState>;
  sendMessage(payload: MessageSendPayload): Promise<ConversationState>;
  failedToSend(payload: MessageFailedToSendPayload): Promise<ConversationState>;
  receiveMessage(payload: ReceiveMessagePayload): Promise<ConversationState>;
  readMessage(payload: ReadMessagePayload): Promise<ConversationState>;
  messageReceived(payload: MessageReceivedPayload): Promise<ConversationState>;
  messageRead(payload: MessageReadPayload): Promise<ConversationState>;
  getFile(id: string): Promise<FileState>;
  newFile(payload: NewFilePayload): Promise<FileState>;
  fileTransferred(payload: TransferredFilePayload): Promise<FileState>;
  receiveFile(payload: ReceiveFilePayload): Promise<FileState>;
  receiveFileChunk(payload: ReceiveFileChunkPayload): Promise<FileState>;
  allFileChunkReceived(
    payload: FileChunkTransferFinishedPayload
  ): Promise<FileState>;
  deleteFile(payload: DeletedFilePayload): Promise<FileState>;
}

export class ConversationManager implements IConversationStateManager {
  private db: Database;

  async init() {
    this.db = await this.connect();
  }

  async reset(): Promise<void> {
    const actionTable = this.db.getSchema().table('actions');
    const fileTable = this.db.getSchema().table('files');
    const convTable = this.db.getSchema().table('conversations');
    await this.db.delete().from(actionTable).exec();
    await this.db.delete().from(convTable).exec();
    await this.db.delete().from(fileTable).exec();
  }

  private connect(): Promise<Database> {
    const builder = schema.create('conversation-state', 1);

    builder
      .createTable('files')
      .addColumn('id', Type.STRING)
      .addColumn('name', Type.STRING)
      .addColumn('binary', Type.ARRAY_BUFFER)
      .addColumn('size', Type.NUMBER)
      .addColumn('type', Type.STRING)
      .addColumn('createdAt', Type.DATE_TIME)
      .addColumn('isOwner', Type.BOOLEAN)
      .addColumn('owner', Type.STRING)
      .addColumn('transferredTo', Type.OBJECT)
      .addColumn('chunks', Type.OBJECT)
      .addColumn('numberOfChunks', Type.OBJECT)
      .addPrimaryKey(['id'])
      .addNullable(['transferredTo', 'owner', 'chunks', 'numberOfChunks']);

    builder
      .createTable('conversations')
      .addColumn('id', Type.STRING)
      .addColumn('isReceiver', Type.BOOLEAN)
      .addColumn('roomID', Type.STRING)
      .addColumn('senderID', Type.STRING)
      .addColumn('sendAt', Type.DATE_TIME)
      .addColumn('messageType', Type.INTEGER)
      .addColumn('messageText', Type.STRING)
      .addColumn('messageBinary', Type.STRING)
      .addColumn('receivers', Type.OBJECT)
      .addColumn('read', Type.BOOLEAN)
      .addColumn('readBy', Type.OBJECT)
      .addColumn('receivedBy', Type.OBJECT)
      .addColumn('errorCode', Type.NUMBER)
      .addColumn('errorMessage', Type.STRING)
      .addPrimaryKey(['id'])
      .addForeignKey('fk_filesId', {
        local: 'messageBinary',
        ref: 'files.id',
      })
      .addIndex('idxSendAt', ['sendAt'], false, Order.DESC)
      .addNullable([
        'messageText',
        'messageBinary',
        'receivers',
        'read',
        'readBy',
        'receivedBy',
        'errorCode',
        'errorMessage',
      ]);

    builder
      .createTable('actions')
      .addColumn('id', Type.STRING)
      .addColumn('time', Type.DATE_TIME)
      .addColumn('type', Type.STRING)
      .addColumn('payload', Type.OBJECT)
      .addPrimaryKey(['id'])
      .addIndex('idxTime', ['time'], false, Order.DESC);

    // connect to database
    return builder.connect();
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }

  private async commitAction(
    action: ChatAction,
    payload: ChatActionPayload
  ): Promise<ChatActionModel> {
    const actionTable = this.db.getSchema().table('actions');
    const row = actionTable.createRow({
      id: uuid(),
      time: new Date(),
      type: action,
      payload,
    });
    const results = await this.db
      .insert()
      .into(actionTable)
      .values([row])
      .exec();
    if (results.length > 0) {
      return results[0] as ChatActionModel;
    }
    return null;
  }

  async getConversations(
    roomID: string,
    limit: number,
    skip: number
  ): Promise<ConversationState[]> {
    const convTable = this.db.getSchema().table('conversations');
    const fileTable = this.db.getSchema().table('files');
    const results = await this.db
      .select()
      .from(convTable)
      .leftOuterJoin(fileTable, fileTable.id.eq(convTable.messageBinary))
      .where(convTable.roomID.eq(roomID))
      .orderBy(convTable.sendAt, Order.DESC)
      .skip(skip)
      .limit(limit)
      .exec();
    return results.map((r: any) => {
      const conv = { ...r.conversations };
      conv.messageBinary = { ...r.files };
      return conv;
    });
  }

  async getConversation(id: string): Promise<ConversationState> {
    const convTable = this.db.getSchema().table('conversations');
    const fileTable = this.db.getSchema().table('files');
    const results = await this.db
      .select()
      .from(convTable)
      .leftOuterJoin(fileTable, fileTable.id.eq(convTable.messageBinary))
      .where(convTable.id.eq(id))
      .limit(1)
      .exec();
    if (results?.length > 0) {
      const r: any = results[0];
      const conv = { ...r.conversations };
      conv.messageBinary = { ...r.files };
      return conv;
    }
    return null;
  }

  async sendMessage(payload: MessageSendPayload): Promise<ConversationState> {
    const convTable = this.db.getSchema().table('conversations');
    const convState = {
      id: payload.id,
      isReceiver: false,
      roomID: payload.roomID,
      senderID: payload.senderID,
      sendAt: new Date(),
      messageType: payload.type,
      messageBinary: null,
      messageText: null,
      receivers: payload.participants,
      receivedBy: [],
      readBy: [],
    };
    switch (payload.type) {
      case MessageType.FILE:
      case MessageType.IMAGE:
        convState.messageBinary = payload.content;
        break;
      case MessageType.MESSAGE:
        convState.messageText = payload.content;
    }
    const row = convTable.createRow(convState);
    await this.db.insert().into(convTable).values([row]).exec();
    // commit send message action
    await this.commitAction(ChatAction.SendMessage, payload);
    return this.getConversation(payload.id);
  }

  async failedToSend(
    payload: MessageFailedToSendPayload
  ): Promise<ConversationState> {
    const convTable = this.db.getSchema().table('conversations');
    await this.db
      .update(convTable)
      .set(convTable.errorCode, payload.errorCode)
      .set(convTable.errorMessage, payload.errorMessage)
      .where(convTable.id.eq(payload.id))
      .exec();
    return this.getConversation(payload.id);
  }

  async receiveMessage(
    payload: ReceiveMessagePayload
  ): Promise<ConversationState> {
    const convTable = this.db.getSchema().table('conversations');
    const convState = {
      id: payload.id,
      isReceiver: true,
      roomID: payload.roomID,
      senderID: payload.senderID,
      sendAt: payload.sentAt,
      messageType: payload.type,
      messageBinary: null,
      messageText: null,
    };
    switch (payload.type) {
      case MessageType.FILE:
      case MessageType.IMAGE:
        convState.messageBinary = payload.content;
        break;
      case MessageType.MESSAGE:
        convState.messageText = payload.content;
    }
    const row = convTable.createRow(convState);
    await this.db.insertOrReplace().into(convTable).values([row]).exec();
    // commit receive message action
    await this.commitAction(ChatAction.ReceiveMessage, payload);
    return this.getConversation(payload.id);
  }

  async readMessage(payload: ReadMessagePayload): Promise<ConversationState> {
    const convTable = this.db.getSchema().table('conversations');
    const results = await this.db
      .update(convTable)
      .set(convTable.read, true)
      .where(convTable.id.eq(payload.id))
      .exec();
    // commit read message action
    await this.commitAction(ChatAction.ReadMessage, payload);
    if (results?.length > 0) {
      return results[0] as ConversationState;
    }
    return this.getConversation(payload.id);
  }

  async messageReceived(
    payload: MessageReceivedPayload
  ): Promise<ConversationState> {
    const convTable = this.db.getSchema().table('conversations');
    const convState = await this.getConversation(payload.id);
    convState.receivedBy = convState.receivedBy || [];
    convState.receivedBy.push(payload.receivedBy);
    await this.db
      .update(convTable)
      .set(convTable.receivedBy, convState.receivedBy)
      .where(convTable.id.eq(payload.id))
      .exec();
    // commit message received action
    await this.commitAction(ChatAction.MessageReceived, payload);
    return convState;
  }

  async messageRead(payload: MessageReadPayload): Promise<ConversationState> {
    const convTable = this.db.getSchema().table('conversations');
    const convState = await this.getConversation(payload.id);
    convState.readBy = convState.readBy || [];
    convState.readBy.push(payload.readerID);
    await this.db
      .update(convTable)
      .set(convTable.readBy, convState.readBy)
      .where(convTable.id.eq(payload.id))
      .exec();
    // commit message read action
    await this.commitAction(ChatAction.MessageRead, payload);
    return convState;
  }

  async getFile(id: string): Promise<FileState> {
    const fileTable = this.db.getSchema().table('files');
    const results = await this.db
      .select()
      .from(fileTable)
      .where(fileTable.id.eq(id))
      .limit(1)
      .exec();
    if (results?.length > 0) {
      return results[0] as FileState;
    }
    return null;
  }

  async newFile(payload: NewFilePayload): Promise<FileState> {
    const fileTable = this.db.getSchema().table('files');
    const fileState = {
      id: payload.id,
      name: payload.name,
      binary: payload.binary,
      size: payload.size,
      type: payload.type,
      createdAt: new Date(),
      isOwner: true,
      transferredTo: [],
    } as FileState;
    const row = fileTable.createRow(fileState);
    const results = await this.db
      .insertOrReplace()
      .into(fileTable)
      .values([row])
      .exec();
    // commit new file action
    await this.commitAction(ChatAction.NewFile, payload);
    if (results?.length > 0) {
      return results[0] as FileState;
    }
    return null;
  }

  async fileTransferred(payload: TransferredFilePayload): Promise<FileState> {
    const fileTable = this.db.getSchema().table('files');
    const fileState = await this.getFile(payload.id);
    fileState.transferredTo = fileState.transferredTo || [];
    fileState.transferredTo.push(payload.to);
    await this.db
      .update(fileTable)
      .set(fileTable.transferredTo, fileState.transferredTo)
      .where(fileTable.id.eq(payload.id))
      .exec();
    // commit file transferred action
    await this.commitAction(ChatAction.FileTransferred, payload);
    return fileState;
  }

  async allFileChunkReceived(
    payload: FileChunkTransferFinishedPayload
  ): Promise<FileState> {
    const fileTable = this.db.getSchema().table('files');
    const fileState = await this.getFile(payload.id);
    // binary already received
    if (fileState.binary) {
      return fileState;
    }
    const chunks = fileState.chunks.sort((a, b) => a.index - b.index);
    const buffers = chunks.map((c) => c.binary);
    const blob = new Blob(buffers);
    fileState.binary = await blob.arrayBuffer();
    fileState.chunks = [];
    fileState.numberOfChunks = 0;
    await this.db
      .update(fileTable)
      .set(fileTable.binary, fileState.binary)
      .set(fileTable.chunks, [])
      .set(fileTable.numberOfChunks, 0)
      .where(fileTable.id.eq(payload.id))
      .exec();
    // commit file transferred action
    await this.commitAction(ChatAction.FileTransferDone, payload);
    return fileState;
  }

  async receiveFile(payload: ReceiveFilePayload): Promise<FileState> {
    const fileTable = this.db.getSchema().table('files');
    const fileState = {
      id: payload.id,
      name: payload.name,
      binary: null,
      size: payload.size,
      type: payload.type,
      createdAt: new Date(),
      isOwner: false,
      owner: payload.owner,
      chunks: [],
      numberOfChunks: payload.numberOfChunks,
    } as FileState;
    const row = fileTable.createRow(fileState);
    const results = await this.db
      .insertOrReplace()
      .into(fileTable)
      .values([row])
      .exec();
    // commit new file action
    await this.commitAction(ChatAction.FileReceived, payload);
    if (results?.length > 0) {
      return results[0] as FileState;
    }
    return null;
  }

  async receiveFileChunk(payload: ReceiveFileChunkPayload): Promise<FileState> {
    const fileTable = this.db.getSchema().table('files');
    const fileState = await this.getFile(payload.id);
    const chunks: FileChunk[] = fileState.chunks || [];

    // when file already have this chunk, no need to update file state
    const hasChunk = chunks.findIndex((c) => c.index === payload.chunkIndex);
    if (hasChunk > -1) {
      return fileState;
    }

    // add new chunks
    chunks.push({
      index: payload.chunkIndex,
      binary: payload.chunk,
    });
    fileState.chunks = chunks;
    await this.db
      .update(fileTable)
      .set(fileTable.chunks, chunks)
      .where(fileTable.id.eq(payload.id))
      .exec();
    // commit file transferred action
    await this.commitAction(ChatAction.FileChunkReceived, payload);
    return fileState;
  }

  async deleteFile(payload: DeletedFilePayload): Promise<FileState> {
    const fileTable = this.db.getSchema().table('files');
    const results = await this.db
      .delete()
      .where(fileTable.id.eq(payload.id))
      .exec();
    if (results?.length > 0) {
      return results[0] as FileState;
    }
    return null;
  }
}
