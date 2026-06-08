import { initCallUser as initCallUser1vs1 } from './call-1-1.action';
import { initCallUser as initCallUserGroup } from './call-group.action';

export function initCallUser() {
  initCallUser1vs1();
  initCallUserGroup();
}

export {
  startCall,
  answerCall,
  rejectCall,
  endCall,
  handleCallSignal,
  enableVideo,
} from './call-1-1.action';

export {
  startGroupCall,
  handleIncomingGroupCall,
  endGroupCall,
  handleSfuSignal,
} from './call-group.action';
