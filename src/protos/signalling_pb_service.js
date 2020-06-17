// package: protos
// file: signalling.proto

var signalling_pb = require("./signalling_pb");
var google_protobuf_empty_pb = require("google-protobuf/google/protobuf/empty_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var RoomManagementService = (function () {
  function RoomManagementService() {}
  RoomManagementService.serviceName = "protos.RoomManagementService";
  return RoomManagementService;
}());

RoomManagementService.RegisterUser = {
  methodName: "RegisterUser",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.NewUserParam,
  responseType: signalling_pb.User
};

RoomManagementService.GetUser = {
  methodName: "GetUser",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.GetUserParam,
  responseType: signalling_pb.User
};

RoomManagementService.GetUsers = {
  methodName: "GetUsers",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.PaginationParam,
  responseType: signalling_pb.Users
};

RoomManagementService.GetUserAccessToken = {
  methodName: "GetUserAccessToken",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.GetUserParam,
  responseType: signalling_pb.UserAccessToken
};

RoomManagementService.UpdateUserProfile = {
  methodName: "UpdateUserProfile",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.UpdateUserProfileParam,
  responseType: signalling_pb.User
};

RoomManagementService.RemoveUser = {
  methodName: "RemoveUser",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.GetUserParam,
  responseType: signalling_pb.User
};

RoomManagementService.CreateRoom = {
  methodName: "CreateRoom",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.NewRoomParam,
  responseType: signalling_pb.Room
};

RoomManagementService.GetRoom = {
  methodName: "GetRoom",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.GetRoomParam,
  responseType: signalling_pb.Room
};

RoomManagementService.GetRooms = {
  methodName: "GetRooms",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.PaginationParam,
  responseType: signalling_pb.Rooms
};

RoomManagementService.UpdateRoomProfile = {
  methodName: "UpdateRoomProfile",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.UpdateRoomProfileParam,
  responseType: signalling_pb.Room
};

RoomManagementService.AddUserToRoom = {
  methodName: "AddUserToRoom",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.UserRoomParam,
  responseType: signalling_pb.Room
};

RoomManagementService.KickUserFromRoom = {
  methodName: "KickUserFromRoom",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.UserRoomParam,
  responseType: signalling_pb.Room
};

RoomManagementService.DestroyRoom = {
  methodName: "DestroyRoom",
  service: RoomManagementService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.GetRoomParam,
  responseType: signalling_pb.Room
};

exports.RoomManagementService = RoomManagementService;

function RoomManagementServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

RoomManagementServiceClient.prototype.registerUser = function registerUser(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.RegisterUser, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.getUser = function getUser(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.GetUser, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.getUsers = function getUsers(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.GetUsers, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.getUserAccessToken = function getUserAccessToken(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.GetUserAccessToken, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.updateUserProfile = function updateUserProfile(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.UpdateUserProfile, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.removeUser = function removeUser(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.RemoveUser, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.createRoom = function createRoom(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.CreateRoom, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.getRoom = function getRoom(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.GetRoom, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.getRooms = function getRooms(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.GetRooms, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.updateRoomProfile = function updateRoomProfile(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.UpdateRoomProfile, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.addUserToRoom = function addUserToRoom(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.AddUserToRoom, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.kickUserFromRoom = function kickUserFromRoom(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.KickUserFromRoom, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

RoomManagementServiceClient.prototype.destroyRoom = function destroyRoom(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(RoomManagementService.DestroyRoom, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.RoomManagementServiceClient = RoomManagementServiceClient;

var SignalingService = (function () {
  function SignalingService() {}
  SignalingService.serviceName = "protos.SignalingService";
  return SignalingService;
}());

SignalingService.GetProfile = {
  methodName: "GetProfile",
  service: SignalingService,
  requestStream: false,
  responseStream: false,
  requestType: google_protobuf_empty_pb.Empty,
  responseType: signalling_pb.Profile
};

SignalingService.UpdateProfile = {
  methodName: "UpdateProfile",
  service: SignalingService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.UpdateProfileParam,
  responseType: signalling_pb.Profile
};

SignalingService.GetMyRooms = {
  methodName: "GetMyRooms",
  service: SignalingService,
  requestStream: false,
  responseStream: false,
  requestType: google_protobuf_empty_pb.Empty,
  responseType: signalling_pb.Rooms
};

SignalingService.GetRoom = {
  methodName: "GetRoom",
  service: SignalingService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.GetRoomParam,
  responseType: signalling_pb.Room
};

SignalingService.GetUser = {
  methodName: "GetUser",
  service: SignalingService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.GetUserParam,
  responseType: signalling_pb.User
};

SignalingService.OfferSessionDescription = {
  methodName: "OfferSessionDescription",
  service: SignalingService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.SDPParam,
  responseType: google_protobuf_empty_pb.Empty
};

SignalingService.AnswerSessionDescription = {
  methodName: "AnswerSessionDescription",
  service: SignalingService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.SDPParam,
  responseType: google_protobuf_empty_pb.Empty
};

SignalingService.SubscribeSDPCommand = {
  methodName: "SubscribeSDPCommand",
  service: SignalingService,
  requestStream: false,
  responseStream: true,
  requestType: google_protobuf_empty_pb.Empty,
  responseType: signalling_pb.SDP
};

SignalingService.SubscribeRoomEvent = {
  methodName: "SubscribeRoomEvent",
  service: SignalingService,
  requestStream: false,
  responseStream: true,
  requestType: google_protobuf_empty_pb.Empty,
  responseType: signalling_pb.RoomEvent
};

SignalingService.SendICECandidate = {
  methodName: "SendICECandidate",
  service: SignalingService,
  requestStream: false,
  responseStream: false,
  requestType: signalling_pb.ICEParam,
  responseType: google_protobuf_empty_pb.Empty
};

SignalingService.SubscribeICECandidate = {
  methodName: "SubscribeICECandidate",
  service: SignalingService,
  requestStream: false,
  responseStream: true,
  requestType: google_protobuf_empty_pb.Empty,
  responseType: signalling_pb.ICEOffer
};

SignalingService.SubscribeOnlineStatus = {
  methodName: "SubscribeOnlineStatus",
  service: SignalingService,
  requestStream: true,
  responseStream: true,
  requestType: signalling_pb.Heartbeat,
  responseType: signalling_pb.OnlineStatus
};

exports.SignalingService = SignalingService;

function SignalingServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

SignalingServiceClient.prototype.getProfile = function getProfile(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SignalingService.GetProfile, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.updateProfile = function updateProfile(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SignalingService.UpdateProfile, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.getMyRooms = function getMyRooms(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SignalingService.GetMyRooms, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.getRoom = function getRoom(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SignalingService.GetRoom, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.getUser = function getUser(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SignalingService.GetUser, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.offerSessionDescription = function offerSessionDescription(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SignalingService.OfferSessionDescription, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.answerSessionDescription = function answerSessionDescription(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SignalingService.AnswerSessionDescription, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.subscribeSDPCommand = function subscribeSDPCommand(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(SignalingService.SubscribeSDPCommand, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.subscribeRoomEvent = function subscribeRoomEvent(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(SignalingService.SubscribeRoomEvent, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.sendICECandidate = function sendICECandidate(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(SignalingService.SendICECandidate, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.subscribeICECandidate = function subscribeICECandidate(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(SignalingService.SubscribeICECandidate, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

SignalingServiceClient.prototype.subscribeOnlineStatus = function subscribeOnlineStatus(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(SignalingService.SubscribeOnlineStatus, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners.end.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  client.onMessage(function (message) {
    listeners.data.forEach(function (handler) {
      handler(message);
    })
  });
  client.start(metadata);
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

exports.SignalingServiceClient = SignalingServiceClient;

