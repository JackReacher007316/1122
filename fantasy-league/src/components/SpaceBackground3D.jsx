import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// ─── Warp-speed star streaks ────────────────────────────────────────────────
function WarpStars({ count = 800 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.015;
      ref.current.rotation.y += delta * 0.008;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#a78bfa" size={0.35} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

// ─── Floating nebula cloud mesh ──────────────────────────────────────────────
function NebulaMesh({ position, color, scale = 1 }) {
  const ref = useRef();
  const speedRef = useRef(Math.random() * 0.003 + 0.001);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.position.y = position[1] + Math.sin(t * speedRef.current * 10) * 2;
      ref.current.rotation.z += speedRef.current * 0.5;
      ref.current.rotation.x += speedRef.current * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={[scale * 18, scale * 12, scale * 8]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Rotating torus ring ────────────────────────────────────────────────────
function SpaceRing({ position, color, speed = 0.3 }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * speed;
      ref.current.rotation.y += delta * speed * 0.7;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[3, 0.06, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.5} />
    </mesh>
  );
}

// ─── Floating glowing orb ───────────────────────────────────────────────────
function GlowOrb({ position, color }) {
  const ref = useRef();
  const t0 = useRef(Math.random() * 10);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + t0.current;
      ref.current.position.y = position[1] + Math.sin(t * 0.4) * 1.5;
      ref.current.material.opacity = 0.4 + Math.sin(t * 0.8) * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.4} />
    </mesh>
  );
}

// ─── Slow rotating galaxy disc ───────────────────────────────────────────────
function GalaxyDisc() {
  const ref = useRef();
  const count = 3000;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const arm = Math.floor(Math.random() * 3) * ((Math.PI * 2) / 3);
      const spin = r * 0.5;
      arr[i * 3 + 0] = Math.cos(theta + arm + spin) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      arr[i * 3 + 2] = Math.sin(theta + arm + spin) * r;
    }
    return arr;
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const mix = Math.random();
      arr[i * 3 + 0] = 0.4 + mix * 0.6;
      arr[i * 3 + 1] = 0.1 + mix * 0.3;
      arr[i * 3 + 2] = 0.8 + mix * 0.2;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref} position={[0, -20, -60]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.25} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

// ─── Camera drift ────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.05) * 3;
    camera.position.y = Math.cos(t * 0.04) * 1.5;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Main Scene ──────────────────────────────────────────────────────────────
function SpaceScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} color="#7c3aed" intensity={2} />
      <pointLight position={[-15, -10, -20]} color="#06b6d4" intensity={1.5} />
      <pointLight position={[0, 20, -30]} color="#ec4899" intensity={1} />

      <CameraRig />
      <GalaxyDisc />
      <Stars radius={120} depth={60} count={7000} factor={5} saturation={0.8} fade speed={1} />
      <Sparkles count={200} scale={80} size={2} speed={0.3} color="#a78bfa" />
      <WarpStars count={600} />

      {/* Nebula clouds */}
      <NebulaMesh position={[-25, 10, -50]} color="#7c3aed" scale={1.4} />
      <NebulaMesh position={[30, -5, -60]} color="#06b6d4" scale={1.1} />
      <NebulaMesh position={[5, 15, -40]} color="#ec4899" scale={0.9} />
      <NebulaMesh position={[-10, -15, -35]} color="#a78bfa" scale={0.7} />

      {/* Glowing orbs */}
      <GlowOrb position={[-20, 5, -30]} color="#7c3aed" />
      <GlowOrb position={[25, -8, -40]} color="#06b6d4" />
      <GlowOrb position={[0, 12, -25]} color="#ec4899" />

      {/* Rings */}
      <SpaceRing position={[18, 8, -35]} color="#a78bfa" speed={0.25} />
      <SpaceRing position={[-22, -5, -45]} color="#06b6d4" speed={0.18} />
    </>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
export default function SpaceBackground3D() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: -1, background: '#02010a'
    }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <SpaceScene />
      </Canvas>
    </div>
  );
}
