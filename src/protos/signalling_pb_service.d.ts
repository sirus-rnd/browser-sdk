// package: protos
// file: signalling.proto

import * as signalling_pb from "./signalling_pb";
import * as google_protobuf_empty_pb from "google-protobuf/google/protobuf/empty_pb";
import {grpc} from "@improbable-eng/grpc-web";

type RoomManagementServiceRegisterUser = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.NewUserParam;
  readonly responseType: typeof signalling_pb.User;
};

type RoomManagementServiceGetUser = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.GetUserParam;
  readonly responseType: typeof signalling_pb.User;
};

type RoomManagementServiceGetUsers = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.PaginationParam;
  readonly responseType: typeof signalling_pb.Users;
};

type RoomManagementServiceGetUserAccessToken = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.GetUserParam;
  readonly responseType: typeof signalling_pb.UserAccessToken;
};

type RoomManagementServiceUpdateUserProfile = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.UpdateUserProfileParam;
  readonly responseType: typeof signalling_pb.User;
};

type RoomManagementServiceRemoveUser = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.GetUserParam;
  readonly responseType: typeof signalling_pb.User;
};

type RoomManagementServiceCreateRoom = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.NewRoomParam;
  readonly responseType: typeof signalling_pb.Room;
};

type RoomManagementServiceGetRoom = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.GetRoomParam;
  readonly responseType: typeof signalling_pb.Room;
};

type RoomManagementServiceGetRooms = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.PaginationParam;
  readonly responseType: typeof signalling_pb.Rooms;
};

type RoomManagementServiceUpdateRoomProfile = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.UpdateRoomProfileParam;
  readonly responseType: typeof signalling_pb.Room;
};

type RoomManagementServiceAddUserToRoom = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.UserRoomParam;
  readonly responseType: typeof signalling_pb.Room;
};

type RoomManagementServiceKickUserFromRoom = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.UserRoomParam;
  readonly responseType: typeof signalling_pb.Room;
};

type RoomManagementServiceDestroyRoom = {
  readonly methodName: string;
  readonly service: typeof RoomManagementService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.GetRoomParam;
  readonly responseType: typeof signalling_pb.Room;
};

export class RoomManagementService {
  static readonly serviceName: string;
  static readonly RegisterUser: RoomManagementServiceRegisterUser;
  static readonly GetUser: RoomManagementServiceGetUser;
  static readonly GetUsers: RoomManagementServiceGetUsers;
  static readonly GetUserAccessToken: RoomManagementServiceGetUserAccessToken;
  static readonly UpdateUserProfile: RoomManagementServiceUpdateUserProfile;
  static readonly RemoveUser: RoomManagementServiceRemoveUser;
  static readonly CreateRoom: RoomManagementServiceCreateRoom;
  static readonly GetRoom: RoomManagementServiceGetRoom;
  static readonly GetRooms: RoomManagementServiceGetRooms;
  static readonly UpdateRoomProfile: RoomManagementServiceUpdateRoomProfile;
  static readonly AddUserToRoom: RoomManagementServiceAddUserToRoom;
  static readonly KickUserFromRoom: RoomManagementServiceKickUserFromRoom;
  static readonly DestroyRoom: RoomManagementServiceDestroyRoom;
}

type SignalingServiceGetProfile = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof google_protobuf_empty_pb.Empty;
  readonly responseType: typeof signalling_pb.Profile;
};

type SignalingServiceUpdateProfile = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.UpdateProfileParam;
  readonly responseType: typeof signalling_pb.Profile;
};

type SignalingServiceGetMyRooms = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof google_protobuf_empty_pb.Empty;
  readonly responseType: typeof signalling_pb.Rooms;
};

type SignalingServiceGetRoom = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.GetRoomParam;
  readonly responseType: typeof signalling_pb.Room;
};

type SignalingServiceGetUser = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.GetUserParam;
  readonly responseType: typeof signalling_pb.User;
};

type SignalingServiceOfferSessionDescription = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.SDPParam;
  readonly responseType: typeof google_protobuf_empty_pb.Empty;
};

type SignalingServiceAnswerSessionDescription = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.SDPParam;
  readonly responseType: typeof google_protobuf_empty_pb.Empty;
};

type SignalingServiceSubscribeSDPCommand = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof google_protobuf_empty_pb.Empty;
  readonly responseType: typeof signalling_pb.SDP;
};

type SignalingServiceSubscribeRoomEvent = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof google_protobuf_empty_pb.Empty;
  readonly responseType: typeof signalling_pb.RoomEvent;
};

type SignalingServiceSendICECandidate = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof signalling_pb.ICEParam;
  readonly responseType: typeof google_protobuf_empty_pb.Empty;
};

type SignalingServiceSubscribeICECandidate = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof google_protobuf_empty_pb.Empty;
  readonly responseType: typeof signalling_pb.ICEOffer;
};

type SignalingServiceSubscribeOnlineStatus = {
  readonly methodName: string;
  readonly service: typeof SignalingService;
  readonly requestStream: true;
  readonly responseStream: true;
  readonly requestType: typeof signalling_pb.Heartbeat;
  readonly responseType: typeof signalling_pb.OnlineStatus;
};

export class SignalingService {
  static readonly serviceName: string;
  static readonly GetProfile: SignalingServiceGetProfile;
  static readonly UpdateProfile: SignalingServiceUpdateProfile;
  static readonly GetMyRooms: SignalingServiceGetMyRooms;
  static readonly GetRoom: SignalingServiceGetRoom;
  static readonly GetUser: SignalingServiceGetUser;
  static readonly OfferSessionDescription: SignalingServiceOfferSessionDescription;
  static readonly AnswerSessionDescription: SignalingServiceAnswerSessionDescription;
  static readonly SubscribeSDPCommand: SignalingServiceSubscribeSDPCommand;
  static readonly SubscribeRoomEvent: SignalingServiceSubscribeRoomEvent;
  static readonly SendICECandidate: SignalingServiceSendICECandidate;
  static readonly SubscribeICECandidate: SignalingServiceSubscribeICECandidate;
  static readonly SubscribeOnlineStatus: SignalingServiceSubscribeOnlineStatus;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class RoomManagementServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  registerUser(
    requestMessage: signalling_pb.NewUserParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  registerUser(
    requestMessage: signalling_pb.NewUserParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  getUser(
    requestMessage: signalling_pb.GetUserParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  getUser(
    requestMessage: signalling_pb.GetUserParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  getUsers(
    requestMessage: signalling_pb.PaginationParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Users|null) => void
  ): UnaryResponse;
  getUsers(
    requestMessage: signalling_pb.PaginationParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Users|null) => void
  ): UnaryResponse;
  getUserAccessToken(
    requestMessage: signalling_pb.GetUserParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.UserAccessToken|null) => void
  ): UnaryResponse;
  getUserAccessToken(
    requestMessage: signalling_pb.GetUserParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.UserAccessToken|null) => void
  ): UnaryResponse;
  updateUserProfile(
    requestMessage: signalling_pb.UpdateUserProfileParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  updateUserProfile(
    requestMessage: signalling_pb.UpdateUserProfileParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  removeUser(
    requestMessage: signalling_pb.GetUserParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  removeUser(
    requestMessage: signalling_pb.GetUserParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  createRoom(
    requestMessage: signalling_pb.NewRoomParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  createRoom(
    requestMessage: signalling_pb.NewRoomParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  getRoom(
    requestMessage: signalling_pb.GetRoomParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  getRoom(
    requestMessage: signalling_pb.GetRoomParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  getRooms(
    requestMessage: signalling_pb.PaginationParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Rooms|null) => void
  ): UnaryResponse;
  getRooms(
    requestMessage: signalling_pb.PaginationParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Rooms|null) => void
  ): UnaryResponse;
  updateRoomProfile(
    requestMessage: signalling_pb.UpdateRoomProfileParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  updateRoomProfile(
    requestMessage: signalling_pb.UpdateRoomProfileParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  addUserToRoom(
    requestMessage: signalling_pb.UserRoomParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  addUserToRoom(
    requestMessage: signalling_pb.UserRoomParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  kickUserFromRoom(
    requestMessage: signalling_pb.UserRoomParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  kickUserFromRoom(
    requestMessage: signalling_pb.UserRoomParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  destroyRoom(
    requestMessage: signalling_pb.GetRoomParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  destroyRoom(
    requestMessage: signalling_pb.GetRoomParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
}

export class SignalingServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  getProfile(
    requestMessage: google_protobuf_empty_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Profile|null) => void
  ): UnaryResponse;
  getProfile(
    requestMessage: google_protobuf_empty_pb.Empty,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Profile|null) => void
  ): UnaryResponse;
  updateProfile(
    requestMessage: signalling_pb.UpdateProfileParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Profile|null) => void
  ): UnaryResponse;
  updateProfile(
    requestMessage: signalling_pb.UpdateProfileParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Profile|null) => void
  ): UnaryResponse;
  getMyRooms(
    requestMessage: google_protobuf_empty_pb.Empty,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Rooms|null) => void
  ): UnaryResponse;
  getMyRooms(
    requestMessage: google_protobuf_empty_pb.Empty,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Rooms|null) => void
  ): UnaryResponse;
  getRoom(
    requestMessage: signalling_pb.GetRoomParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  getRoom(
    requestMessage: signalling_pb.GetRoomParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.Room|null) => void
  ): UnaryResponse;
  getUser(
    requestMessage: signalling_pb.GetUserParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  getUser(
    requestMessage: signalling_pb.GetUserParam,
    callback: (error: ServiceError|null, responseMessage: signalling_pb.User|null) => void
  ): UnaryResponse;
  offerSessionDescription(
    requestMessage: signalling_pb.SDPParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: google_protobuf_empty_pb.Empty|null) => void
  ): UnaryResponse;
  offerSessionDescription(
    requestMessage: signalling_pb.SDPParam,
    callback: (error: ServiceError|null, responseMessage: google_protobuf_empty_pb.Empty|null) => void
  ): UnaryResponse;
  answerSessionDescription(
    requestMessage: signalling_pb.SDPParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: google_protobuf_empty_pb.Empty|null) => void
  ): UnaryResponse;
  answerSessionDescription(
    requestMessage: signalling_pb.SDPParam,
    callback: (error: ServiceError|null, responseMessage: google_protobuf_empty_pb.Empty|null) => void
  ): UnaryResponse;
  subscribeSDPCommand(requestMessage: google_protobuf_empty_pb.Empty, metadata?: grpc.Metadata): ResponseStream<signalling_pb.SDP>;
  subscribeRoomEvent(requestMessage: google_protobuf_empty_pb.Empty, metadata?: grpc.Metadata): ResponseStream<signalling_pb.RoomEvent>;
  sendICECandidate(
    requestMessage: signalling_pb.ICEParam,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: google_protobuf_empty_pb.Empty|null) => void
  ): UnaryResponse;
  sendICECandidate(
    requestMessage: signalling_pb.ICEParam,
    callback: (error: ServiceError|null, responseMessage: google_protobuf_empty_pb.Empty|null) => void
  ): UnaryResponse;
  subscribeICECandidate(requestMessage: google_protobuf_empty_pb.Empty, metadata?: grpc.Metadata): ResponseStream<signalling_pb.ICEOffer>;
  subscribeOnlineStatus(metadata?: grpc.Metadata): BidirectionalStream<signalling_pb.Heartbeat, signalling_pb.OnlineStatus>;
}

