import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';

function IntroBall() {
  const ref = useRef();
  const ring = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.8;
    ref.current.rotation.y += delta * 1.15;
    ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.025);
    if (ring.current) ring.current.rotation.z -= delta * 0.8;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[1, 56, 56]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.36} metalness={0.3} emissive="#20df7f" emissiveIntensity={0.08} />
        </mesh>
        <mesh scale={0.74}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#101820" transparent opacity={0.28} roughness={0.55} />
        </mesh>
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.22, 0.022, 10, 80]} />
          <meshBasicMaterial color="#20df7f" transparent opacity={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

export default function WelcomeAnimation() {
  const [show, setShow] = useState(() => !sessionStorage.getItem('arena_intro_seen'));
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!show) return undefined;
    const timers = [
      setTimeout(() => setPhase(1), 220),
      setTimeout(() => setPhase(2), 820),
      setTimeout(() => setPhase(3), 1420),
      setTimeout(() => setFadeOut(true), 3100),
      setTimeout(() => {
        sessionStorage.setItem('arena_intro_seen', 'true');
        setShow(false);
      }, 4100),
    ];

    return () => timers.forEach(clearTimeout);
  }, [show]);

  if (!show) return null;

  return (
    <div className={`intro-overlay ${fadeOut ? 'is-leaving' : ''}`}>
      <div className="intro-canvas">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0, 5], fov: 48 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <Sparkles count={42} scale={[8, 5, 5]} size={1.2} speed={0.24} color="#f8fafc" opacity={0.34} />
            <IntroBall />
            <ambientLight intensity={0.22} />
            <directionalLight position={[3, 3, 5]} color="#ffffff" intensity={1.3} />
            <pointLight position={[-2.8, -1.5, 2]} color="#20df7f" intensity={1.4} distance={10} />
            <pointLight position={[3, 1.8, 2]} color="#ff8a1c" intensity={0.9} distance={10} />
          </Canvas>
        </Suspense>
      </div>

      <div className="intro-copy">
        <div className={`intro-kicker ${phase >= 1 ? 'is-visible' : ''}`}>Live multi-sport arena</div>
        <h1 className={phase >= 2 ? 'is-visible' : ''}>IIITN Sportsverse</h1>
        <div className={`intro-line ${phase >= 3 ? 'is-visible' : ''}`}>
          <span />
        </div>
      </div>
    </div>
  );
}
