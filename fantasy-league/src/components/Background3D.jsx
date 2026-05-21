import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';

const CARS = [
  { id: 'rm-white', color: '#ffffff', speed: 1.1, radius: 11.2, offset: 0, scale: 0.8, secondaryColor: '#5d2a8f', accentColor: '#f3c623', decal: 'RM Blancos' },
  { id: 'monaco-red', color: '#e10600', speed: 0.95, radius: 12.3, offset: Math.PI * 0.5, scale: 0.8, secondaryColor: '#ffffff', accentColor: '#f3c623', decal: 'Monaco GP' },
  { id: 'rm-purple', color: '#5d2a8f', speed: 1.05, radius: 11.8, offset: Math.PI, scale: 0.8, secondaryColor: '#ffffff', accentColor: '#f3c623', decal: 'Hala Madrid' },
  { id: 'rm-gold', color: '#f3c623', speed: 0.9, radius: 12.8, offset: Math.PI * 1.5, scale: 0.8, secondaryColor: '#5d2a8f', accentColor: '#ffffff', decal: 'Bernabéu' },
];

function TrackKerbs({ radius, count = 48, width = 0.4 }) {
  // Monaco GP flag colors: alternating Red and White
  const kerbs = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const isRed = i % 2 === 0;
      items.push({
        x,
        z,
        angle: -angle,
        color: isRed ? '#e10600' : '#ffffff',
      });
    }
    return items;
  }, [radius, count]);

  return (
    <group>
      {kerbs.map((kerb, idx) => (
        <mesh
          key={idx}
          position={[kerb.x, 0.02, kerb.z]}
          rotation={[0, kerb.angle, 0]}
        >
          <boxGeometry args={[width, 0.04, 0.25]} />
          <meshStandardMaterial
            color={kerb.color}
            roughness={0.8}
            metalness={0.2}
            emissive={kerb.color}
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

function Yacht({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Yacht Hull */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.5, 6.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.5} />
      </mesh>
      {/* Cabin Lower Deck */}
      <mesh position={[0, 0.45, -0.4]} castShadow>
        <boxGeometry args={[2.0, 0.45, 4.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* Cabin Upper Deck */}
      <mesh position={[0, 0.85, -0.8]} castShadow>
        <boxGeometry args={[1.5, 0.4, 2.8]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.2} />
      </mesh>
      {/* Yacht Windows (Black Glossy) */}
      <mesh position={[0, 0.5, 0.6]}>
        <boxGeometry args={[1.9, 0.2, 1.8]} />
        <meshStandardMaterial color="#08080a" roughness={0.05} metalness={0.9} />
      </mesh>
      {/* Mast / Radar */}
      <mesh position={[0, 1.4, -1.2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
        <meshStandardMaterial color="#a0a0a5" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Accent Gold Stripe on Hull */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.52, 0.06, 6.52]} />
        <meshStandardMaterial color="#f3c623" emissive="#f3c623" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function CircuitTunnel() {
  // We place 12 arched ribs along the track circle from angle 0 to Math.PI * 0.48 (Monaco Tunnel section)
  const ribs = useMemo(() => {
    const items = [];
    const count = 12;
    const startAngle = 0;
    const endAngle = Math.PI * 0.48;
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (i / (count - 1)) * (endAngle - startAngle);
      const x = Math.cos(angle) * 11.75;
      const z = Math.sin(angle) * 11.75;
      items.push({ x, z, angle, id: i });
    }
    return items;
  }, []);

  return (
    <group>
      {/* Tunnel Canopy Arch ribs */}
      {ribs.map((rib) => (
        <group key={rib.id} position={[rib.x, 0, rib.z]} rotation={[0, -rib.angle + Math.PI / 2, 0]}>
          {/* Main Arch structure - a sliced torus forming an overhead canopy */}
          <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
            <torusGeometry args={[2.4, 0.12, 8, 32, Math.PI]} />
            <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Glowing internal neon strip (yellow/warm casino lighting) */}
          <mesh rotation={[0, 0, 0]} position={[0, 0, 0.02]}>
            <torusGeometry args={[2.35, 0.04, 6, 32, Math.PI]} />
            <meshBasicMaterial color="#f3c623" toneMapping={false} />
          </mesh>
          {/* Small internal downward lights */}
          <pointLight color="#f3c623" intensity={0.45} distance={5} position={[0, 2.0, 0]} />
        </group>
      ))}
      
      {/* Semi-transparent Tunnel Roof Shell */}
      <mesh position={[7.5, 0.3, -2.5]} rotation={[0, -Math.PI / 4, 0]}>
        <cylinderGeometry args={[11.75, 11.75, 5, 32, 1, true, 0, Math.PI * 0.48]} />
        <meshStandardMaterial color="#0e0e14" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CircuitBillboard({ position, rotation, label }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Support Poles */}
      <mesh position={[-0.9, -1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.5, 8]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      <mesh position={[0.9, -1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.5, 8]} />
        <meshStandardMaterial color="#333" metalness={0.7} />
      </mesh>
      {/* Billboard frame */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.4, 0.9, 0.1]} />
        <meshStandardMaterial color="#0a0a0f" roughness={0.4} />
      </mesh>
      {/* Glowing screen */}
      <mesh position={[0, 0.4, 0.055]}>
        <planeGeometry args={[2.3, 0.8]} />
        <meshBasicMaterial color="#5d2a8f" transparent opacity={0.25} />
      </mesh>
      {/* Real Madrid / Monaco text */}
      <Text
        position={[0, 0.4, 0.065]}
        fontSize={0.22}
        color="#ffffff"
        font="https://fonts.gstatic.com/s/orbitron/v25/y97IthGvxuGog270AFX2M7ub.woff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        {label}
      </Text>
      {/* Gold underline on screen */}
      <mesh position={[0, 0.02, 0.06]}>
        <planeGeometry args={[2.3, 0.03]} />
        <meshBasicMaterial color="#f3c623" />
      </mesh>
    </group>
  );
}

function RaceTrack() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.003;
    }
  });

  return (
    <group ref={ref} position={[0, -2.5, -4]}>
      {/* Mediterranean Marina Water Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]} receiveShadow>
        <planeGeometry args={[55, 55]} />
        <meshStandardMaterial color="#028090" roughness={0.08} metalness={0.88} transparent opacity={0.7} />
      </mesh>

      {/* Floating Yachts in Harbor */}
      <Yacht position={[-19, -0.05, -7]} rotation={[0, Math.PI / 6, 0]} />
      <Yacht position={[18, -0.05, -9]} rotation={[0, -Math.PI / 5, 0]} />
      <Yacht position={[22, -0.05, 6]} rotation={[0, Math.PI / 1.1, 0]} />

      {/* Main Asphalt Track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <ringGeometry args={[9.5, 14, 64]} />
        <meshStandardMaterial color="#111114" roughness={0.88} metalness={0.15} />
      </mesh>

      {/* Center Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[11.72, 11.78, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
      </mesh>

      {/* Inner Kerb */}
      <TrackKerbs radius={9.5} count={50} width={0.3} />

      {/* Outer Kerb */}
      <TrackKerbs radius={14} count={70} width={0.4} />

      {/* Pit Lane Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[10.3, 10.34, 64]} />
        <meshBasicMaterial color="#f3c623" transparent opacity={0.25} />
      </mesh>

      {/* Monaco Tunnel (Structured Ribs + Lights over a track section) */}
      <CircuitTunnel />

      {/* Real Madrid & Monaco GP Banners around Track */}
      <CircuitBillboard position={[0, 1.2, -15.2]} rotation={[0, 0, 0]} label="HALA MADRID" />
      <CircuitBillboard position={[-13.5, 1.2, -5.5]} rotation={[0, Math.PI / 4, 0]} label="MONACO GP" />
      <CircuitBillboard position={[13.5, 1.2, 5.5]} rotation={[0, -Math.PI / 1.5, 0]} label="LOS BLANCOS" />
      <CircuitBillboard position={[-8, 1.2, 12]} rotation={[0, Math.PI / 1.1, 0]} label="BERNABÉU" />
    </group>
  );
}

function F1Car({ car }) {
  const ref = useRef();
  const wheelsRef = useRef([]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime * car.speed + car.offset;
    const x = Math.cos(time) * car.radius;
    const z = Math.sin(time) * car.radius;
    
    // Position car on the track relative to track center [0, -2.5, -4]
    ref.current.position.set(x, -2.38, z - 4);
    
    // Rotate car to face direction of travel
    const angle = -time + Math.PI; 
    ref.current.rotation.y = angle;

    // Spin wheels
    wheelsRef.current.forEach((wheel) => {
      if (wheel) wheel.rotation.z += delta * 15;
    });
  });

  return (
    <group ref={ref} scale={car.scale}>
      {/* Main Chassis Body */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.22, 0.52]} />
        <meshStandardMaterial color={car.color} roughness={0.2} metalness={0.75} emissive={car.color} emissiveIntensity={0.08} />
      </mesh>

      {/* Nose cone pointing forward */}
      <mesh position={[0.9, -0.02, 0]} rotation={[0, 0, -Math.PI / 18]} castShadow>
        <boxGeometry args={[0.6, 0.14, 0.28]} />
        <meshStandardMaterial color={car.accentColor || car.color} roughness={0.2} metalness={0.75} />
      </mesh>

      {/* Cockpit / Airbox intake */}
      <mesh position={[-0.1, 0.22, 0]} castShadow>
        <boxGeometry args={[0.4, 0.25, 0.22]} />
        <meshStandardMaterial color={car.secondaryColor || "#1a1a1a"} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Halo Safety System */}
      <mesh position={[0.2, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 24, Math.PI]} />
        <meshStandardMaterial color={car.secondaryColor || "#111111"} roughness={0.8} />
      </mesh>

      {/* Front Wing */}
      <mesh position={[1.15, -0.06, 0]} castShadow>
        <boxGeometry args={[0.18, 0.04, 0.95]} />
        <meshStandardMaterial color={car.accentColor || "#111111"} roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Front Wing Endplates */}
      <mesh position={[1.15, -0.02, 0.465]}>
        <boxGeometry args={[0.22, 0.12, 0.02]} />
        <meshStandardMaterial color={car.color} roughness={0.3} />
      </mesh>
      <mesh position={[1.15, -0.02, -0.465]}>
        <boxGeometry args={[0.22, 0.12, 0.02]} />
        <meshStandardMaterial color={car.color} roughness={0.3} />
      </mesh>

      {/* Rear Wing */}
      <mesh position={[-0.7, 0.25, 0]} castShadow>
        <boxGeometry args={[0.15, 0.03, 0.72]} />
        <meshStandardMaterial color={car.accentColor || "#111111"} roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Rear Wing Endplates */}
      <mesh position={[-0.7, 0.2, 0.35]}>
        <boxGeometry args={[0.28, 0.24, 0.02]} />
        <meshStandardMaterial color={car.secondaryColor || car.color} roughness={0.3} />
      </mesh>
      <mesh position={[-0.7, 0.2, -0.35]}>
        <boxGeometry args={[0.28, 0.24, 0.02]} />
        <meshStandardMaterial color={car.secondaryColor || car.color} roughness={0.3} />
      </mesh>

      {/* Sidepods */}
      <mesh position={[0.1, 0.02, 0.32]} castShadow>
        <boxGeometry args={[0.8, 0.18, 0.16]} />
        <meshStandardMaterial color={car.secondaryColor || car.color} roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[0.1, 0.02, -0.32]} castShadow>
        <boxGeometry args={[0.8, 0.18, 0.16]} />
        <meshStandardMaterial color={car.secondaryColor || car.color} roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Real Madrid / Monaco micro-text on sidepod */}
      <Text
        position={[0.1, 0.13, 0.41]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.07}
        color={car.color === "#ffffff" ? "#5d2a8f" : "#ffffff"}
        font="https://fonts.gstatic.com/s/orbitron/v25/y97IthGvxuGog270AFX2M7ub.woff"
      >
        {car.decal}
      </Text>

      {/* 4 Wheels */}
      {/* Front Left */}
      <mesh
        ref={(el) => (wheelsRef.current[0] = el)}
        position={[0.62, -0.1, 0.42]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.24, 0.24, 0.24, 24]} />
        <meshStandardMaterial color="#060606" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Front Right */}
      <mesh
        ref={(el) => (wheelsRef.current[1] = el)}
        position={[0.62, -0.1, -0.42]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.24, 0.24, 0.24, 24]} />
        <meshStandardMaterial color="#060606" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Rear Left */}
      <mesh
        ref={(el) => (wheelsRef.current[2] = el)}
        position={[-0.52, -0.06, 0.44]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.28, 0.28, 0.3, 24]} />
        <meshStandardMaterial color="#060606" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Rear Right */}
      <mesh
        ref={(el) => (wheelsRef.current[3] = el)}
        position={[-0.52, -0.06, -0.44]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.28, 0.28, 0.3, 24]} />
        <meshStandardMaterial color="#060606" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
}

function RaceStartGantry() {
  const lightsRef = useRef([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime % 6; // 6 second loop
    lightsRef.current.forEach((light, index) => {
      if (!light) return;
      if (time >= 5) {
        light.material.color.setHex(0x111111);
        light.material.emissive.setHex(0x000000);
      } else if (time >= index) {
        light.material.color.setHex(0xf3c623); // Royal Gold start lights instead of F1 red!
        light.material.emissive.setHex(0xf3c623);
      } else {
        light.material.color.setHex(0x222222);
        light.material.emissive.setHex(0x000000);
      }
    });
  });

  return (
    <group position={[0, 2, -15.5]}>
      {/* Support Pillars */}
      <mesh position={[-5, -2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 5, 12]} />
        <meshStandardMaterial color="#5d2a8f" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[5, -2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 5, 12]} />
        <meshStandardMaterial color="#5d2a8f" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 10.2, 12]} />
        <meshStandardMaterial color="#5d2a8f" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Lights Box */}
      <mesh position={[0, 0.6, 0.1]}>
        <boxGeometry args={[4.2, 0.42, 0.26]} />
        <meshStandardMaterial color="#100b1a" roughness={0.6} />
      </mesh>

      {/* 5 Lights */}
      {Array.from({ length: 5 }).map((_, index) => (
        <group key={index} position={[-1.4 + index * 0.7, 0.6, 0.24]}>
          <mesh ref={(el) => (lightsRef.current[index] = el)}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#222222" roughness={0.2} metalness={0.8} emissive="#000" emissiveIntensity={2.5} />
          </mesh>
          <pointLight color="#f3c623" intensity={0.6} distance={4} />
        </group>
      ))}
    </group>
  );
}

function PitWall() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = -2.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  const screens = useMemo(() => [
    { x: -3.5, color: '#ffffff' },
    { x: -1.75, color: '#5d2a8f' },
    { x: 0, color: '#f3c623' },
    { x: 1.75, color: '#00c0f9' },
    { x: 3.5, color: '#e10600' },
  ], []);

  return (
    <group ref={ref} position={[0, -2.5, -3]}>
      {screens.map((screen, idx) => (
        <group key={idx} position={[screen.x, 0.9, 0]}>
          {/* Support pole */}
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
            <meshStandardMaterial color="#333" metalness={0.7} />
          </mesh>
          {/* Monitor */}
          <mesh position={[0, 0, 0]} rotation={[0.05, 0.1, 0]}>
            <boxGeometry args={[1.2, 0.65, 0.06]} />
            <meshStandardMaterial color="#0f0f12" roughness={0.4} />
          </mesh>
          {/* Glowing screen */}
          <mesh position={[0, 0, 0.035]} rotation={[0.05, 0.1, 0]}>
            <planeGeometry args={[1.12, 0.58]} />
            <meshBasicMaterial color={screen.color} transparent opacity={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CameraDrift() {
  useFrame((state) => {
    const { camera } = state;
    const time = state.clock.elapsedTime;
    // Circular drift with vertical wave
    camera.position.x = Math.sin(time * 0.03) * 6;
    camera.position.y = 5.2 + Math.cos(time * 0.04) * 1.5;
    camera.position.z = 12.5 + Math.cos(time * 0.02) * 4;
    camera.lookAt(0, -1.8, -4);
  });
  return null;
}

export default function Background3D() {
  return (
    <div className="arena-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 5, 15], fov: 52 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
        dpr={[1, 1.5]}
        shadows
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#07070a']} />
          <fog attach="fog" args={['#07070a', 8, 28]} />
          
          <CameraDrift />
          
          {/* Scene Elements */}
          <RaceTrack />
          
          {CARS.map((car) => (
            <F1Car key={car.id} car={car} />
          ))}
          
          <RaceStartGantry />
          <PitWall />
          
          {/* Spark Particles */}
          <Sparkles count={75} scale={[25, 6, 25]} size={1.5} speed={0.25} color="#f3c623" opacity={0.28} />
          <Sparkles count={40} scale={[25, 8, 25]} size={1.2} speed={0.15} color="#5d2a8f" opacity={0.14} />
          
          {/* Dynamic Lights */}
          <ambientLight intensity={0.16} />
          <directionalLight position={[5, 15, 8]} color="#ffffff" intensity={1.1} castShadow />
          
          {/* Pit Glow & Contrast Lights */}
          <pointLight position={[-12, -1, -4]} color="#5d2a8f" intensity={1.8} distance={15} />
          <pointLight position={[12, -1, -4]} color="#00c0f9" intensity={1.8} distance={15} />
          <pointLight position={[0, -2, 8]} color="#f3c623" intensity={0.9} distance={12} />
        </Suspense>
      </Canvas>
      <div className="arena-vignette" />
    </div>
  );
}
