import { grpc } from '@improbable-eng/grpc-web';
import { ProtobufMessage } from '@improbable-eng/grpc-web/dist/typings/message';
import { Observable, merge, Subject } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Consola } from 'consola';
import { map } from 'rxjs/operators';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { IConversationStateManager, FileState } from './conversation-state';
import { IMessenger, FileInfo, mapConversationFromState } from './messaging';
import {
  IChatClient,
  User,
  Room,
  UserInRoomEventPayload,
  Conversation,
  Message,
  MessageType,
  FileContent,
} from './p2p-chat';
import { UserChannel } from './user-channel';
import { SignalingService } from './protos/signalling_pb_service';
import { SignalingServiceClient } from './protos/SignallingServiceClientPb';
import {
  Profile,
  Rooms,
  User as PBUser,
  RoomEvent,
  RoomEvents,
  SDP,
  ICECredentialType,
  ICEOffer,
  OnlineStatus,
  GetUserParam,
  Heartbeat,
} from './protos/signalling_pb';
import { delay } from 'bluebird';

export const ACCESS_KEY = 'access-token';

export class ChatClient implements IChatClient {
  profile: User;
  private iceServers: RTCIceServer[] = [];
  private channels: { [userID: string]: UserChannel } = {};
  private rooms: Rooms;
  // channel events
  onUserConnected: Observable<string> = new Observable(); // user id
  onUserDisconnected: Observable<string> = new Observable(); // user id
  // messaging events
  onMessageReceived: Observable<Conversation> = new Observable();
  onMessageRead: Observable<Conversation> = new Observable();
  onReceiveMessage: Observable<Conversation> = new Observable();
  onUserTyping: Observable<UserInRoomEventPayload> = new Observable();
  onFileTransferStart: Observable<FileContent> = new Observable();
  onReceiveFileChunk: Observable<FileContent> = new Observable();
  onFileTransferEnd: Observable<FileContent> = new Observable();
  // signalling request handler
  private sdpCommandSub: grpc.Request;
  private iceOfferSub: grpc.Request;
  private onlineStatusClient: grpc.Client<ProtobufMessage, ProtobufMessage>;
  private heartbeatTimeout: NodeJS.Timeout;
  // signalling events
  private _onRoomCreated = new Subject<Room>();
  private _onRoomUpdated = new Subject<Room>();
  private _onRoomDestroyed = new Subject<Room>();
  private _onUserJoinRoom = new Subject<UserInRoomEventPayload>();
  private _onUserLeftRoom = new Subject<UserInRoomEventPayload>();
  private _onUserProfileUpdated = new Subject<User>();
  private _onUserRemoved = new Subject<User>();
  onRoomCreated: Observable<Room> = this._onRoomCreated.asObservable();
  onRoomUpdated: Observable<Room> = this._onRoomUpdated.asObservable();
  onRoomDestroyed: Observable<Room> = this._onRoomDestroyed.asObservable();
  onUserJoinRoom: Observable<
    UserInRoomEventPayload
  > = this._onUserJoinRoom.asObservable();
  onUserLeftRoom: Observable<
    UserInRoomEventPayload
  > = this._onUserLeftRoom.asObservable();
  onUserProfileUpdated: Observable<
    User
  > = this._onUserProfileUpdated.asObservable();
  onUserRemoved: Observable<User> = this._onUserRemoved.asObservable();

  constructor(
    private signaling: SignalingServiceClient,
    private storage: any,
    private conversationManager: IConversationStateManager,
    private messenger: IMessenger,
    private logger: Consola
  ) {}

  async authenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) {
      return false;
    }
    return true;
  }

  private getAccessToken(): Promise<string> {
    return this.storage.getItem(ACCESS_KEY);
  }

  private async setAccessToken(token: string): Promise<void> {
    await this.storage.setItem(ACCESS_KEY, token);
  }

  async login(token: string): Promise<User> {
    // persist token
    await this.setAccessToken(token);

    // get signalling profile
    const profile = await new Promise<Profile>((resolve, reject) => {
      this.signaling.getProfile(new Empty(), { token }, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });

    // set our current profile
    return {
      id: profile.getId(),
      name: profile.getName(),
      photo: profile.getPhoto(),
      online: false,
    } as User;
  }

  async reconnect(): Promise<void> {
    const userIds = Object.keys(this.channels);
    // reconn to each channels
    this.profile.online = false;
    await Promise.all(
      userIds.map((id) => {
        if (this.channels[id]) {
          return this.channels[id].reconnect();
        }
      })
    );
    // set profile to online
    this.profile.online = true;
  }

  async connect(): Promise<void> {
    const token = await this.getAccessToken();
    // get signalling profile
    const profile = await new Promise<Profile>((resolve, reject) => {
      this.signaling.getProfile(new Empty(), { token }, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });

    this.profile = {
      id: profile.getId(),
      name: profile.getName(),
      photo: profile.getPhoto(),
      online: false,
    } as User;

    // set ICE server resolvers
    this.iceServers = profile.getServersList().map((raw) => {
      const server = raw.toObject();
      const ice = {
        urls: server.url,
      } as RTCIceServer;
      if (server.credentialtype !== ICECredentialType.NONE) {
        ice.username = server.username;
        switch (server.credentialtype) {
          case ICECredentialType.OAUTH:
            ice.credentialType = 'oauth';
            ice.credential = {
              macKey: server.mackey,
              accessToken: server.accesstoken,
            };
            break;
          case ICECredentialType.PASSWORD:
            ice.credentialType = 'password';
            ice.credential = server.password;
            break;
        }
      }
      return ice;
    });

    // get available rooms
    this.rooms = await new Promise<Rooms>((resolve, reject) => {
      this.signaling.getMyRooms(new Empty(), { token }, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });

    // subscribe room event to update user & room state
    await this.handleRoomEvents();

    // make channels & intiate SDP signaling
    await this.initSDPSignal();
    await this.initICEOfferSignal();
    await this.initOnlineStatus();

    // make channels
    await this.makeChannels(this.rooms);
    this.logger.debug('finish make channel');
    this.logger.debug('list of channel', Object.keys(this.channels));

    // connect to each user on the rooms
    await Promise.all(
      Object.keys(this.channels).map((id) => {
        this.logger.debug('is user online', id, this.channels[id]?.online);
        if (this.channels[id]?.online) {
          return this.channels[id].connect();
        }
      })
    );

    // set our current profile
    this.profile.online = true;
  }

  async myProfile(): Promise<User> {
    // get profile
    const token = await this.getAccessToken();
    const request = new Empty();
    const profile = await new Promise<Profile>((resolve, reject) => {
      this.signaling.getProfile(request, { token }, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });

    // return our current profile
    return {
      id: profile.getId(),
      name: profile.getName(),
      photo: profile.getPhoto(),
      online: true,
    } as User;
  }

  private async makeChannels(rooms: Rooms) {
    // get users id from each rooms
    const userIds: string[] = [];
    const users: PBUser[] = [];
    rooms.getRoomsList().forEach((room) => {
      room.getUsersList().forEach((user) => {
        const id = user.getId();
        // skip our own profile
        if (id === this.profile.id) {
          return null;
        }
        if (!userIds.includes(user.getId())) {
          userIds.push(id);
          users.push(user);
        }
      });
    });

    // create channel & handle channel events for each users
    const token = await this.getAccessToken();
    for (const user of users) {
      this.setupUserChannel(user.toObject(), token);
    }
  }

  private setupUserChannel(user: PBUser.AsObject, token: string) {
    const id = user.id;
    this.channels[id] = new UserChannel(
      id,
      user.name,
      user.photo,
      user.online,
      this.logger,
      token,
      this.signaling,
      this.iceServers
    );

    // handle receive message
    this.channels[id].onReceiveData.subscribe((event: MessageEvent) => {
      this.messenger.handleIncomingMessage(this.channels[id], event);
    });

    // resend pending messages
    this.channels[id].onConnected.subscribe(() => {
      this.messenger.resendPendingMessages(this.channels[id]);
    });

    // add each user connection event to central connection stream
    this.onUserConnected = merge(
      this.onUserConnected,
      this.channels[id].onConnected.pipe(map(() => id))
    );
    this.onUserDisconnected = merge(
      this.onUserDisconnected,
      this.channels[id].onDisconnected.pipe(map(() => id))
    );

    // hookup conversation state change
    this.onMessageReceived = merge(
      this.onMessageReceived,
      this.channels[id].onMessageReceived
    );
    this.onMessageRead = merge(
      this.onMessageRead,
      this.channels[id].onMessageRead
    );
    this.onReceiveMessage = merge(
      this.onReceiveMessage,
      this.channels[id].onReceiveMessage
    );

    // hook up file transfer change
    this.onFileTransferStart = merge(
      this.onFileTransferStart,
      this.channels[id].onFileTransferStart
    );
    this.onFileTransferEnd = merge(
      this.onFileTransferEnd,
      this.channels[id].onFileTransferEnd
    );
    this.onReceiveFileChunk = merge(
      this.onReceiveFileChunk,
      this.channels[id].onReceiveFileChunk
    );

    // user typing event stream
    this.onUserTyping = merge(
      this.onUserTyping,
      this.channels[id].onUserTyping
    );
  }

  private async destroyUserChannel(id: string) {
    await this.channels[id].disconnectSendChannel();
    await this.channels[id].disconnectReceivingChannel();
    delete this.channels[id];
  }

  private getUserbyID(id: string): User {
    let user: User = {
      id,
      name: id,
      photo: null,
      online: false,
    };
    if (id === this.profile.id) {
      user = this.profile;
    } else {
      const senderChannel = this.channels[id];
      if (senderChannel) {
        user = {
          id: senderChannel.id,
          name: senderChannel.name,
          photo: senderChannel.photo,
          online: senderChannel.sendChannelReady,
        };
      }
    }
    return user;
  }

  async disconnect() {
    const userIds = Object.keys(this.channels);
    // disconnect from all channel
    await Promise.all(
      userIds.map(async (id) => {
        await this.channels[id].disconnectSendChannel();
      })
    );
    // close signaling channel
    if (this.sdpCommandSub) {
      this.sdpCommandSub.close();
    }
    if (this.iceOfferSub) {
      this.iceOfferSub.close();
    }
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout);
    }
    if (this.onlineStatusClient) {
      this.onlineStatusClient.finishSend();
    }
    // remove access token
    await this.storage.removeItem(ACCESS_KEY);
    // clear conversation history
    await this.conversationManager.reset();
  }

  async getRooms(): Promise<Room[]> {
    // get profile
    const token = await this.getAccessToken();
    const request = new Empty();
    const rooms = await new Promise<Rooms>((resolve, reject) => {
      this.signaling.getMyRooms(request, { token }, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });

    // return our current profile
    return rooms.getRoomsList().map(
      (room) =>
        ({
          id: room.getId(),
          name: room.getName(),
          description: room.getDescription(),
          photo: room.getPhoto(),
          participants: room.getUsersList().map((user) => {
            const id = user.getId();
            const online = this.channels[id]
              ? this.channels[id].sendChannelReady
              : false;
            return {
              id,
              name: user.getName(),
              photo: user.getPhoto(),
              online,
            } as User;
          }),
        } as Room)
    );
  }

  async getConversations(
    roomID: string,
    skip: number,
    limit: number
  ): Promise<Conversation[]> {
    const states = await this.conversationManager.getConversations(
      roomID,
      limit,
      skip
    );

    return states.map((state) =>
      mapConversationFromState(this.getUserbyID(state.senderID), state)
    );
  }

  async sendMessage(roomID: string, message: Message): Promise<Conversation> {
    // get paricipant on this room id
    const room = this.rooms
      .getRoomsList()
      .find((room) => room.getId() === roomID);
    if (!room) {
      throw new Error('room not found!');
    }
    const participants = room.getUsersList().map((user) => user.getId());

    // when message are file, create file first
    const isBinary =
      message.type === MessageType.FILE || message.type === MessageType.IMAGE;
    let fileState: FileState;
    if (isBinary) {
      const file = message.content as FileContent;
      fileState = await this.conversationManager.newFile({
        id: file.id || uuid(),
        name: file.name,
        size: file.size,
        type: file.type,
        binary: file.binary,
      });
    }

    // create new conversation state
    let content = message.content as string;
    if (isBinary) {
      content = fileState?.id;
    }
    const convState = await this.conversationManager.sendMessage({
      id: uuid(),
      roomID,
      senderID: this.profile.id,
      content,
      type: message.type,
      participants,
    });

    // send message to all participants in room
    await Promise.all(
      participants.map((id) => {
        this.logger.debug('send message to participants', id);
        if (id === this.profile.id) {
          return;
        }
        if (!this.channels[id]) {
          return;
        }
        let file = null;
        let messageContent = message.content as string;
        if (isBinary) {
          const info = message.content as FileContent;
          messageContent = info.id;
          file = {
            name: info.name,
            size: info.size,
            type: info.type,
          } as FileInfo;
        }
        this.logger.debug('send message to', id);
        return this.messenger.sendMessage(this.channels[id], {
          id: convState.id,
          messageType: message.type,
          messageContent,
          roomID,
          sendAt: convState.sendAt,
          file,
        });
      })
    );

    return mapConversationFromState(
      this.getUserbyID(this.profile.id),
      convState
    );
  }

  async readMessage(
    roomID: string,
    conversationID: string
  ): Promise<Conversation> {
    // get paricipant on this room id
    const room = this.rooms
      .getRoomsList()
      .find((room) => room.getId() === roomID);
    if (!room) {
      throw new Error('room not found!');
    }
    const participants = room.getUsersList().map((user) => user.getId());

    // update read state
    await this.conversationManager.readMessage({
      id: conversationID,
    });

    await Promise.all(
      participants.map((id) => {
        if (!this.channels[id]) {
          return;
        }
        if (id === this.profile.id) {
          return;
        }
        return this.messenger.readMessage(this.channels[id], {
          id: conversationID,
        });
      })
    );
    const convState = await this.conversationManager.getConversation(
      conversationID
    );
    return mapConversationFromState(
      this.getUserbyID(convState.senderID),
      convState
    );
  }

  async typing(roomID: string): Promise<void> {
    // get paricipant on this room id
    const room = this.rooms
      .getRoomsList()
      .find((room) => room.getId() === roomID);
    if (!room) {
      throw new Error('room not found!');
    }
    const participants = room.getUsersList().map((user) => user.getId());
    await Promise.all(
      participants.map((id) => {
        if (!this.channels[id]) {
          return;
        }
        if (id === this.profile.id) {
          return;
        }
        // only send type status when ready
        if (!this.channels[id].sendChannelReady) {
          return;
        }
        return this.messenger.typing(this.channels[id], {
          roomID,
        });
      })
    );
  }

  async requestFile(id: string, startAt: number): Promise<void> {
    // get file id
    const fileState = await this.conversationManager.getFile(id);
    if (!this.channels[fileState.owner]) {
      throw new Error('file owner not found');
    }
    if (!this.channels[fileState.owner].receiveChannelReady) {
      throw new Error('file owner offline');
    }
    await this.messenger.requestFile(this.channels[fileState.owner], {
      id,
      startAt,
    });
  }

  private async initOnlineStatus() {
    this.logger.info('initiate online status signalling');
    const token = await this.getAccessToken();
    this.onlineStatusClient = grpc.client(
      SignalingService.SubscribeOnlineStatus,
      {
        host: this.signaling.hostname_,
        transport: grpc.WebsocketTransport(),
      }
    );
    this.onlineStatusClient.onMessage((data: OnlineStatus) => {
      const payload = data.toObject();
      const id = payload.id;
      this.logger.debug('user online status change', payload);
      if (!this.channels[id]) {
        return null;
      }
      // update online status
      this.channels[id].online = payload.online;
      // connect & disconnect based on online state
      try {
        if (payload.online) {
          this.channels[id].connect();
        } else {
          this.channels[id].disconnectSendChannel();
        }
      } catch (err) {
        this.logger.error(err);
      }
    });
    this.onlineStatusClient.onEnd(
      async (code: grpc.Code, msg: string | undefined, _: grpc.Metadata) => {
        if (code !== grpc.Code.OK) {
          this.logger.error('online status subscription closed', msg);
          // try to reconnect
          this.logger.debug('online status subscription closing, try to reconnect in 2 sec.');
          await delay(2000);
          await this.initOnlineStatus();
        }
      }
    );
    this.onlineStatusClient.start(new grpc.Metadata({ token }));
    this.heartbeatTimeout = setInterval(() => {
      const heartbeat = new Heartbeat();
      heartbeat.setBeat(true);
      this.logger.debug('send heartbeat');
      this.onlineStatusClient.send(heartbeat);
    }, 3000);
  }

  private async initICEOfferSignal() {
    this.logger.info('initiate ICE candidate signalling');
    const token = await this.getAccessToken();
    this.iceOfferSub = grpc.invoke(SignalingService.SubscribeICECandidate, {
      request: new Empty(),
      host: this.signaling.hostname_,
      metadata: { token },
      onMessage: (data: ICEOffer) => {
        const payload = data.toObject();
        const id = payload.senderid;
        this.channels[id].onICEOfferSignal(payload);
      },
      onEnd: async (code: grpc.Code, msg: string | undefined, _: grpc.Metadata) => {
        if (code !== grpc.Code.OK) {
          this.logger.error('ICE offer signal closed', msg);
          // try to reconnect
          this.logger.debug('ICE offer signal listener closing, try to reconnect in 2 sec.');
          await delay(2000);
          await this.initICEOfferSignal();
        }
      },
      transport: grpc.WebsocketTransport(),
    });
  }

  private async initSDPSignal() {
    this.logger.info('initiate SDP signalling');
    const token = await this.getAccessToken();
    this.sdpCommandSub = grpc.invoke(SignalingService.SubscribeSDPCommand, {
      request: new Empty(),
      host: this.signaling.hostname_,
      metadata: { token },
      onMessage: (data: SDP) => {
        const payload = data.toObject();
        const id = payload.senderid;
        this.channels[id].onReceiveSDP(payload);
      },
      onEnd: async (code: grpc.Code, msg: string | undefined, _: grpc.Metadata) => {
        if (code !== grpc.Code.OK) {
          this.logger.error('SDP signal closed', msg);
          // try to reconnect
          this.logger.debug('SDP signal listener closing, try to reconnect in 2 sec.');
          await delay(2000);
          await this.initSDPSignal();
        }
      },
      transport: grpc.WebsocketTransport(),
    });
  }

  async handleRoomEvents() {
    const token = await this.getAccessToken();
    grpc.invoke(SignalingService.SubscribeRoomEvent, {
      request: new Empty(),
      host: this.signaling.hostname_,
      metadata: { token },
      onMessage: async (data: RoomEvent) => {
        switch (data.getEvent()) {
          case RoomEvents.ROOMCREATED: {
            const payload = data.getRoominstance().toObject();
            this._onRoomCreated.next({
              id: payload.id,
              name: payload.name,
              description: payload.description,
              photo: payload.photo,
              participants: [],
            });
            break;
          }

          case RoomEvents.ROOMPROFILEUPDATED: {
            const payload = data.getRoominstance().toObject();
            this._onRoomUpdated.next({
              id: payload.id,
              name: payload.name,
              description: payload.description,
              photo: payload.photo,
              participants: [],
            });
            break;
          }

          case RoomEvents.ROOMDESTROYED: {
            const payload = data.getRoominstance().toObject();
            this._onRoomDestroyed.next({
              id: payload.id,
              name: payload.name,
              description: payload.description,
              photo: payload.photo,
              participants: [],
            });
            break;
          }

          case RoomEvents.USERJOINEDROOM: {
            const payload = data.getRoomparticipant().toObject();
            // setup user channel if channel not presents yet
            if (!this.channels[payload.participantid]) {
              // get user information
              const param = new GetUserParam();
              param.setId(payload.participantid);
              const token = await this.getAccessToken();
              const rawUser = await new Promise<PBUser>((resolve, reject) => {
                this.signaling.getUser(param, { token }, (err, response) => {
                  if (err) {
                    reject(err);
                  }
                  resolve(response);
                });
              });
              const user = rawUser.toObject();
              this.setupUserChannel(user, token);
              if (user.online) {
                this.channels[user.id].connect();
              }
            }

            this._onUserJoinRoom.next({
              roomID: payload.roomid,
              user: this.getUserbyID(payload.participantid),
            });
            break;
          }

          case RoomEvents.USERLEFTROOM: {
            const payload = data.getRoomparticipant().toObject();
            const user = this.getUserbyID(payload.participantid);
            // remove channel when user not have any room
            const chan = this.channels[payload.participantid];
            if (
              chan?.roomIDs?.includes(payload.roomid) &&
              chan?.roomIDs?.length === 1
            ) {
              this.destroyUserChannel(payload.participantid);
            }
            this._onUserLeftRoom.next({
              roomID: payload.roomid,
              user,
            });
            break;
          }

          case RoomEvents.USERPROFILEUPDATED: {
            const payload = data.getUserinstance().toObject();
            // update user profile data
            if (this.channels[payload.id]) {
              this.channels[payload.id].name = payload.name;
              this.channels[payload.id].photo = payload.photo;
            }
            const user = this.getUserbyID(payload.id);
            this._onUserProfileUpdated.next(user);
            break;
          }

          case RoomEvents.USERREMOVED: {
            const payload = data.getUserinstance().toObject();
            const user = this.getUserbyID(payload.id);
            this._onUserRemoved.next(user);
            // clean up
            if (this.channels[payload.id]) {
              this.destroyUserChannel(payload.id);
            }
            break;
          }
        }
      },
      onEnd: async (code: grpc.Code, msg: string | undefined, _: grpc.Metadata) => {
        if (code !== grpc.Code.OK) {
          this.logger.error('room event listener closed', msg);
          // try to reconnect
          this.logger.debug('room event listener closing, try to reconnect in 2 sec.');
          await delay(2000);
          await this.handleRoomEvents();
        }
      },
      transport: grpc.WebsocketTransport(),
    });
  }
}
