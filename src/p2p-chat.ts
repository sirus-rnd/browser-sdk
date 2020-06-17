import { Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  photo: string;
  online: boolean;
}

export interface Room {
  id: string;
  name: string;
  photo: string;
  description: string;
  participants: User[];
}

export interface Conversation {
  id: string;
  isReceiver: boolean;
  roomID: string;
  sendAt: Date;
  message: Message;
  status: ConversationStatus;
  sender: User;
}

export interface Message {
  type: MessageType;
  content?: string | FileContent;
}

export interface FileContent {
  id: string;
  name: string;
  binary?: ArrayBuffer;
  size: number;
  type: string;
  downloaded: number;
}

export enum ConversationStatus {
  SENT,
  RECEIVED,
  READ,
  FAILED,
}

export enum MessageType {
  MESSAGE,
  FILE,
  IMAGE,
}

export interface UserInRoomEventPayload {
  roomID: string;
  user: User;
}

export interface IChatClient {
  profile: User;
  authenticated(): Promise<boolean>;
  login(token: string): Promise<User>;
  connect(): Promise<void>;
  reconnect(): Promise<void>;
  disconnect(): Promise<void>;
  myProfile(): Promise<User>;
  getRooms(): Promise<Room[]>;
  getConversations(
    roomID: string,
    skip: number,
    limit: number
  ): Promise<Conversation[]>;
  sendMessage(roomID: string, message: Message): Promise<Conversation>;
  readMessage(roomID: string, messageID: string): Promise<Conversation>;
  requestFile(id: string, startAt: number): Promise<void>;
  typing(roomID: string): Promise<void>;
  onUserConnected: Observable<string>; // user id
  onUserDisconnected: Observable<string>; // user id
  onMessageReceived: Observable<Conversation>;
  onMessageRead: Observable<Conversation>;
  onReceiveMessage: Observable<Conversation>;
  onUserTyping: Observable<UserInRoomEventPayload>;
  onRoomCreated: Observable<Room>;
  onRoomUpdated: Observable<Room>;
  onRoomDestroyed: Observable<Room>;
  onUserJoinRoom: Observable<UserInRoomEventPayload>;
  onUserLeftRoom: Observable<UserInRoomEventPayload>;
  onUserProfileUpdated: Observable<User>;
  onUserRemoved: Observable<User>;
  onFileTransferStart: Observable<FileContent>;
  onReceiveFileChunk: Observable<FileContent>;
  onFileTransferEnd: Observable<FileContent>;
}
