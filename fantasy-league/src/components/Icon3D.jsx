import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function IconCore({ color, shape, active, hovered }) {
  const group = useRef();
  const ring = useRef();
  const speed = active ? 1.45 : hovered ? 1.05 : 0.52;

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * speed;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.18;
    const target = active ? 1.16 : hovered ? 1.08 : 1;
    group.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
    if (ring.current) ring.current.rotation.z -= delta * 0.9;
  });

  const materialProps = {
    color,
    emissive: color,
    emissiveIntensity: active ? 0.75 : hovered ? 0.46 : 0.24,
    roughness: 0.24,
    metalness: 0.46,
  };

  return (
    <group ref={group}>
      {shape === 'basketball' || shape === 'football' || shape === 'tennis' || shape === 'cricket' || shape === 'baseball' ? (
        <mesh>
          <sphereGeometry args={[0.38, 36, 36]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ) : shape === 'f1' ? (
        <group>
          <mesh scale={[0.85, 0.22, 0.34]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[-0.38, -0.22, 0.24]}>
            <torusGeometry args={[0.14, 0.045, 10, 28]} />
            <meshStandardMaterial color="#0b0f14" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0.38, -0.22, 0.24]}>
            <torusGeometry args={[0.14, 0.045, 10, 28]} />
            <meshStandardMaterial color="#0b0f14" roughness={0.35} metalness={0.2} />
          </mesh>
        </group>
      ) : shape === 'shield' ? (
        <mesh>
          <octahedronGeometry args={[0.46, 0]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ) : shape === 'live' ? (
        <mesh>
          <torusKnotGeometry args={[0.28, 0.09, 80, 14]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ) : (
        <mesh>
          <icosahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      )}

      {(active || hovered) && (
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.54, 0.015, 8, 58]} />
          <meshBasicMaterial color={color} transparent opacity={active ? 0.72 : 0.42} />
        </mesh>
      )}
      <pointLight color={color} intensity={active ? 1.7 : hovered ? 1.15 : 0.65} distance={3.8} />
    </group>
  );
}

export default function Icon3D({
  color = '#20df7f',
  shape = 'default',
  size = 30,
  active = false,
  hovered = false,
}) {
  if (size <= 34) {
    return (
      <span
        className={`icon-3d mini-icon-3d mini-${shape} ${active ? 'is-active' : ''} ${hovered ? 'is-hovered' : ''}`}
        style={{ '--sport-color': color, width: size, height: size }}
      >
        <span />
      </span>
    );
  }

  return (
    <span className="icon-3d" style={{ width: size, height: size }}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 2.9], fov: 44 }} gl={{ antialias: true, alpha: true }} dpr={1}>
          <ambientLight intensity={0.42} />
          <directionalLight position={[2, 2.5, 2]} intensity={1.2} />
          <IconCore color={color} shape={shape} active={active} hovered={hovered} />
        </Canvas>
      </Suspense>
    </span>
  );
}
