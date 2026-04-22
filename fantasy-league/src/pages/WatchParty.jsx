import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { MonitorUp, Users, VideoOff } from 'lucide-react';
import SportTabs from '../components/SportTabs';

const WatchParty = ({ activeSport, setActiveSport }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [viewers, setViewers] = useState(0);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const socketRef = useRef();
  const peerConnectionRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
    // Connect to the signaling server (proxy handles /api, but socket.io connects directly)
    // For socket.io, if it's served on the same domain, we can just use '/'
    // Since Vite proxies /api and /socket.io, we should connect socket.io to the exact same host.
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-stream');
    });

    socketRef.current.on('user-joined', (userId) => {
      setViewers(v => v + 1);
      // If we are broadcasting, we need to create an offer to the new user
      if (isBroadcasting && streamRef.current) {
        createOffer(userId);
      }
    });

    socketRef.current.on('user-left', () => {
      setViewers(v => Math.max(0, v - 1));
    });

    // WebRTC Signaling Handlers
    socketRef.current.on('offer', handleReceiveOffer);
    socketRef.current.on('answer', handleReceiveAnswer);
    socketRef.current.on('ice-candidate', handleNewICECandidateMsg);

    return () => {
      socketRef.current.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isBroadcasting]);

  const initPeerConnection = (target) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ]
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          target,
          candidate: event.candidate
        });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, streamRef.current);
      });
    }

    return peer;
  };

  const createOffer = async (target) => {
    const peer = initPeerConnection(target);
    peerConnectionRef.current = peer;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socketRef.current.emit('offer', {
      target,
      sdp: peer.localDescription
    });
  };

  const handleReceiveOffer = async (payload) => {
    const peer = initPeerConnection(payload.caller);
    peerConnectionRef.current = peer;

    await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socketRef.current.emit('answer', {
      target: payload.caller,
      sdp: peer.localDescription
    });
  };

  const handleReceiveAnswer = async (payload) => {
    const peer = peerConnectionRef.current;
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    }
  };

  const handleNewICECandidateMsg = async (payload) => {
    const peer = peerConnectionRef.current;
    if (peer) {
      await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
  };

  const startBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsBroadcasting(true);

      // Stop broadcasting when user clicks browser's stop sharing button
      stream.getVideoTracks()[0].onended = () => {
        stopBroadcast();
      };
    } catch (err) {
      console.error("Error starting screen share:", err);
      alert("Failed to capture screen. Permissions might be denied.");
    }
  };

  const stopBroadcast = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsBroadcasting(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    // Tell others stream ended (for simplicity we just close connections)
    if (peerConnectionRef.current) peerConnectionRef.current.close();
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Watch <span className="heading-gradient">Party</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Broadcast your screen to other managers or watch the main stage.</p>
        </div>
        
        <div className="glass-panel" style={{ display: 'flex', gap: '24px', padding: '12px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--neon-blue)" />
            <span style={{ fontWeight: 'bold' }}>{viewers + 1} Viewing</span>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isBroadcasting ? 'var(--neon-red)' : 'var(--neon-green)', animation: isBroadcasting ? 'pulse 2s infinite' : 'none' }}></div>
            <span style={{ color: isBroadcasting ? 'var(--neon-red)' : 'var(--neon-green)' }}>{isBroadcasting ? 'LIVE (You)' : 'RECEIVING'}</span>
          </div>
        </div>
      </header>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      <div className="glass-panel scene-3d" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', borderTop: isBroadcasting ? '2px solid var(--neon-red)' : '2px solid var(--neon-blue)' }}>
        
        {/* Video Player Area */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: '#0a0b10', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Local Broadcast Video (Muted to prevent feedback) */}
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: isBroadcasting ? 'block' : 'none' }}
          />

          {/* Remote Viewing Video */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: !isBroadcasting ? 'block' : 'none' }}
          />

          {!isBroadcasting && !remoteVideoRef.current?.srcObject && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
              <VideoOff size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Waiting for the host to start the broadcast...</p>
            </div>
          )}

          {isBroadcasting && (
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,40,0,0.8)', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>
              REC
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          {!isBroadcasting ? (
            <button className="btn-primary" onClick={startBroadcast} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px' }}>
              <MonitorUp size={20} />
              Share Screen & Broadcast
            </button>
          ) : (
            <button onClick={stopBroadcast} style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', 
              background: 'transparent', color: 'var(--neon-red)', border: '1px solid var(--neon-red)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              <VideoOff size={20} />
              Stop Broadcasting
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchParty;
