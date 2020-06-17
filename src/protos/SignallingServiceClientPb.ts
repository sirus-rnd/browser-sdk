/**
 * @fileoverview gRPC-Web generated client stub for protos
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


import * as grpcWeb from 'grpc-web';

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';

import {
  GetRoomParam,
  GetUserParam,
  Heartbeat,
  ICEOffer,
  ICEParam,
  NewRoomParam,
  NewUserParam,
  OnlineStatus,
  PaginationParam,
  Profile,
  Room,
  RoomEvent,
  Rooms,
  SDP,
  SDPParam,
  UpdateProfileParam,
  UpdateRoomProfileParam,
  UpdateUserProfileParam,
  User,
  UserAccessToken,
  UserRoomParam,
  Users} from './signalling_pb';

export class RoomManagementServiceClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: string; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: string; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodInfoRegisterUser = new grpcWeb.AbstractClientBase.MethodInfo(
    User,
    (request: NewUserParam) => {
      return request.serializeBinary();
    },
    User.deserializeBinary
  );

  registerUser(
    request: NewUserParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: User) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/RegisterUser',
      request,
      metadata || {},
      this.methodInfoRegisterUser,
      callback);
  }

  methodInfoGetUser = new grpcWeb.AbstractClientBase.MethodInfo(
    User,
    (request: GetUserParam) => {
      return request.serializeBinary();
    },
    User.deserializeBinary
  );

  getUser(
    request: GetUserParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: User) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/GetUser',
      request,
      metadata || {},
      this.methodInfoGetUser,
      callback);
  }

  methodInfoGetUsers = new grpcWeb.AbstractClientBase.MethodInfo(
    Users,
    (request: PaginationParam) => {
      return request.serializeBinary();
    },
    Users.deserializeBinary
  );

  getUsers(
    request: PaginationParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Users) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/GetUsers',
      request,
      metadata || {},
      this.methodInfoGetUsers,
      callback);
  }

  methodInfoGetUserAccessToken = new grpcWeb.AbstractClientBase.MethodInfo(
    UserAccessToken,
    (request: GetUserParam) => {
      return request.serializeBinary();
    },
    UserAccessToken.deserializeBinary
  );

  getUserAccessToken(
    request: GetUserParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: UserAccessToken) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/GetUserAccessToken',
      request,
      metadata || {},
      this.methodInfoGetUserAccessToken,
      callback);
  }

  methodInfoUpdateUserProfile = new grpcWeb.AbstractClientBase.MethodInfo(
    User,
    (request: UpdateUserProfileParam) => {
      return request.serializeBinary();
    },
    User.deserializeBinary
  );

  updateUserProfile(
    request: UpdateUserProfileParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: User) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/UpdateUserProfile',
      request,
      metadata || {},
      this.methodInfoUpdateUserProfile,
      callback);
  }

  methodInfoRemoveUser = new grpcWeb.AbstractClientBase.MethodInfo(
    User,
    (request: GetUserParam) => {
      return request.serializeBinary();
    },
    User.deserializeBinary
  );

  removeUser(
    request: GetUserParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: User) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/RemoveUser',
      request,
      metadata || {},
      this.methodInfoRemoveUser,
      callback);
  }

  methodInfoCreateRoom = new grpcWeb.AbstractClientBase.MethodInfo(
    Room,
    (request: NewRoomParam) => {
      return request.serializeBinary();
    },
    Room.deserializeBinary
  );

  createRoom(
    request: NewRoomParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Room) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/CreateRoom',
      request,
      metadata || {},
      this.methodInfoCreateRoom,
      callback);
  }

  methodInfoGetRoom = new grpcWeb.AbstractClientBase.MethodInfo(
    Room,
    (request: GetRoomParam) => {
      return request.serializeBinary();
    },
    Room.deserializeBinary
  );

  getRoom(
    request: GetRoomParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Room) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/GetRoom',
      request,
      metadata || {},
      this.methodInfoGetRoom,
      callback);
  }

  methodInfoGetRooms = new grpcWeb.AbstractClientBase.MethodInfo(
    Rooms,
    (request: PaginationParam) => {
      return request.serializeBinary();
    },
    Rooms.deserializeBinary
  );

  getRooms(
    request: PaginationParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Rooms) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/GetRooms',
      request,
      metadata || {},
      this.methodInfoGetRooms,
      callback);
  }

  methodInfoUpdateRoomProfile = new grpcWeb.AbstractClientBase.MethodInfo(
    Room,
    (request: UpdateRoomProfileParam) => {
      return request.serializeBinary();
    },
    Room.deserializeBinary
  );

  updateRoomProfile(
    request: UpdateRoomProfileParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Room) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/UpdateRoomProfile',
      request,
      metadata || {},
      this.methodInfoUpdateRoomProfile,
      callback);
  }

  methodInfoAddUserToRoom = new grpcWeb.AbstractClientBase.MethodInfo(
    Room,
    (request: UserRoomParam) => {
      return request.serializeBinary();
    },
    Room.deserializeBinary
  );

  addUserToRoom(
    request: UserRoomParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Room) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/AddUserToRoom',
      request,
      metadata || {},
      this.methodInfoAddUserToRoom,
      callback);
  }

  methodInfoKickUserFromRoom = new grpcWeb.AbstractClientBase.MethodInfo(
    Room,
    (request: UserRoomParam) => {
      return request.serializeBinary();
    },
    Room.deserializeBinary
  );

  kickUserFromRoom(
    request: UserRoomParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Room) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/KickUserFromRoom',
      request,
      metadata || {},
      this.methodInfoKickUserFromRoom,
      callback);
  }

  methodInfoDestroyRoom = new grpcWeb.AbstractClientBase.MethodInfo(
    Room,
    (request: GetRoomParam) => {
      return request.serializeBinary();
    },
    Room.deserializeBinary
  );

  destroyRoom(
    request: GetRoomParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Room) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.RoomManagementService/DestroyRoom',
      request,
      metadata || {},
      this.methodInfoDestroyRoom,
      callback);
  }

}

export class SignalingServiceClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: string; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: string; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodInfoGetProfile = new grpcWeb.AbstractClientBase.MethodInfo(
    Profile,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    Profile.deserializeBinary
  );

  getProfile(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Profile) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.SignalingService/GetProfile',
      request,
      metadata || {},
      this.methodInfoGetProfile,
      callback);
  }

  methodInfoUpdateProfile = new grpcWeb.AbstractClientBase.MethodInfo(
    Profile,
    (request: UpdateProfileParam) => {
      return request.serializeBinary();
    },
    Profile.deserializeBinary
  );

  updateProfile(
    request: UpdateProfileParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Profile) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.SignalingService/UpdateProfile',
      request,
      metadata || {},
      this.methodInfoUpdateProfile,
      callback);
  }

  methodInfoGetMyRooms = new grpcWeb.AbstractClientBase.MethodInfo(
    Rooms,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    Rooms.deserializeBinary
  );

  getMyRooms(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Rooms) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.SignalingService/GetMyRooms',
      request,
      metadata || {},
      this.methodInfoGetMyRooms,
      callback);
  }

  methodInfoGetRoom = new grpcWeb.AbstractClientBase.MethodInfo(
    Room,
    (request: GetRoomParam) => {
      return request.serializeBinary();
    },
    Room.deserializeBinary
  );

  getRoom(
    request: GetRoomParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: Room) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.SignalingService/GetRoom',
      request,
      metadata || {},
      this.methodInfoGetRoom,
      callback);
  }

  methodInfoGetUser = new grpcWeb.AbstractClientBase.MethodInfo(
    User,
    (request: GetUserParam) => {
      return request.serializeBinary();
    },
    User.deserializeBinary
  );

  getUser(
    request: GetUserParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: User) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.SignalingService/GetUser',
      request,
      metadata || {},
      this.methodInfoGetUser,
      callback);
  }

  methodInfoOfferSessionDescription = new grpcWeb.AbstractClientBase.MethodInfo(
    google_protobuf_empty_pb.Empty,
    (request: SDPParam) => {
      return request.serializeBinary();
    },
    google_protobuf_empty_pb.Empty.deserializeBinary
  );

  offerSessionDescription(
    request: SDPParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: google_protobuf_empty_pb.Empty) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.SignalingService/OfferSessionDescription',
      request,
      metadata || {},
      this.methodInfoOfferSessionDescription,
      callback);
  }

  methodInfoAnswerSessionDescription = new grpcWeb.AbstractClientBase.MethodInfo(
    google_protobuf_empty_pb.Empty,
    (request: SDPParam) => {
      return request.serializeBinary();
    },
    google_protobuf_empty_pb.Empty.deserializeBinary
  );

  answerSessionDescription(
    request: SDPParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: google_protobuf_empty_pb.Empty) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.SignalingService/AnswerSessionDescription',
      request,
      metadata || {},
      this.methodInfoAnswerSessionDescription,
      callback);
  }

  methodInfoSubscribeSDPCommand = new grpcWeb.AbstractClientBase.MethodInfo(
    SDP,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    SDP.deserializeBinary
  );

  subscribeSDPCommand(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata) {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/protos.SignalingService/SubscribeSDPCommand',
      request,
      metadata || {},
      this.methodInfoSubscribeSDPCommand);
  }

  methodInfoSubscribeRoomEvent = new grpcWeb.AbstractClientBase.MethodInfo(
    RoomEvent,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    RoomEvent.deserializeBinary
  );

  subscribeRoomEvent(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata) {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/protos.SignalingService/SubscribeRoomEvent',
      request,
      metadata || {},
      this.methodInfoSubscribeRoomEvent);
  }

  methodInfoSendICECandidate = new grpcWeb.AbstractClientBase.MethodInfo(
    google_protobuf_empty_pb.Empty,
    (request: ICEParam) => {
      return request.serializeBinary();
    },
    google_protobuf_empty_pb.Empty.deserializeBinary
  );

  sendICECandidate(
    request: ICEParam,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: google_protobuf_empty_pb.Empty) => void) {
    return this.client_.rpcCall(
      this.hostname_ +
        '/protos.SignalingService/SendICECandidate',
      request,
      metadata || {},
      this.methodInfoSendICECandidate,
      callback);
  }

  methodInfoSubscribeICECandidate = new grpcWeb.AbstractClientBase.MethodInfo(
    ICEOffer,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    ICEOffer.deserializeBinary
  );

  subscribeICECandidate(
    request: google_protobuf_empty_pb.Empty,
    metadata?: grpcWeb.Metadata) {
    return this.client_.serverStreaming(
      this.hostname_ +
        '/protos.SignalingService/SubscribeICECandidate',
      request,
      metadata || {},
      this.methodInfoSubscribeICECandidate);
  }

}

