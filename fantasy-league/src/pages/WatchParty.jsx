import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Users, Copy, Check, LogOut, Send, Radio, Tv, VideoOff, MonitorUp, MessageCircle } from 'lucide-react';
import flvjs from 'flv.js';
import SportTabs from '../components/SportTabs';

const USERNAME_COLORS = [
  '#38bdf8', '#60a5fa', '#f3c623', '#a78bfa', '#34d399', '#f87171',
  '#22d3ee', '#818cf8', '#fbbf24', '#f472b6', '#38bdf8', '#fb7185',
];

const getUsernameColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USERNAME_COLORS[Math.abs(hash) % USERNAME_COLORS.length];
};

const WatchParty = ({ activeSport, setActiveSport }) => {
  const username = JSON.parse(localStorage.getItem('fantasy_user'))?.username || 'Guest';

  // State machine: 'lobby' | 'room'
  const [view, setView] = useState('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState('obs');
  const [obsLive, setObsLive] = useState(false);
  const [obsUptime, setObsUptime] = useState(0);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const socketRef = useRef(null);
  const obsVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const flvPlayerRef = useRef(null);
  const streamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const chatEndRef = useRef(null);
  const uptimeInterval = useRef(null);
  const isBroadcastingRef = useRef(false);

  useEffect(() => { isBroadcastingRef.current = isBroadcasting; }, [isBroadcasting]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const checkObsStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/stream/status');
      const data = await res.json();
      setObsLive(data.live);
      if (data.live && data.streams[0]) setObsUptime(data.streams[0].uptime);
    } catch { /* ignore */ }
  }, []);

  const initFlvPlayer = useCallback(() => {
    if (!obsVideoRef.current || !flvjs.isSupported()) return;
    if (flvPlayerRef.current) { flvPlayerRef.current.destroy(); flvPlayerRef.current = null; }

    const player = flvjs.createPlayer({
      type: 'flv',
      url: `http://${window.location.hostname}:8888/live/fofa.flv`,
      isLive: true,
    }, { enableStashBuffer: false, stashInitialSize: 128 });
    player.attachMediaElement(obsVideoRef.current);
    player.load();
    player.play().catch(() => {});
    flvPlayerRef.current = player;
  }, []);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('room-created', ({ roomCode: code, members: m }) => {
      setRoomCode(code);
      setMembers(m);
      setView('room');
      setIsCreating(false);
      setError('');
      addSystemMessage(`Room ${code} created. Share the code with friends!`);
    });

    socket.on('room-joined', ({ roomCode: code, members: m }) => {
      setRoomCode(code);
      setMembers(m);
      setView('room');
      setIsJoining(false);
      setError('');
      addSystemMessage(`You joined room ${code}`);
    });

    socket.on('room-error', ({ error: err }) => {
      setError(err);
      setIsCreating(false);
      setIsJoining(false);
    });

    socket.on('room-user-joined', ({ username: user, members: m }) => {
      setMembers(m);
      addSystemMessage(`${user} joined the room`);
    });

    socket.on('room-user-left', ({ username: user, members: m }) => {
      setMembers(m);
      addSystemMessage(`${user} left the room`);
    });

    socket.on('room-chat-message', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'chat' }]);
    });

    socket.on('user-joined', (uid) => {
      if (isBroadcastingRef.current && streamRef.current) createOffer(uid);
    });
    socket.on('user-left', () => { setHasRemoteStream(false); });
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIce);
    socket.on('obs-stream-live', (data) => {
      setObsLive(data.live);
      if (data.live && mode === 'obs') setTimeout(initFlvPlayer, 1000);
    });

    checkObsStatus();
    const pollId = setInterval(checkObsStatus, 5000);

    return () => {
      clearInterval(pollId);
      socket.disconnect();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (flvPlayerRef.current) { flvPlayerRef.current.destroy(); flvPlayerRef.current = null; }
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (uptimeInterval.current) clearInterval(uptimeInterval.current);
    };
  }, [mode, checkObsStatus, initFlvPlayer]);

  useEffect(() => {
    if (view === 'room' && mode === 'obs' && obsLive) {
      setTimeout(initFlvPlayer, 500);
    }
  }, [view, mode, obsLive, initFlvPlayer]);

  useEffect(() => {
    if (obsLive && obsUptime > 0) {
      if (uptimeInterval.current) clearInterval(uptimeInterval.current);
      uptimeInterval.current = setInterval(() => {
        setObsUptime(prev => prev + 1);
      }, 1000);
    }
    return () => { if (uptimeInterval.current) clearInterval(uptimeInterval.current); };
  }, [obsLive, obsUptime]);

  const addSystemMessage = (msg) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      type: 'system',
      message: msg,
      timestamp: new Date().toISOString()
    }]);
  };

  const createRoom = () => {
    if (!socketRef.current) return;
    setIsCreating(true);
    setError('');
    socketRef.current.emit('create-room', { username });
  };

  const joinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code || !socketRef.current) return;
    setIsJoining(true);
    setError('');
    socketRef.current.emit('join-room', { roomCode: code, username });
  };

  const leaveRoom = () => {
    if (socketRef.current) socketRef.current.emit('leave-room');
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (flvPlayerRef.current) { flvPlayerRef.current.destroy(); flvPlayerRef.current = null; }
    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
    setView('lobby');
    setRoomCode('');
    setMembers([]);
    setMessages([]);
    setIsBroadcasting(false);
    setHasRemoteStream(false);
    setError('');
  };

  const sendChatMessage = () => {
    const text = chatInput.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit('room-chat', { roomCode, message: text, username });
    setChatInput('');
  };

  // WebRTC logic
  const startBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setIsBroadcasting(true);
      socketRef.current.emit('webrtc-ready', { roomCode });
    } catch {
      setError('Could not access screen media.');
    }
  };

  const stopBroadcast = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setIsBroadcasting(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const createOffer = async (uid) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19002' }] });
    peerConnectionRef.current = pc;
    streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current));

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { roomCode, candidate: e.candidate, to: uid });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current.emit('offer', { roomCode, sdp: offer, to: uid });
  };

  const handleOffer = async ({ sdp, from }) => {
    if (isBroadcasting) return;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19002' }] });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { roomCode, candidate: e.candidate, to: from });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setHasRemoteStream(true);
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current.emit('answer', { roomCode, sdp: answer, to: from });
  };

  const handleAnswer = async ({ sdp }) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  };

  const handleIce = async ({ candidate }) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const formatUptime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-shell" style={{ animation: 'fadeIn 0.5s ease' }}>
      {/* ── LOBBY VIEW ── */}
      {view === 'lobby' && (
        <div>
          <section style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f80e0', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Users size={16} />
              CO-WATCHING PARTY ROOMS
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '8px 0 12px', color: '#ffffff' }}>
              Watch Party Lobby
            </h1>
            <p style={{ color: '#8f98a9', fontSize: '0.95rem', margin: 0, maxWidth: '800px', lineHeight: '1.6' }}>
              Create a private cinema room for up to 12 friends. Stream high-fidelity sports feeds, co-watch via screen share, and enjoy instant synchronized chat.
            </p>
          </section>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(255, 46, 85, 0.1)',
              border: '1px solid rgba(255, 46, 85, 0.3)',
              color: '#ff2e55',
              borderRadius: '6px',
              marginBottom: '24px',
              maxWidth: '720px'
            }}>{error}</div>
          )}

          <div className="lobby-layout" style={{ maxWidth: '840px' }}>
            {/* Create Room Box */}
            <div className="action-card">
              <div>
                <div style={{
                  display: 'inline-flex',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(31, 128, 224, 0.1)',
                  marginBottom: '20px',
                  color: '#1f80e0'
                }}>
                  <Users size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Host a Party Room</h3>
                <p style={{ color: '#8f98a9', fontSize: '0.88rem', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                  Generate a unique room invitation code. You can control the stream format and invite up to 12 members.
                </p>
              </div>
              <button 
                onClick={createRoom} 
                disabled={isCreating}
                className="submit-btn"
              >
                {isCreating ? 'Creating room...' : 'Host Room'}
              </button>
            </div>

            {/* Join Room Box */}
            <div className="action-card">
              <div>
                <div style={{
                  display: 'inline-flex',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(243, 198, 35, 0.1)',
                  marginBottom: '20px',
                  color: '#f3c623'
                }}>
                  <Tv size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Join with Code</h3>
                <p style={{ color: '#8f98a9', fontSize: '0.88rem', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                  Have an invitation link or room code? Enter the 6-character room key below to enter your friends room.
                </p>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ENTER 6-CHAR CODE"
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '2px', fontWeight: 'bold' }}
                  />
                </div>
              </div>
              <button 
                onClick={joinRoom} 
                disabled={isJoining || !joinCode.trim()}
                className="submit-btn"
                style={{ background: '#f3c623', color: '#030b17' }}
              >
                {isJoining ? 'Entering room...' : 'Join Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE ROOM VIEW ── */}
      {view === 'room' && (
        <div>
          {/* Room Header Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: '#8f98a9', fontWeight: 600 }}>Room Code:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>{roomCode}</span>
                <button
                  onClick={copyRoomCode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied ? '#27d06d' : '#1f80e0',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 4
                  }}
                  title="Copy room code"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <span className="status-pill" style={{ background: 'rgba(31,128,224,0.12)', color: '#1f80e0', fontWeight: 700 }}>
                {members.length}/12 Active Users
              </span>
            </div>

            <button
              onClick={leaveRoom}
              style={{
                background: 'rgba(255, 46, 85, 0.1)',
                border: '1px solid rgba(255, 46, 85, 0.2)',
                color: '#ff2e55',
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 46, 85, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 46, 85, 0.1)'}
            >
              <LogOut size={16} /> Exit Room
            </button>
          </div>

          <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

          {/* Video + Chat columns */}
          <div className="room-layout">
            {/* Left: Media Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Media selection bar */}
              <div style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px',
                padding: '3px',
                border: '1px solid rgba(255,255,255,0.05)',
                maxWidth: '320px'
              }}>
                <button
                  onClick={() => setMode('obs')}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '4px',
                    fontSize: '0.78rem', fontWeight: 600,
                    background: mode === 'obs' ? '#1f80e0' : 'transparent',
                    color: mode === 'obs' ? '#ffffff' : '#8f98a9',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Radio size={14} /> OBS Broadcast
                </button>
                <button
                  onClick={() => setMode('webrtc')}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '4px',
                    fontSize: '0.78rem', fontWeight: 600,
                    background: mode === 'webrtc' ? '#1f80e0' : 'transparent',
                    color: mode === 'webrtc' ? '#ffffff' : '#8f98a9',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <MonitorUp size={14} /> Screen Share
                </button>
              </div>

              {/* Theater Video Frame */}
              <div className="video-player-container">
                {/* OBS Stream view */}
                {mode === 'obs' && (
                  <>
                    <video
                      ref={obsVideoRef}
                      autoPlay
                      playsInline
                      controls
                      style={{
                        width: '100%', height: '100%', objectFit: 'contain',
                        display: obsLive ? 'block' : 'none',
                      }}
                    />
                    {!obsLive && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#8f98a9', textAlign: 'center', padding: '40px' }}>
                        <div style={{
                          width: '54px', height: '54px', borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: '8px'
                        }}>
                          <Radio size={24} style={{ opacity: 0.5 }} />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>WAITING FOR BROADCAST FEED...</p>
                        <p style={{ fontSize: '0.8rem', margin: 0, maxWidth: '280px' }}>Connect your OBS Studio stream to start hosting a watch party.</p>
                      </div>
                    )}
                    {obsLive && (
                      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', alignItems: 'center', zIndex: 10 }}>
                        <span className="status-pill is-live">● LIVE</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffffff' }}>{formatUptime(obsUptime)}</span>
                      </div>
                    )}
                  </>
                )}

                {/* WebRTC co-sharing view */}
                {mode === 'webrtc' && (
                  <>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%', height: '100%', objectFit: 'contain',
                        display: isBroadcasting ? 'block' : 'none',
                      }}
                    />
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      style={{
                        width: '100%', height: '100%', objectFit: 'contain',
                        display: !isBroadcasting && hasRemoteStream ? 'block' : 'none',
                      }}
                    />
                    {!isBroadcasting && !hasRemoteStream && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8f98a9', gap: '12px', textAlign: 'center', padding: '40px' }}>
                        <div style={{
                          width: '54px', height: '54px', borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: '8px'
                        }}>
                          <VideoOff size={24} style={{ opacity: 0.5 }} />
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>NO SCREEN SHARE ACTIVE</p>
                        <p style={{ fontSize: '0.8rem', margin: 0 }}>Click the button below to stream your screen to this room.</p>
                      </div>
                    )}
                    {isBroadcasting && (
                      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                        <span className="status-pill is-live" style={{ background: '#27d06d' }}>● SHARING SCREEN</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* WebRTC controls (Only visible in screen sharing mode) */}
              {mode === 'webrtc' && (
                <div style={{
                  padding: '12px', display: 'flex', justifyContent: 'center',
                  background: '#0c111b', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '6px'
                }}>
                  {!isBroadcasting ? (
                    <button
                      onClick={startBroadcast}
                      className="submit-btn"
                      style={{ width: 'auto', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <MonitorUp size={16} /> Broadcast Screen
                    </button>
                  ) : (
                    <button
                      onClick={stopBroadcast}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
                        background: 'rgba(255, 46, 85, 0.1)', color: '#ff2e55', border: '1px solid rgba(255, 46, 85, 0.2)',
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                      }}
                    >
                      <VideoOff size={16} /> Stop Sharing
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Side Chat Panel */}
            <div className="live-chat-panel" style={{ height: 'auto', minHeight: '520px' }}>
              {/* Chat Header */}
              <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageCircle size={16} color="#1f80e0" />
                  <h3>Room Chat</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#8f98a9', fontWeight: 600 }}>
                  {members.length} members
                </span>
              </div>

              {/* Connected members horizontal avatars strip */}
              <div className="members-strip">
                {members.map((member, idx) => {
                  const mName = typeof member === 'string' ? member : member.username || 'User';
                  const color = getUsernameColor(mName);
                  return (
                    <div 
                      key={idx} 
                      className="member-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${color}44, ${color}22)`,
                        border: `1.5px solid ${color}`,
                        color: color
                      }}
                      title={mName}
                    >
                      {mName.charAt(0).toUpperCase()}
                    </div>
                  );
                })}
              </div>

              {/* Chat messages */}
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div style={{ margin: 'auto', textAlign: 'center', color: '#8f98a9', fontSize: '0.85rem', padding: '24px 16px' }}>
                    <MessageCircle size={32} style={{ margin: '0 auto 8px', opacity: 0.3, color: '#1f80e0' }} />
                    <p style={{ margin: 0 }}>Start typing to chat with room participants.</p>
                  </div>
                )}
                {messages.map((msg) => {
                  if (msg.type === 'system') {
                    return (
                      <div key={msg.id} className="system-message">
                        {msg.message}
                      </div>
                    );
                  }
                  const color = getUsernameColor(msg.username);
                  return (
                    <div key={msg.id} className="message-item" style={{
                      background: 'rgba(255,255,255,0.015)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      borderLeft: `2.5px solid ${color}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span className="message-user" style={{ color }}>{msg.username}</span>
                        <span style={{ fontSize: '0.65rem', color: '#8f98a9' }}>{formatTimestamp(msg.timestamp)}</span>
                      </div>
                      <span className="message-text">{msg.message}</span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Bottom message input */}
              <div className="chat-input-area">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
                  placeholder="Chat with friends..."
                  className="chat-input"
                />
                <button onClick={sendChatMessage} className="chat-send-btn">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchParty;
