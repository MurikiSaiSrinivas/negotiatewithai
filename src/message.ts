/** Message from Devvit to the web view. */
// message.ts
export type DevvitMessage =
  | { type: 'initialData'; data: { username: string; apiKey: string } }
  | { type: 'updateCounter'; data: { currentCounter: number } }
  | { type: 'gameStart'; data: { scenario: string; villainProfile: { name: string, role: string, personality: string, motivation: string }; firstMessage: string } }
  | { type: 'villainResponse'; data: { message: string; indicator?: string } }
  | { type: 'gameEnd'; data: { message: string; indicator?: string, verdict: string; feedback: any } };

/** Message from the web view to Devvit. */
export type WebViewMessage =
  | { type: 'webViewReady' }
  | { type: 'startGame' }
  | { type: 'playerMessage'; data: { negotiationHistory: any, final: boolean } }
  | { type: 'shareResults'; data: { negotiationHistory: any } };

/**
 * Web view MessageEvent listener data type. The Devvit API wraps all messages
 * from Blocks to the web view.
 */
// export type DevvitSystemMessage = {
//   data: { message: DevvitMessage };
//   /** Reserved type for messages sent via `context.ui.webView.postMessage`. */
//   type?: 'devvit-message' | string;
// };
