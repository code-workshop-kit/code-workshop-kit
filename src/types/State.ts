import WebSocket from 'ws';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { WorkshopConfig } from './CwkConfig';

export declare interface AdminConfig {
  followMode?: boolean;
  enableCaching?: boolean;
}

export declare interface TerminalScript {
  script: ChildProcessWithoutNullStreams;
  closeResolve: () => void;
  hasClosed: Promise<unknown>;
}

export declare interface State {
  adminConfig?: AdminConfig;
  wsConnections?: Record<string, Map<string, WebSocket>>;
  wss?: WebSocket.Server;
  previousAdminUrl?: string;
  terminalScripts?: Map<string, TerminalScript>;
  followModeInitiatedBy?: string;
  cwkConfig?: WorkshopConfig;
  queryTimestamps?: Record<string, number>;
}
