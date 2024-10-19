// Type definitions
export interface ClientInfo {
  cleanup: () => Promise<void>;
  address: string;
}

export interface XMTPMessage {
  content: Content | CommandContent;
  typeId: string;
  senderAddress: string;
}
export interface Content {
  content: string;
}
export interface CommandContent {
  command: string;
  params: Record<string, any>;
}

export interface CleanupParams {
  address: string;
}
