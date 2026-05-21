import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function IconCore({ color, shape, active, hovered }) {
  const group = useRef();
  const ring = useRef();
  const wheelsRef = useRef([]);
  const speed = active ? 1.55 : hovered ? 1.15 : 0.58;

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * speed;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.18;
    const target = active ? 1.18 : hovered ? 1.08 : 1;
    group.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
    if (ring.current) ring.current.rotation.z -= delta * 0.9;

    wheelsRef.current.forEach((wheel) => {
      if (wheel) wheel.rotation.z += delta * (speed * 12);
    });
  });

  const materialProps = {
    color,
    emissive: color,
    emissiveIntensity: active ? 0.85 : hovered ? 0.52 : 0.28,
    roughness: 0.22,
    metalness: 0.5,
  };

  return (
    <group ref={group}>
      {shape === 'basketball' || shape === 'football' || shape === 'tennis' || shape === 'cricket' || shape === 'baseball' ? (
        <mesh>
          <sphereGeometry args={[0.38, 36, 36]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ) : shape === 'f1' ? (
        <group scale={0.7}>
          {/* Main Chassis Body */}
          <mesh castShadow>
            <boxGeometry args={[0.92, 0.18, 0.36]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>

          {/* Nose cone pointing forward (+X direction) */}
          <mesh position={[0.55, -0.01, 0]} rotation={[0, 0, -Math.PI / 18]} castShadow>
            <boxGeometry args={[0.35, 0.12, 0.2]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>

          {/* Cockpit / Airbox */}
          <mesh position={[-0.05, 0.18, 0]} castShadow>
            <boxGeometry args={[0.22, 0.2, 0.16]} />
            <meshStandardMaterial color="#141416" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Halo */}
          <mesh position={[0.1, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.02, 8, 20, Math.PI]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>

          {/* Front Wing */}
          <mesh position={[0.72, -0.05, 0]} castShadow>
            <boxGeometry args={[0.1, 0.02, 0.65]} />
            <meshStandardMaterial color="#111111" roughness={0.8} />
          </mesh>

          {/* Rear Wing */}
          <mesh position={[-0.52, 0.2, 0]} castShadow>
            <boxGeometry args={[0.1, 0.02, 0.5]} />
            <meshStandardMaterial color="#111111" roughness={0.8} />
          </mesh>
          {/* Rear Wing Endplates */}
          <mesh position={[-0.52, 0.16, 0.24]}>
            <boxGeometry args={[0.18, 0.14, 0.01]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          <mesh position={[-0.52, 0.16, -0.24]}>
            <boxGeometry args={[0.18, 0.14, 0.01]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>

          {/* Sidepods */}
          <mesh position={[0.06, 0.01, 0.24]} castShadow>
            <boxGeometry args={[0.48, 0.14, 0.12]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} />
          </mesh>
          <mesh position={[0.06, 0.01, -0.24]} castShadow>
            <boxGeometry args={[0.48, 0.14, 0.12]} />
            <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} />
          </mesh>

          {/* 4 Wheels */}
          {/* Front Left */}
          <mesh
            ref={(el) => (wheelsRef.current[0] = el)}
            position={[0.38, -0.06, 0.28]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.14, 16]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.8} />
          </mesh>
          {/* Front Right */}
          <mesh
            ref={(el) => (wheelsRef.current[1] = el)}
            position={[0.38, -0.06, -0.28]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.14, 16]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.8} />
          </mesh>
          {/* Rear Left */}
          <mesh
            ref={(el) => (wheelsRef.current[2] = el)}
            position={[-0.34, -0.04, 0.28]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.18, 0.18, 0.16, 16]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.8} />
          </mesh>
          {/* Rear Right */}
          <mesh
            ref={(el) => (wheelsRef.current[3] = el)}
            position={[-0.34, -0.04, -0.28]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.18, 0.18, 0.16, 16]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.8} />
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
      <pointLight color={color} intensity={active ? 1.85 : hovered ? 1.25 : 0.7} distance={3.8} />
    </group>
  );
}

export default function Icon3D({
  color = '#5d2a8f',
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
