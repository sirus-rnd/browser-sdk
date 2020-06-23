import { Observable, Subject } from 'rxjs';
import { delay, race, defer } from 'bluebird';
import { Consola } from 'consola';
import { v4 as uuid } from 'uuid';
import { Conversation, UserInRoomEventPayload, FileContent } from './p2p-chat';
import {
  ICEParam,
  SDPParam,
  ICEOffer,
  SDP,
  SDPTypes,
} from './protos/signalling_pb';
import { SignalingServiceClient } from './protos/SignallingServiceClientPb';

export class UserChannel {
  sendChannelReady: boolean;
  receiveChannelReady: boolean;
  roomIDs: string[] = [];
  localConnection: RTCPeerConnection;
  remoteConnection: RTCPeerConnection;
  sendChannel: RTCDataChannel;
  receiveChannel: RTCDataChannel;
  _onConnected = new Subject<void>();
  _onDisconnected = new Subject<string>();
  _onReceiveData = new Subject<MessageEvent>();
  _onMessageReceived = new Subject<Conversation>();
  _onReceiveMessage = new Subject<Conversation>();
  _onMessageRead = new Subject<Conversation>();
  _onUserTyping = new Subject<UserInRoomEventPayload>();
  _onFileTransferStart = new Subject<FileContent>();
  _onReceiveFileChunk = new Subject<FileContent>();
  _onFileTransferEnd = new Subject<FileContent>();
  onConnected: Observable<void> = this._onConnected.asObservable();
  onDisconnected: Observable<string> = this._onDisconnected.asObservable();
  onReceiveData = this._onReceiveData.asObservable();
  onMessageReceived = this._onMessageReceived.asObservable();
  onMessageRead = this._onMessageRead.asObservable();
  onReceiveMessage = this._onReceiveMessage.asObservable();
  onUserTyping = this._onUserTyping.asObservable();
  onFileTransferStart = this._onFileTransferStart.asObservable();
  onReceiveFileChunk = this._onReceiveFileChunk.asObservable();
  onFileTransferEnd = this._onFileTransferEnd.asObservable();

  constructor(
    public id: string,
    public name: string,
    public photo: string,
    public online: boolean,
    private logger: Consola,
    private signalingToken: string,
    private signaling: SignalingServiceClient,
    private iceServers: RTCIceServer[]
  ) {}

  connect() {
    if (!this.online) {
      throw new Error('cannot setup send channel when user offline');
    }
    this.localConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
    });
    this.localConnection.addEventListener(
      'icecandidate',
      this.onLocalICECandidate.bind(this)
    );
    this.localConnection.addEventListener(
      'iceconnectionstatechange',
      this.onLocalICEStateChange.bind(this)
    );
    this.localConnection.addEventListener(
      'negotiationneeded',
      this.onLocalNegotiationNeeded.bind(this)
    );
    // create send channel
    this.sendChannel = this.localConnection.createDataChannel(uuid());
    // update connection status
    this.sendChannel.addEventListener(
      'error',
      this.onSendChannelError.bind(this)
    );
    this.sendChannel.addEventListener(
      'open',
      this.onSendChannelOpen.bind(this)
    );
    this.sendChannel.addEventListener(
      'close',
      this.onSendChannelClose.bind(this)
    );
  }

  reconnect() {
    // cannot reconnect when user are offline
    if (!this.online) {
      return;
    }
    this.disconnectSendChannel();
    this.connect();
  }

  setupReceiveChannel() {
    this.remoteConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
    });
    this.remoteConnection.addEventListener(
      'icecandidate',
      this.onRemoteICECandidate.bind(this)
    );
    this.remoteConnection.addEventListener(
      'iceconnectionstatechange',
      this.onRemoteICEStateChange.bind(this)
    );
    this.remoteConnection.addEventListener(
      'datachannel',
      this.onReceiveDataChannel.bind(this)
    );
  }

  onReceiveDataChannel(event: RTCDataChannelEvent) {
    this.logger.debug('receive data channel request', event.channel.id);
    this.receiveChannel = event.channel;
    // update connection status
    this.receiveChannel.addEventListener(
      'error',
      this.onReceiveChannelError.bind(this)
    );
    this.receiveChannel.addEventListener(
      'open',
      this.onReceiveChannelOpen.bind(this)
    );
    this.receiveChannel.addEventListener(
      'close',
      this.onReceiveChannelClose.bind(this)
    );
    this.receiveChannel.addEventListener(
      'message',
      this.onReceiveChannelGetMessage.bind(this)
    );
  }

  async onICEOfferSignal(payload: ICEOffer.AsObject) {
    const candidate: RTCIceCandidate = JSON.parse(payload.candidate);
    this.logger.debug('receive ICE candidate for', this.id, payload);
    try {
      if (payload.isremote) {
        // wait answer before add ICE candidate
        await race([
          this.waitSDPAnswer(),
          delay(5000).then(() => {
            throw new Error('timeout wait SDP answer');
          }),
        ]);
        this.localConnection.addIceCandidate(candidate);
      } else {
        // wait for 5 sec. for remote connection to ready
        await race([
          this.waitRemoteConnection(),
          delay(5000).then(() => {
            throw new Error('timeout wait remote connection');
          }),
        ]);
        this.remoteConnection.addIceCandidate(candidate);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  async waitSDPAnswer(): Promise<boolean> {
    if (!this.localConnection.currentRemoteDescription) {
      await delay(5000);
      return this.waitSDPAnswer();
    }
    return true;
  }

  async waitRemoteConnection(): Promise<boolean> {
    if (!this.remoteConnection) {
      await delay(5000);
      return this.waitRemoteConnection();
    }
    return true;
  }

  async onReceiveSDP(payload: SDP.AsObject) {
    switch (payload.type) {
      case SDPTypes.OFFER: {
        const offer: RTCSessionDescriptionInit = {
          type: 'offer',
          sdp: payload.description,
        };
        this.logger.debug('receive offer', payload);
        // setup receive channel
        this.setupReceiveChannel();
        await this.remoteConnection.setRemoteDescription(offer);

        // create answer
        const answer = await this.remoteConnection.createAnswer();
        await this.remoteConnection.setLocalDescription(answer);
        const param = new SDPParam();
        param.setUserid(this.id);
        param.setDescription(answer.sdp);
        const token = this.signalingToken;
        this.logger.debug('sending answer', answer);
        await new Promise((resolve, reject) => {
          this.signaling.answerSessionDescription(
            param,
            { token },
            (err, response) => {
              if (err) {
                reject(err);
              }
              resolve(response);
            }
          );
        });
        break;
      }

      case SDPTypes.ANSWER: {
        const answer: RTCSessionDescriptionInit = {
          type: 'answer',
          sdp: payload.description,
        };
        this.logger.debug('receive answer', payload);
        await this.localConnection.setRemoteDescription(answer);
        break;
      }
    }
  }

  onSendChannelError(event: RTCErrorEvent) {
    this.logger.error('send channel error', this.id, event.error);
  }

  onSendChannelOpen(event: Event) {
    this.logger.debug('send channel connected');
    this.sendChannelReady = true;
    this._onConnected.next(null);
  }

  onSendChannelClose(event: Event) {
    this.sendChannelReady = false;
    this._onDisconnected.next(null);
  }

  onReceiveChannelError(event: RTCErrorEvent) {
    this.logger.error('receive channel error', this.id, event.error);
  }

  onReceiveChannelOpen(event: Event) {
    this.logger.debug('receive channel connected');
    this.receiveChannelReady = true;
  }

  onReceiveChannelClose(event: Event) {
    this.receiveChannelReady = false;
  }

  onReceiveChannelGetMessage(event: MessageEvent) {
    this.logger.debug('receive channel get data', this.id, event);
    this._onReceiveData.next(event);
  }

  async onLocalICECandidate(event: RTCPeerConnectionIceEvent) {
    if (!event.candidate) {
      return null;
    }
    try {
      await this.sendICECandidate(event.candidate, false);
    } catch (err) {
      this.logger.error('failed to send local ICE candidate', err);
    }
  }

  async onRemoteICECandidate(event: RTCPeerConnectionIceEvent) {
    if (!event.candidate) {
      return null;
    }
    try {
      await this.sendICECandidate(event.candidate, true);
    } catch (err) {
      this.logger.error('failed to send remote ICE candidate', err);
    }
  }

  onLocalICEStateChange(event: Event) {
    this.logger.debug('local ice state change', event);
  }

  onRemoteICEStateChange(event: Event) {
    this.logger.debug('remote ice state change', event);
  }

  async onLocalNegotiationNeeded(event: Event) {
    // create SDP offers
    const offer = await this.localConnection.createOffer();
    await this.localConnection.setLocalDescription(offer);
    this.logger.debug('send offer', JSON.stringify(offer.sdp, null, 2));
    const param = new SDPParam();
    param.setUserid(this.id);
    param.setDescription(offer.sdp);
    const token = this.signalingToken;
    await new Promise((resolve, reject) => {
      this.signaling.offerSessionDescription(
        param,
        { token },
        (err, response) => {
          if (err) {
            reject(err);
          }
          resolve(response);
        }
      );
    });
  }

  private async sendICECandidate(
    iceCandidate: RTCIceCandidate,
    isRemote: boolean
  ) {
    this.logger.debug('ice candidate', iceCandidate, this.id, isRemote);
    // send ICE candidate offer
    const param = new ICEParam();
    param.setUserid(this.id);
    param.setIsremote(isRemote);
    param.setCandidate(JSON.stringify(iceCandidate));
    const token = this.signalingToken;
    await new Promise((resolve, reject) => {
      this.signaling.sendICECandidate(param, { token }, (err, response) => {
        if (err) {
          reject(err);
        }
        resolve(response);
      });
    });
  }

  disconnectSendChannel() {
    if (this.sendChannel) {
      this.sendChannel.close();
    }
  }

  disconnectReceivingChannel() {
    if (this.receiveChannel) {
      this.receiveChannel.close();
    }
  }
}
