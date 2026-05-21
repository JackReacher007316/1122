import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { MonitorUp, Users, VideoOff, Radio, Tv, Copy, Check } from 'lucide-react';
import flvjs from 'flv.js';
import SportTabs from '../components/SportTabs';

const WatchParty = ({ activeSport, setActiveSport }) => {
  const [mode, setMode] = useState('obs'); // 'obs' or 'webrtc'
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [obsLive, setObsLive] = useState(false);
  const [obsUptime, setObsUptime] = useState(0);
  const [copied, setCopied] = useState(null);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const obsVideoRef = useRef();
  const socketRef = useRef();
  const peerConnectionRef = useRef();
  const streamRef = useRef();
  const flvPlayerRef = useRef();
  const isBroadcastingRef = useRef(false);
  const uptimeInterval = useRef();

  useEffect(() => { isBroadcastingRef.current = isBroadcasting; }, [isBroadcasting]);

  // Check OBS stream status
  const checkObsStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/stream/status');
      const data = await res.json();
      setObsLive(data.live);
      if (data.live && data.streams[0]) setObsUptime(data.streams[0].uptime);
    } catch { /* ignore */ }
  }, []);

  // Initialize FLV player for OBS stream
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

  // Socket.io + WebRTC setup
  useEffect(() => {
    function initPeerConnection(target) {
      const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peer.onicecandidate = (e) => { if (e.candidate && socketRef.current) socketRef.current.emit('ice-candidate', { target, candidate: e.candidate }); };
      peer.ontrack = (e) => { if (remoteVideoRef.current) { remoteVideoRef.current.srcObject = e.streams[0]; setHasRemoteStream(true); } };
      if (streamRef.current) streamRef.current.getTracks().forEach(t => peer.addTrack(t, streamRef.current));
      return peer;
    }
    async function createOffer(target) {
      const peer = initPeerConnection(target); peerConnectionRef.current = peer;
      const offer = await peer.createOffer(); await peer.setLocalDescription(offer);
      if (socketRef.current) socketRef.current.emit('offer', { target, sdp: peer.localDescription });
    }
    async function handleOffer(p) {
      const peer = initPeerConnection(p.caller); peerConnectionRef.current = peer;
      await peer.setRemoteDescription(new RTCSessionDescription(p.sdp));
      const answer = await peer.createAnswer(); await peer.setLocalDescription(answer);
      if (socketRef.current) socketRef.current.emit('answer', { target: p.caller, sdp: peer.localDescription });
    }
    async function handleAnswer(p) { if (peerConnectionRef.current) await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(p.sdp)); }
    async function handleIce(p) { if (peerConnectionRef.current) await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(p.candidate)); }

    socketRef.current = io();
    socketRef.current.on('connect', () => socketRef.current.emit('join-stream'));
    socketRef.current.on('user-joined', (uid) => { setViewers(v => v + 1); if (isBroadcastingRef.current && streamRef.current) createOffer(uid); });
    socketRef.current.on('user-left', () => { setViewers(v => Math.max(0, v - 1)); setHasRemoteStream(false); });
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIce);
    socketRef.current.on('obs-stream-live', (data) => { setObsLive(data.live); if (data.live && mode === 'obs') setTimeout(initFlvPlayer, 1000); });

    checkObsStatus();
    const pollId = setInterval(checkObsStatus, 5000);

    return () => {
      clearInterval(pollId);
      if (socketRef.current) socketRef.current.disconnect();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (flvPlayerRef.current) { flvPlayerRef.current.destroy(); flvPlayerRef.current = null; }
    };
  }, [checkObsStatus, initFlvPlayer, mode]);

  // Auto-connect FLV player when OBS goes live
  useEffect(() => {
    if (obsLive && mode === 'obs') initFlvPlayer();
    if (obsLive) { uptimeInterval.current = setInterval(() => setObsUptime(u => u + 1), 1000); }
    return () => clearInterval(uptimeInterval.current);
  }, [obsLive, mode, initFlvPlayer]);

  const startBroadcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setIsBroadcasting(true);
      stream.getVideoTracks()[0].onended = () => stopBroadcast();
    } catch { alert("Failed to capture screen."); }
  };

  const stopBroadcast = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsBroadcasting(false);
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (peerConnectionRef.current) peerConnectionRef.current.close();
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text); setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatUptime = (s) => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const obsSettings = { server: `rtmp://${window.location.hostname}:1935/live`, key: 'fofa' };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--neon-pink)', fontFamily: 'var(--font-heading)', letterSpacing: '4px', marginBottom: '6px' }}>⬡ BROADCAST CENTER</div>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Watch <span className="heading-gradient">Party</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Stream via OBS Studio or share your screen directly.</p>
        </div>
        <div className="glass-panel" style={{ display: 'flex', gap: '20px', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} color="var(--neon-blue)" /><span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{viewers + 1} Online</span></div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: obsLive || isBroadcasting ? '#ff2800' : '#00ff87', boxShadow: `0 0 8px ${obsLive || isBroadcasting ? '#ff2800' : '#00ff87'}`, animation: obsLive || isBroadcasting ? 'pulse 1.5s infinite' : 'none' }} />
            <span style={{ color: obsLive || isBroadcasting ? '#ff2800' : 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
              {obsLive ? 'OBS LIVE' : isBroadcasting ? 'SCREEN LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '400px' }}>
        <button onClick={() => setMode('obs')} style={{
          flex: 1, padding: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: mode === 'obs' ? 'linear-gradient(135deg, rgba(229,9,20,0.3), rgba(168,85,247,0.15))' : 'transparent',
          color: mode === 'obs' ? '#fff' : 'var(--text-muted)', transition: 'all 0.3s', boxShadow: mode === 'obs' ? '0 0 20px rgba(229,9,20,0.15)' : 'none'
        }}><Radio size={16} /> OBS STUDIO</button>
        <button onClick={() => setMode('webrtc')} style={{
          flex: 1, padding: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.75rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: mode === 'webrtc' ? 'linear-gradient(135deg, rgba(0,229,255,0.3), rgba(168,85,247,0.15))' : 'transparent',
          color: mode === 'webrtc' ? '#fff' : 'var(--text-muted)', transition: 'all 0.3s', boxShadow: mode === 'webrtc' ? '0 0 20px rgba(0,229,255,0.15)' : 'none'
        }}><Tv size={16} /> SCREEN SHARE</button>
      </div>

      {/* ===== OBS MODE ===== */}
      {mode === 'obs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Video Player */}
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderTop: obsLive ? '2px solid #ff2800' : '2px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#0a0b10', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <video ref={obsVideoRef} autoPlay playsInline controls style={{ width: '100%', height: '100%', objectFit: 'contain', display: obsLive ? 'block' : 'none' }} />
              {!obsLive && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid rgba(229,9,20,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={28} style={{ opacity: 0.4 }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', letterSpacing: '2px' }}>WAITING FOR OBS STREAM...</p>
                  <p style={{ fontSize: '0.8rem', maxWidth: '300px', textAlign: 'center' }}>Configure OBS with the settings on the right and start streaming.</p>
                </div>
              )}
              {obsLive && (
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="live-badge">● LIVE</span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', letterSpacing: '1px' }}>{formatUptime(obsUptime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* OBS Config Panel */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Radio size={18} color="var(--neon-red)" /> OBS Settings
            </h3>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-heading)', letterSpacing: '2px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>RTMP SERVER</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', fontSize: '0.8rem', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', wordBreak: 'break-all' }}>{obsSettings.server}</code>
                <button onClick={() => copyToClipboard(obsSettings.server, 'server')} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                  {copied === 'server' ? <Check size={16} color="#00ff87" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <label style={{ fontSize: '0.65rem', fontFamily: 'var(--font-heading)', letterSpacing: '2px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>STREAM KEY</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--gold)', border: '1px solid rgba(255,215,0,0.15)', fontWeight: 'bold' }}>{obsSettings.key}</code>
                <button onClick={() => copyToClipboard(obsSettings.key, 'key')} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                  {copied === 'key' ? <Check size={16} color="#00ff87" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(229,9,20,0.06)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(229,9,20,0.15)' }}>
              <h4 style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', letterSpacing: '2px', color: 'var(--neon-red)', marginBottom: '12px' }}>QUICK SETUP</h4>
              <ol style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '16px', lineHeight: 1.8 }}>
                <li>Open <strong style={{ color: '#fff' }}>OBS Studio</strong></li>
                <li>Go to <strong style={{ color: '#fff' }}>Settings → Stream</strong></li>
                <li>Service: <strong style={{ color: '#fff' }}>Custom</strong></li>
                <li>Paste the <strong style={{ color: 'var(--gold)' }}>Server</strong> and <strong style={{ color: 'var(--gold)' }}>Key</strong> above</li>
                <li>Click <strong style={{ color: '#00ff87' }}>Start Streaming</strong></li>
              </ol>
            </div>

            <div style={{ padding: '12px', background: obsLive ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '10px', border: `1px solid ${obsLive ? 'rgba(0,255,135,0.2)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: obsLive ? '#00ff87' : '#666', boxShadow: obsLive ? '0 0 10px #00ff87' : 'none', animation: obsLive ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-heading)', letterSpacing: '1px', color: obsLive ? '#00ff87' : 'var(--text-muted)' }}>
                {obsLive ? `STREAM ACTIVE — ${formatUptime(obsUptime)}` : 'WAITING FOR OBS...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== WEBRTC SCREEN SHARE MODE ===== */}
      {mode === 'webrtc' && (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', borderTop: isBroadcasting ? '2px solid var(--neon-red)' : '2px solid var(--neon-blue)' }}>
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#0a0b10', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain', display: isBroadcasting ? 'block' : 'none' }} />
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', display: !isBroadcasting ? 'block' : 'none' }} />
            {!isBroadcasting && !hasRemoteStream && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', gap: '12px' }}>
                <VideoOff size={48} style={{ opacity: 0.4 }} />
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', letterSpacing: '2px' }}>NO STREAM AVAILABLE</p>
                <p style={{ fontSize: '0.8rem' }}>Click below to share your screen</p>
              </div>
            )}
            {isBroadcasting && <div style={{ position: 'absolute', top: '12px', right: '12px' }}><span className="live-badge">● REC</span></div>}
          </div>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
            {!isBroadcasting ? (
              <button className="btn-primary" onClick={startBroadcast} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px' }}>
                <MonitorUp size={20} /> Share Screen & Broadcast
              </button>
            ) : (
              <button onClick={stopBroadcast} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', background: 'transparent', color: 'var(--neon-red)', border: '1px solid var(--neon-red)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                <VideoOff size={20} /> Stop Broadcasting
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchParty;
