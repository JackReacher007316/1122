import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const BALLS = [
  { shape: 'football', color: '#f7f7f7', stripe: '#111111', position: [-5.6, 1.3, -6], scale: 0.78, speed: 0.55 },
  { shape: 'basketball', color: '#e87920', stripe: '#121212', position: [4.9, 0.4, -7.8], scale: 0.72, speed: 0.7 },
  { shape: 'tennis', color: '#c8ff41', stripe: '#ffffff', position: [1.9, 2.7, -8.6], scale: 0.46, speed: 0.9 },
  { shape: 'cricket', color: '#bd1f2d', stripe: '#f8fafc', position: [-1.4, -0.5, -5.5], scale: 0.44, speed: 0.82 },
  { shape: 'baseball', color: '#f8fafc', stripe: '#e11d48', position: [7, 2.1, -10.2], scale: 0.48, speed: 0.64 },
];

function FieldLine({ position, scale }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#f8fafc" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  );
}

function ArenaField() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.z = -4.8 + Math.sin(state.clock.elapsedTime * 0.3) * 0.18;
  });

  return (
    <group ref={ref} position={[0, -3.1, -5]} rotation={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 14, 1, 1]} />
        <meshStandardMaterial color="#124326" roughness={0.82} metalness={0.05} />
      </mesh>
      <FieldLine position={[0, 0.012, 0]} scale={[0.06, 13, 1]} />
      <FieldLine position={[-5.3, 0.014, 0]} scale={[0.035, 13, 1]} />
      <FieldLine position={[5.3, 0.014, 0]} scale={[0.035, 13, 1]} />
      <FieldLine position={[0, 0.016, -3.4]} scale={[20, 0.035, 1]} />
      <FieldLine position={[0, 0.016, 3.4]} scale={[20, 0.035, 1]} />
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.018, 12, 80]} />
        <meshBasicMaterial color="#f8fafc" transparent opacity={0.24} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StadiumLights() {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.04;
  });

  const towers = useMemo(
    () => [
      [-9, 0.3, -8, 0.35],
      [9, 0.1, -8, -0.35],
      [-7.5, 2.6, -13, 0.2],
      [7.5, 2.4, -13, -0.2],
    ],
    []
  );

  return (
    <group ref={group}>
      {towers.map(([x, y, z, angle], index) => (
        <group key={index} position={[x, y, z]} rotation={[0, angle, 0]}>
          <mesh position={[0, -1.1, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 4.5, 12]} />
            <meshStandardMaterial color="#d1d5db" roughness={0.35} metalness={0.7} />
          </mesh>
          <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
            <coneGeometry args={[1.1, 4.2, 32, 1, true]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.075} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0, 1.3, 0.4]} color={index % 2 ? '#20df7f' : '#7dd3fc'} intensity={1.6} distance={12} />
        </group>
      ))}
    </group>
  );
}

function SportBall({ ball, index }) {
  const ref = useRef();
  const ringA = useRef();
  const ringB = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * ball.speed;
    ref.current.rotation.y += delta * (ball.speed * 1.4);
    ref.current.position.y = ball.position[1] + Math.sin(state.clock.elapsedTime * ball.speed + index) * 0.22;

    if (ringA.current) ringA.current.rotation.z += delta * 0.22;
    if (ringB.current) ringB.current.rotation.x += delta * 0.18;
  });

  const ringOpacity = ball.shape === 'football' ? 0.16 : 0.45;

  return (
    <Float speed={1 + index * 0.12} rotationIntensity={0.22} floatIntensity={0.36}>
      <group ref={ref} position={ball.position} scale={ball.scale}>
        <mesh castShadow>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial color={ball.color} roughness={0.38} metalness={0.22} emissive={ball.color} emissiveIntensity={0.04} />
        </mesh>
        <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.02, 0.018, 10, 80]} />
          <meshBasicMaterial color={ball.stripe} transparent opacity={ringOpacity} />
        </mesh>
        <mesh ref={ringB} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.02, 0.018, 10, 80]} />
          <meshBasicMaterial color={ball.stripe} transparent opacity={ringOpacity} />
        </mesh>
        {ball.shape === 'football' && (
          <mesh scale={0.72}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#111111" roughness={0.6} metalness={0.1} transparent opacity={0.22} />
          </mesh>
        )}
      </group>
    </Float>
  );
}

function ScoreRibbon() {
  const ref = useRef();
  const panels = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        x: -12 + index * 1.42,
        y: 3.75 + Math.sin(index) * 0.18,
        z: -11 - (index % 3) * 0.42,
        color: ['#20df7f', '#ff8a1c', '#4bb7ff', '#ff314a', '#f2c94c'][index % 5],
      })),
    []
  );

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.18) * 1.2;
  });

  return (
    <group ref={ref}>
      {panels.map((panel, index) => (
        <mesh key={index} position={[panel.x, panel.y, panel.z]} rotation={[0.05, -0.22, 0]} scale={[0.9, 0.18, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={panel.color} emissive={panel.color} emissiveIntensity={0.38} roughness={0.2} metalness={0.35} transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  );
}

function CameraDrift() {
  useFrame((state) => {
    const { camera } = state;
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.55;
    camera.position.y = 1 + Math.cos(state.clock.elapsedTime * 0.045) * 0.22;
    camera.lookAt(0, -0.55, -5.5);
  });
  return null;
}

export default function Background3D() {
  return (
    <div className="arena-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1, 8.8], fov: 54 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
        dpr={[1, 1.5]}
        shadows
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#05070a']} />
          <fog attach="fog" args={['#05070a', 7, 24]} />
          <CameraDrift />
          <ArenaField />
          <StadiumLights />
          <ScoreRibbon />
          {BALLS.map((ball, index) => (
            <SportBall key={ball.shape} ball={ball} index={index} />
          ))}
          <Sparkles count={65} scale={[18, 9, 16]} size={1.2} speed={0.16} color="#f8fafc" opacity={0.16} />
          <ambientLight intensity={0.18} />
          <directionalLight position={[0, 6, 5]} color="#ffffff" intensity={1.05} castShadow />
          <pointLight position={[0, 3, -3]} color="#20df7f" intensity={1.6} distance={12} />
          <pointLight position={[5, 1.8, -4]} color="#ff8a1c" intensity={0.9} distance={10} />
        </Suspense>
      </Canvas>
      <div className="arena-vignette" />
    </div>
  );
}
