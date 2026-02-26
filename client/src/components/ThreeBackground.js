import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { SoftShadows } from '@react-three/drei';
import * as THREE from 'three';

function SoftGeometricMesh() {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
            meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -5]} scale={[3, 3, 3]}>
            <icosahedronGeometry args={[2, 1]} />
            <meshStandardMaterial
                color="#1E5EFF"
                wireframe={true}
                transparent={true}
                opacity={0.08}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

function FloatingShapes() {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * -0.02;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Subtle floating background elements */}
            <mesh position={[6, 2, -10]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#3A7BFF" transparent opacity={0.15} roughness={0.1} />
            </mesh>

            <mesh position={[-5, -3, -8]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color="#1E5EFF" transparent opacity={0.1} roughness={0.2} />
            </mesh>
        </group>
    );
}

export default function ThreeBackground() {
    return (
        <div className="three-canvas-container">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <color attach="background" args={['#FFFFFF']} />
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#EAF2FF" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#1E5EFF" />
                <SoftGeometricMesh />
                <FloatingShapes />
            </Canvas>
        </div>
    );
}
