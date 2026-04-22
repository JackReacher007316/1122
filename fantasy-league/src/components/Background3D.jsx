import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Grid, Sphere, Box } from '@react-three/drei';

const f1Positions = Array.from({ length: 20 }).map(() => [(Math.random() - 0.5) * 20, Math.random() * 5, (Math.random() - 0.5) * 40]);
const footballPositions = Array.from({ length: 15 }).map(() => [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20]);
const hackathonPositions = Array.from({ length: 30 }).map(() => [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20]);
const cricketPositions = Array.from({ length: 15 }).map(() => [(Math.random() - 0.5) * 30, Math.random() * 10, (Math.random() - 0.5) * 20]);

const AbstractElements = ({ sport }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      if (sport === 'f1') {
        groupRef.current.position.z = (state.clock.elapsedTime * 15) % 10;
      } else {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      }
    }
  });

  if (sport === 'f1') {
    return (
      <group ref={groupRef}>
        <Grid 
          position={[0, -2, -10]} 
          args={[50, 50]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor="#ff2800" 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="#ff8c00" 
          fadeDistance={30}
        />
        {f1Positions.map((pos, i) => (
          <Float key={i} speed={5} rotationIntensity={2} floatIntensity={2} position={pos}>
             <Box args={[0.2, 0.2, 2]}>
               <meshStandardMaterial color="#ff2800" emissive="#ff2800" emissiveIntensity={2} toneMapped={false} />
             </Box>
          </Float>
        ))}
      </group>
    );
  }

  if (sport === 'football') {
    return (
      <group ref={groupRef}>
        <Grid 
          position={[0, -5, -10]} 
          args={[50, 50]} 
          cellColor="#00ff87" 
          sectionColor="#00b8ff" 
          fadeDistance={30}
        />
        {footballPositions.map((pos, i) => (
          <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1} position={pos}>
             <Sphere args={[0.5, 16, 16]}>
               <meshStandardMaterial color="#00ff87" wireframe />
             </Sphere>
          </Float>
        ))}
      </group>
    );
  }

  if (sport === 'hackathon') {
    return (
      <group ref={groupRef}>
        <Grid 
          position={[0, -5, -10]} 
          args={[50, 50]} 
          cellColor="#00e5ff" 
          sectionColor="#0055ff" 
          fadeDistance={30}
        />
        {hackathonPositions.map((pos, i) => (
          <Float key={i} speed={1} rotationIntensity={2} floatIntensity={1} position={pos}>
             <Box args={[0.5, 0.5, 0.5]}>
               <meshStandardMaterial color="#00e5ff" wireframe opacity={0.5} transparent />
             </Box>
          </Float>
        ))}
      </group>
    );
  }

  if (sport === 'cricket') {
    return (
      <group ref={groupRef}>
        <Grid 
          position={[0, -5, -10]} 
          args={[50, 50]} 
          cellColor="#ffffff" 
          sectionColor="#00e5ff" 
          fadeDistance={30}
        />
        {cricketPositions.map((pos, i) => (
          <Float key={i} speed={2} rotationIntensity={3} floatIntensity={2} position={pos}>
             <Sphere args={[0.3, 16, 16]}>
               <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
             </Sphere>
          </Float>
        ))}
      </group>
    );
  }

  // default 'all'
  return (
    <group ref={groupRef}>
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
};

const Background3D = ({ activeSport }) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, background: 'var(--bg-dark)' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AbstractElements sport={activeSport} />
        <fog attach="fog" args={['#0a0b10', 10, 40]} />
      </Canvas>
    </div>
  );
};

export default Background3D;
