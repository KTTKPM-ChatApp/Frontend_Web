import SimplePeer from "simple-peer";

const peers = new Map<string, SimplePeer.Instance>();
const peerConnections = new WeakMap<SimplePeer.Instance, RTCPeerConnection>();

type PeerWithConnection = SimplePeer.Instance & {
  _pc?: RTCPeerConnection;
};

export function hasPeer(userId: string): boolean {
  const peer = peers.get(userId);
  return Boolean(peer && !peer.destroyed);
}

export function createPeer(params: {
  userId: string;
  initiator: boolean;
  localStream: MediaStream;
  iceServers: RTCIceServer[];
  onSignal: (signal: SimplePeer.SignalData) => void;
  onStream: (stream: MediaStream) => void;
  onClose: () => void;
  onError?: (err: Error) => void;
}): SimplePeer.Instance {
  const peer = new SimplePeer({
    initiator: params.initiator,
    stream: params.localStream,
    config: { iceServers: params.iceServers },
    trickle: true,
  });

  peer.on("signal", (signal) => {
    params.onSignal(signal);
  });
  
  peer.on("stream", (stream) => {
    stream.getTracks().forEach((t) => {
      // Monitor when track becomes unmuted (ready to play)
      t.onunmute = () => {
        // Track unmuted - ready to play
      };
      t.onmute = () => {
        // Track muted
      };
    });
    params.onStream(stream);
  });
  
  peer.on("close", () => {
    params.onClose();
  });
  
  peer.on("error", (err) => {
    params.onError?.(err);
  });
  
  peer.on("connect", () => {
    // Peer connected
  });
  
  // Monitor ICE connection state
  const pc = (peer as PeerWithConnection)._pc;
  if (pc) {
    peerConnections.set(peer, pc);
    
    let cleanupTriggered = false;
    
    const triggerCleanup = () => {
      if (!cleanupTriggered && !peer.destroyed) {
        cleanupTriggered = true;
        params.onClose();
      }
    };
    
    pc.oniceconnectionstatechange = () => {
      // Handle ICE connection failure
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setTimeout(triggerCleanup, 1000);
      }
    };
    
    pc.onconnectionstatechange = () => {
      // Handle connection failure
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setTimeout(triggerCleanup, 1000);
      }
    };
  }

  peers.set(params.userId, peer);
  return peer;
}

export function feedSignal(userId: string, signal: SimplePeer.SignalData): void {
  const peer = peers.get(userId);
  if (!peer || peer.destroyed) return;

  const signalType = (signal as RTCSessionDescriptionInit).type;
  const pc = peerConnections.get(peer);
  if (signalType === "answer" && pc?.signalingState === "stable") {
    // Duplicate answer in stable state - ignoring
    return;
  }

  try {
    peer.signal(signal);
  } catch (err) {
    console.error(`[peer:${userId}] failed to apply signal:`, err);
  }
}

export function destroyPeer(userId: string): void {
  const peer = peers.get(userId);
  if (peer) {
    peer.destroy();
    peers.delete(userId);
  }
}

export function destroyAllPeers(): void {
  peers.forEach((peer) => {
    if (!peer.destroyed) {
      peer.destroy();
    }
  });
  peers.clear();
}

export function getPeer(userId: string): SimplePeer.Instance | undefined {
  return peers.get(userId);
}
