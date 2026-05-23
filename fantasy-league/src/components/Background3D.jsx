import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function FloatingMesh({ position, color, size, speed }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime * speed;
    
    // Slow drifting movement
    meshRef.current.position.x = position[0] + Math.sin(time) * 2;
    meshRef.current.position.y = position[1] + Math.cos(time * 0.8) * 1.5;
    meshRef.current.position.z = position[2] + Math.sin(time * 0.5) * 1;
    
    // Rotate slowly
    meshRef.current.rotation.x = time * 0.1;
    meshRef.current.rotation.y = time * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.06}
        wireframe={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function AmbientGlows() {
  return (
    <group>
      {/* Floating abstract glowing blobs */}
      <FloatingMesh position={[-6, 3, -10]} color="#1f80e0" size={8} speed={0.12} />
      <FloatingMesh position={[6, -2, -12]} color="#0052a3" size={9} speed={0.08} />
      <FloatingMesh position={[0, 4, -8]} color="#38bdf8" size={5} speed={0.15} />
      <FloatingMesh position={[-4, -4, -14]} color="#0369a1" size={7} speed={0.09} />
    </group>
  );
}

function CameraDrift() {
  useFrame((state) => {
    const { camera } = state;
    const time = state.clock.elapsedTime;
    // Tiny drifting rotation
    camera.position.x = Math.sin(time * 0.05) * 0.8;
    camera.position.y = Math.cos(time * 0.04) * 0.5;
  });
  return null;
}

export default function Background3D() {
  return (
    <div className="arena-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#030b17']} />
          <fog attach="fog" args={['#030b17', 5, 25]} />
          
          <CameraDrift />
          <AmbientGlows />
          
          {/* Subtle cinematic space dust/particles */}
          <Sparkles count={80} scale={[25, 15, 20]} size={1.2} speed={0.08} color="#1f80e0" opacity={0.3} />
          <Sparkles count={40} scale={[25, 15, 20]} size={1.5} speed={0.12} color="#f3c623" opacity={0.2} />
          
          {/* Light setup */}
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 10, -5]} color="#1f80e0" intensity={1.5} distance={30} />
          <pointLight position={[-10, -5, -5]} color="#0052a3" intensity={1.2} distance={25} />
        </Suspense>
      </Canvas>
      <div className="arena-vignette" />
    </div>
  );
}
