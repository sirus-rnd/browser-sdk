import { Observable, Subject } from 'rxjs';
import { delay, race } from 'bluebird';
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
    this.sendChannel = this.localConnection.createDataChannel(uuid());
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

  async reconnect() {
    await this.disconnectSendChannel();
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
    this.logger.debug('receive ICE candidate for', this.id, candidate);
    try {
      if (payload.isremote) {
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
        this.remoteConnection.setRemoteDescription(offer);

        // create answer
        const answer = await this.remoteConnection.createAnswer();
        this.logger.debug('send answer', answer);
        this.remoteConnection.setLocalDescription(answer);
        const param = new SDPParam();
        param.setUserid(this.id);
        param.setDescription(answer.sdp);
        const token = this.signalingToken;
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
        this.localConnection.setRemoteDescription(answer);
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
    this.localConnection.setLocalDescription(offer);
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

  async disconnectSendChannel() {
    if (this.sendChannel) {
      await new Promise((resolve, reject) => {
        this.sendChannel.close();
        const onClose = () => {
          this.sendChannel.removeEventListener('close', onClose);
          resolve();
        };
        const onError = (err: RTCErrorEvent) => {
          this.sendChannel.removeEventListener('error', onError);
          reject(err.error);
        };
        this.sendChannel.addEventListener('close', onClose);
        this.sendChannel.addEventListener('error', onError);
      });
      // update connection status
      this.sendChannel.removeEventListener('error', this.onSendChannelError);
      this.sendChannel.removeEventListener('open', this.onSendChannelOpen);
      this.sendChannel.removeEventListener('close', this.onSendChannelClose);
    }
    if (this.localConnection) {
      await new Promise((resolve, reject) => {
        this.localConnection.close();
        const onClose = () => {
          this.localConnection.removeEventListener('close', onClose);
          resolve();
        };
        const onError = (err: RTCErrorEvent) => {
          this.localConnection.removeEventListener('error', onError);
          reject(err.error);
        };
        this.localConnection.addEventListener('close', onClose);
        this.localConnection.addEventListener('error', onError);
      });
      // clean up some listeners
      this.localConnection.removeEventListener(
        'icecandidate',
        this.onLocalICECandidate
      );
      this.localConnection.removeEventListener(
        'iceconnectionstatechange',
        this.onLocalICEStateChange
      );
      this.localConnection.removeEventListener(
        'negotiationneeded',
        this.onLocalNegotiationNeeded
      );
    }
  }

  async disconnectReceivingChannel() {
    if (this.remoteConnection) {
      await new Promise((resolve, reject) => {
        this.remoteConnection.close();
        const onClose = () => {
          this.remoteConnection.removeEventListener('close', onClose);
          resolve();
        };
        const onError = (err: RTCErrorEvent) => {
          this.remoteConnection.removeEventListener('error', onError);
          reject(err.error);
        };
        this.remoteConnection.addEventListener('close', onClose);
        this.remoteConnection.addEventListener('error', onError);
      });
      // clean up some listeners
      this.remoteConnection.removeEventListener(
        'icecandidate',
        this.onRemoteICECandidate.bind(this)
      );
      this.remoteConnection.removeEventListener(
        'iceconnectionstatechange',
        this.onRemoteICEStateChange.bind(this)
      );
      this.remoteConnection.removeEventListener(
        'datachannel',
        this.onReceiveDataChannel.bind(this)
      );
    }
    if (this.receiveChannel) {
      await new Promise((resolve, reject) => {
        this.receiveChannel.close();
        const onClose = () => {
          this.receiveChannel.removeEventListener('close', onClose);
          resolve();
        };
        const onError = (err: RTCErrorEvent) => {
          this.receiveChannel.removeEventListener('error', onError);
          reject(err.error);
        };
        this.receiveChannel.addEventListener('close', onClose);
        this.receiveChannel.addEventListener('error', onError);
      });
      // clean up some listeners
      this.receiveChannel.removeEventListener(
        'error',
        this.onReceiveChannelError.bind(this)
      );
      this.receiveChannel.removeEventListener(
        'open',
        this.onReceiveChannelOpen.bind(this)
      );
      this.receiveChannel.removeEventListener(
        'close',
        this.onReceiveChannelClose.bind(this)
      );
      this.receiveChannel.removeEventListener(
        'message',
        this.onReceiveChannelGetMessage.bind(this)
      );
    }
  }
}
