export type UiStatus = "LOADING" | "WAITING" | "APPROVED" | "EXPIRED" | "ERROR";

export interface IQRGeneratePayload {
  socketBindingToken: string;
  deviceInfo?: string;
}

export interface IQRGenerateData {
  sessionId: string;
  qrToken: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface QrBindIssuedPayload {
  socketId: string;
  socketBindingToken: string;
  expiresInSeconds: number;
};

export interface QrConfirmedPayload {
  sessionId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id?: string | null;
  };
};

export interface QrRejectedPayload {
  sessionId?: string;
  reason?: string;
};

export interface WsErrorPayload {
  code?: string;
  message?: string;
};