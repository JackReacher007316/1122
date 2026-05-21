import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';

function IntroF1Car() {
  const ref = useRef();
  const wheelsRef = useRef([]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.45;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.12;
    ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.015);
    
    wheelsRef.current.forEach((wheel) => {
      if (wheel) wheel.rotation.z += delta * 6;
    });
  });

  return (
    <Float speed={1.5} rotationIntensity={0.25} floatIntensity={0.4}>
      <group ref={ref}>
        {/* Chassis - Real Madrid White */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.22, 0.58]} />
          <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.8} emissive="#5d2a8f" emissiveIntensity={0.12} />
        </mesh>

        {/* Nose cone - Real Madrid White */}
        <mesh position={[1.05, -0.02, 0]} rotation={[0, 0, -Math.PI / 18]} castShadow>
          <boxGeometry args={[0.7, 0.15, 0.3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.8} />
        </mesh>

        {/* Cockpit / Airbox - Royal Purple */}
        <mesh position={[-0.1, 0.24, 0]} castShadow>
          <boxGeometry args={[0.45, 0.28, 0.24]} />
          <meshStandardMaterial color="#5d2a8f" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Halo - Royal Purple */}
        <mesh position={[0.22, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.035, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#5d2a8f" roughness={0.6} />
        </mesh>

        {/* Front Wing - Casino Gold */}
        <mesh position={[1.35, -0.06, 0]} castShadow>
          <boxGeometry args={[0.2, 0.04, 1.1]} />
          <meshStandardMaterial color="#f3c623" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Rear Wing - Casino Gold */}
        <mesh position={[-0.85, 0.28, 0]} castShadow>
          <boxGeometry args={[0.18, 0.03, 0.85]} />
          <meshStandardMaterial color="#f3c623" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Sidepods - Royal Purple */}
        <mesh position={[0.1, 0.02, 0.36]} castShadow>
          <boxGeometry args={[0.9, 0.2, 0.18]} />
          <meshStandardMaterial color="#5d2a8f" roughness={0.2} metalness={0.75} />
        </mesh>
        <mesh position={[0.1, 0.02, -0.36]} castShadow>
          <boxGeometry args={[0.9, 0.2, 0.18]} />
          <meshStandardMaterial color="#5d2a8f" roughness={0.2} metalness={0.75} />
        </mesh>

        {/* Spinning Wheels */}
        {/* Front Left */}
        <mesh
          ref={(el) => (wheelsRef.current[0] = el)}
          position={[0.72, -0.1, 0.46]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.26, 0.26, 0.26, 24]} />
          <meshStandardMaterial color="#0b0f14" roughness={0.85} metalness={0.15} />
        </mesh>
        {/* Front Right */}
        <mesh
          ref={(el) => (wheelsRef.current[1] = el)}
          position={[0.72, -0.1, -0.46]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.26, 0.26, 0.26, 24]} />
          <meshStandardMaterial color="#0b0f14" roughness={0.85} metalness={0.15} />
        </mesh>
        {/* Rear Left */}
        <mesh
          ref={(el) => (wheelsRef.current[2] = el)}
          position={[-0.6, -0.06, 0.48]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.32, 24]} />
          <meshStandardMaterial color="#0b0f14" roughness={0.85} metalness={0.15} />
        </mesh>
        {/* Rear Right */}
        <mesh
          ref={(el) => (wheelsRef.current[3] = el)}
          position={[-0.6, -0.06, -0.48]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.32, 24]} />
          <meshStandardMaterial color="#0b0f14" roughness={0.85} metalness={0.15} />
        </mesh>

        {/* Orbit Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 10, 80]} />
          <meshBasicMaterial color="#f3c623" transparent opacity={0.45} />
        </mesh>
      </group>
    </Float>
  );
}

function IntroLights({ phase }) {
  const lightsRef = useRef([]);

  useFrame(() => {
    lightsRef.current.forEach((light, index) => {
      if (!light) return;
      if (phase >= 5) {
        light.material.color.setHex(0x111111);
        light.material.emissive.setHex(0x000000);
      } else if (phase > index) {
        light.material.color.setHex(0xf3c623); // Royal Gold start lights
        light.material.emissive.setHex(0xf3c623);
      } else {
        light.material.color.setHex(0x222222);
        light.material.emissive.setHex(0x000000);
      }
    });
  });

  return (
    <group position={[0, 1.8, 0]}>
      {/* Lights backing board */}
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[3.2, 0.38, 0.15]} />
        <meshStandardMaterial color="#141416" roughness={0.7} />
      </mesh>

      {/* 5 spheres representing the starting gantry lights */}
      {Array.from({ length: 5 }).map((_, index) => (
        <group key={index} position={[-1.1 + index * 0.55, 0, 0]}>
          <mesh ref={(el) => (lightsRef.current[index] = el)}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#222222" roughness={0.2} metalness={0.8} emissive="#000" emissiveIntensity={2.5} />
          </mesh>
          {phase > index && phase < 5 && (
            <pointLight color="#f3c623" intensity={0.9} distance={4} />
          )}
        </group>
      ))}
    </group>
  );
}

export default function WelcomeAnimation() {
  const [show, setShow] = useState(() => !sessionStorage.getItem('arena_intro_seen'));
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!show) return undefined;
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2100),
      setTimeout(() => setPhase(5), 2700), // Lights out!
      setTimeout(() => setFadeOut(true), 3500),
      setTimeout(() => {
        sessionStorage.setItem('arena_intro_seen', 'true');
        setShow(false);
      }, 4500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [show]);

  if (!show) return null;

  return (
    <div className={`intro-overlay ${fadeOut ? 'is-leaving' : ''}`}>
      <div className="intro-canvas">
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 0.2, 4.5], fov: 48 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
            <Sparkles count={55} scale={[6, 4, 4]} size={1.4} speed={0.25} color="#f3c623" opacity={0.34} />
            <Sparkles count={25} scale={[6, 4, 4]} size={1.0} speed={0.15} color="#5d2a8f" opacity={0.18} />
            
            <IntroF1Car />
            <IntroLights phase={phase} />

            <ambientLight intensity={0.26} />
            <directionalLight position={[3, 3, 5]} color="#ffffff" intensity={1.4} />
            <pointLight position={[-2.8, -1.5, 2]} color="#5d2a8f" intensity={1.6} distance={10} />
            <pointLight position={[3, 1.8, 2]} color="#00c0f9" intensity={1.1} distance={10} />
          </Canvas>
        </Suspense>
      </div>

      <div className="intro-copy">
        <div className={`intro-kicker ${phase >= 1 ? 'is-visible' : ''}`}>
          {phase >= 5 ? 'HALA MADRID! LIGHTS OUT AND AWAY WE GO!' : 'MONACO GP x REAL MADRID'}
        </div>
        <h1 className={phase >= 2 ? 'is-visible' : ''}>MONACO GRAND PRIX</h1>
        <div className={`intro-line ${phase >= 3 ? 'is-visible' : ''}`}>
          <span />
        </div>
      </div>
    </div>
  );
}
