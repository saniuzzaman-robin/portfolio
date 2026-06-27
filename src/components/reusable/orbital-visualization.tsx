'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/components/reusable/theme-provider';

if (typeof window !== 'undefined') {
  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
    _warn(...args);
  };
}

const worldTime = { t: 0 };

interface PlanetData {
  name: string;
  radius: number;
  orbitRadius: number;
  speed: number;
  color: string;
  emissive: string;
  tiltX: number;
  tiltZ: number;
  startAngle: number;
  hasRings?: boolean;
  ringInner?: number;
  ringOuter?: number;
}

const PLANETS: PlanetData[] = [
  {
    name: 'React',
    radius: 0.28,
    orbitRadius: 3.0,
    speed: 1.5,
    color: '#61dafb',
    emissive: '#2196f3',
    tiltX: 0.3,
    tiltZ: 0.2,
    startAngle: 0,
  },
  {
    name: 'Next.js',
    radius: 0.35,
    orbitRadius: 4.6,
    speed: 1.1,
    color: '#10b981',
    emissive: '#059669',
    tiltX: -0.5,
    tiltZ: -0.25,
    startAngle: 1.2,
  },
  {
    name: 'Node.js',
    radius: 0.32,
    orbitRadius: 6.2,
    speed: 0.8,
    color: '#8b5cf6',
    emissive: '#6d28d9',
    tiltX: 0.4,
    tiltZ: 0.45,
    startAngle: 2.4,
  },
  {
    name: 'TypeScript',
    radius: 0.3,
    orbitRadius: 7.8,
    speed: 0.6,
    color: '#ec4899',
    emissive: '#be185d',
    tiltX: -0.6,
    tiltZ: 0.3,
    startAngle: 3.6,
  },
  {
    name: 'PostgreSQL',
    radius: 0.42,
    orbitRadius: 9.8,
    speed: 0.35,
    color: '#0ea5e9',
    emissive: '#0284c7',
    tiltX: 0.45,
    tiltZ: -0.55,
    startAngle: 0.8,
    hasRings: true,
    ringInner: 0.6,
    ringOuter: 1.1,
  },
];

function Core() {
  const coreRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = worldTime.t;
    if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(t * 2.0) * 0.025);
    if (midRef.current) midRef.current.scale.setScalar(1 + Math.sin(t * 1.4 + 1) * 0.05);
    if (outerRef.current) outerRef.current.scale.setScalar(1 + Math.sin(t * 0.9 + 2) * 0.08);
  });

  return (
    <>
      <mesh ref={outerRef} scale={2.4}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#6d28d9"
          emissiveIntensity={0.4}
          transparent
          opacity={0.04}
        />
      </mesh>
      <mesh ref={midRef} scale={1.55}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#059669"
          emissiveIntensity={0.6}
          transparent
          opacity={0.08}
        />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={1.4} />
      </mesh>
    </>
  );
}

function OrbitRing({ radius, color, opacity }: { radius: number; color: string; opacity: number }) {
  const primitive = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color, opacity, transparent: true });
    return new THREE.Line(geo, mat);
  }, [radius, color, opacity]);

  return <primitive object={primitive} />;
}

function PlanetGlow({ color, radius }: { color: string; radius: number }) {
  return (
    <mesh>
      <sphereGeometry args={[radius * 2.6, 16, 16]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function TechRings({ inner, outer }: { inner: number; outer: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 80]} />
      <meshStandardMaterial
        color="#8b5cf6"
        emissive="#6d28d9"
        emissiveIntensity={0.35}
        side={THREE.DoubleSide}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function PlanetSystem({ planet, isLight }: { planet: PlanetData; isLight: boolean }) {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!planetRef.current) return;
    const t = worldTime.t * planet.speed * 0.25 + planet.startAngle;
    planetRef.current.position.x = Math.cos(t) * planet.orbitRadius;
    planetRef.current.position.z = Math.sin(t) * planet.orbitRadius;
    planetRef.current.rotation.y += 0.006;
  });

  const ringColor = isLight ? planet.emissive : planet.color;
  const ringOpacity = isLight ? 0.5 : 0.18;
  const emissiveIntensity = isLight ? 1.0 : 0.45;

  return (
    <group rotation={[planet.tiltX, 0, planet.tiltZ]}>
      <OrbitRing radius={planet.orbitRadius} color={ringColor} opacity={ringOpacity} />
      <mesh ref={planetRef}>
        <sphereGeometry args={[planet.radius, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.75}
          metalness={0.1}
        />
        {!isLight && <PlanetGlow color={planet.emissive} radius={planet.radius} />}
        {planet.hasRings && <TechRings inner={planet.ringInner!} outer={planet.ringOuter!} />}
      </mesh>
    </group>
  );
}

function SolarSystem({ isLight }: { isLight: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = worldTime.t * 0.045;
    }
  });

  return (
    <group ref={groupRef}>
      <Core />
      {PLANETS.map((planet) => (
        <PlanetSystem key={planet.name} planet={planet} isLight={isLight} />
      ))}
    </group>
  );
}

function Ticker() {
  useFrame((_, delta) => {
    worldTime.t += delta;
  });
  return null;
}

function Scene({ isLight }: { isLight: boolean }) {
  return (
    <>
      <Ticker />
      <ambientLight intensity={isLight ? 1.4 : 0.3} />
      <pointLight
        position={[0, 0, 0]}
        intensity={isLight ? 5 : 3}
        color="#34d399"
        distance={50}
        decay={1.2}
      />
      <pointLight position={[30, 15, 25]} intensity={0.1} color="#8b5cf6" distance={100} />
      <SolarSystem isLight={isLight} />
    </>
  );
}

export function OrbitalVisualization() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="h-full w-full">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 10, 28], fov: 45, near: 0.1, far: 300 }}
      >
        <Scene isLight={isLight} />
      </Canvas>
    </div>
  );
}
