import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export function ParticlesBackground() {
    const particlesInit = async (engine: any) => {
        await loadFull(engine);
    };

    return (
        <Particles
            init={particlesInit}
            options={{
                background: { color: '#0f172a' },
                particles: {
                    number: { value: 50 },
                    color: { value: '#00ff88' },
                    opacity: { value: 0.5 },
                    size: { value: 1 },
                    move: {
                        enable: true,
                        speed: 1,
                        direction: 'none',
                        random: false,
                        straight: false,
                        out_mode: 'out',
                        bounce: false,
                    },
                    links: {
                        enable: true,
                        color: '#00ffee',
                        opacity: 0.2,
                        distance: 150,
                    },
                },
                interactivity: {
                    events: {
                        onhover: { enable: true, mode: 'repulse' },
                    },
                },
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
            }}
        />
    );
}
