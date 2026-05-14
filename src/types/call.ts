export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'ongoing' | 'ended';
export type CallParticipantStatus = 'invited' | 'accepted' | 'rejected' | 'left';
export type CallConversationType = 'direct' | 'group';
export type CallSignalType = 'offer' | 'answer' | 'ice-candidate' | 'renegotiate';

export interface CallStateSnapshot {
  call_id: string;
  conversation_id: string;
  conversation_type: CallConversationType;
  call_type: CallType;
  status: CallStatus;
  initiator_id: string;
  participants: Record<string, CallParticipantStatus>;
  started_at: number;
  ended_at?: number;
  version?: number;
}

export type CallScreen =
  | 'idle'
  | 'calling'
  | 'incoming'
  | 'connecting'
  | 'active'
  | 'ended';

export interface CallSignalPayload {
  call_id: string;
  conversation_id: string;
  target_user_id: string;
  sender_id: string;
  signal_type: CallSignalType;
  sdp?: string;
  candidate?: string;
  sdp_mid?: string;
  sdp_mline_index?: number;
  sent_at: number;
  state_version?: number;
}
