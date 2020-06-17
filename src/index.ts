import { LogLevel, Consola, BrowserReporter } from 'consola';
import { createInstance, INDEXEDDB, LOCALSTORAGE, WEBSQL } from 'localforage';
import { ConversationManager } from './conversation-state';
import { ChatClient } from './client';
import { Messenger } from './messaging';
import { SignalingServiceClient } from './protos/SignallingServiceClientPb';

// export p2p chat interface
export * from './p2p-chat';

export interface P2PChatOptions {
  signalingUrl: string;
  logLevel: P2PLogLevel;
}

export type P2PLogLevel =
  | 'silent'
  | 'info'
  | 'success'
  | 'warn'
  | 'debug'
  | 'error'
  | 'trace'
  | 'verbose';

export const mapP2PLogLevelToConsola = {
  silent: LogLevel.Silent,
  info: LogLevel.Info,
  success: LogLevel.Success,
  warn: LogLevel.Warn,
  debug: LogLevel.Debug,
  error: LogLevel.Error,
  trace: LogLevel.Trace,
  verbose: LogLevel.Verbose,
};

/**
 * create new chat client instance
 */
export async function createNewClient(
  options: P2PChatOptions
): Promise<ChatClient> {
  // setup signalling client, storage & conversation manager
  const signalingUrl = options.signalingUrl;
  const logLevel = options.logLevel;
  const signaling = new SignalingServiceClient(signalingUrl);
  const storage = createInstance({
    name: 'p2p-chat',
    description: 'p2p chat key-value storage',
    driver: [INDEXEDDB, LOCALSTORAGE, WEBSQL],
  });
  const conversationManager = new ConversationManager();
  await conversationManager.init();
  // setup logger
  const consola = new Consola({
    reporters: [new BrowserReporter()],
  });
  consola.level = mapP2PLogLevelToConsola[logLevel] || LogLevel.Error;
  // setup messenger
  const messenger = new Messenger(conversationManager, consola);
  await messenger.init();
  // create p2p chat client
  return new ChatClient(
    signaling,
    storage,
    conversationManager,
    messenger,
    consola
  );
}

export default createNewClient;
