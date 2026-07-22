// Mirrors the contract in pintar-congak-handoff.md exactly — keep in sync
// if the engine side changes it.

export interface PintarContext {
  currentTopic: string;
  currentLevel: string;
  xpToday: number;
  streakDays: number;
}

export interface PintarHistoryEntry {
  role: "user" | "pintar";
  text: string;
}

export interface PintarChatRequest {
  sessionId: string;
  studentName: string;
  language: "bm" | "en";
  message: string;
  context: PintarContext;
  history: PintarHistoryEntry[];
}

export type PintarAvatarState = "idle" | "thinking" | "showing" | "correct" | "wrong" | "confuse";

export interface PintarQuickReply {
  label: string;
  value: string;
}

export interface PintarChatResponse {
  reply: string;
  avatarState: PintarAvatarState;
  quickReplies?: PintarQuickReply[];
  timestamp: string;
}
