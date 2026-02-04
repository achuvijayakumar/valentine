"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function ParticleSwarm({ count = 12000 }) {
    const mesh = useRef<THREE.Points>(null);
    const { viewport, mouse } = useThree();

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const baseColor = new THREE.Color("#0ea5e9");
        const accentColor = new THREE.Color("#8b5cf6");

        for (let i = 0; i < count; i++) {
            // Initial spread cloud
            const x = (Math.random() - 0.5) * 50;
            const y = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 20;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Random initial velocity
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

            // Colors
            const mixedColor = baseColor.clone().lerp(accentColor, Math.random());
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        return { positions, velocities, colors };
    }, [count]);

    useFrame((state) => {
        if (!mesh.current) return;

        const positions = mesh.current.geometry.attributes.position.array as Float32Array;
        const velocities = particles.velocities;

        // Mouse mapping
        const targetX = (mouse.x * viewport.width) / 2;
        const targetY = (mouse.y * viewport.height) / 2;
        const targetZ = 0;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const px = positions[i3];
            const py = positions[i3 + 1];
            const pz = positions[i3 + 2];

            // 1. Rhythmic Collapse/Expand Loop (Breathing Universe)
            const time = state.clock.elapsedTime;
            // Cycle between collapsing (+1) and exploding (-1) roughly every 4 seconds
            const cycle = Math.sin(time * 1.5);

            // Base stiffness of the spring (gravity/explosion force)
            // When cycle > 0: Pull to center. When cycle < 0: Push outward.
            const forceDirection = cycle * 0.0006;

            velocities[i3] -= px * forceDirection;
            velocities[i3 + 1] -= py * forceDirection;
            velocities[i3 + 2] -= pz * forceDirection;

            // 2. Wave Motion (Ambient Fluidity - reduced slightly to not mess with the pulse)
            const waveX = Math.sin(py * 0.5 + time * 0.5) * 0.002;
            const waveY = Math.cos(px * 0.5 + time * 0.5) * 0.002;
            velocities[i3] += waveX;
            velocities[i3 + 1] += waveY;

            // 3. Mouse Repulsion (Negative Magnet)
            const dx = targetX - px;
            const dy = targetY - py;
            const dz = targetZ - pz;
            const distSq = dx * dx + dy * dy + dz * dz;
            const dist = Math.sqrt(distSq);

            // Interaction Radius
            if (dist < 8) {
                const force = (8 - dist) * 0.05;
                // Repel away from mouse
                velocities[i3] -= (dx / dist) * force;
                velocities[i3 + 1] -= (dy / dist) * force;
                velocities[i3 + 2] -= (dz / dist) * force;
            }

            // 4. Damping / Friction
            velocities[i3] *= 0.96;
            velocities[i3 + 1] *= 0.96;
            velocities[i3 + 2] *= 0.96;

            // Update Position
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];
        }

        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particles.colors.length / 3}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default function ThreeCanvas() {
    return (
        <div className="fixed inset-0 z-[-1] bg-slate-900 pointer-events-none">
            <Canvas dpr={[1, 1.5]} gl={{ preserveDrawingBuffer: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={60} />
                <ambientLight intensity={0.5} />
                <ParticleSwarm count={12000} />
            </Canvas>
            {/* Overlay gradient for text readability and cinematic look */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent"></div>
        </div>
    );
}
