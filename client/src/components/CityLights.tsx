import { useEffect, useState } from 'react';

interface Light {
  id: number;
  x: number;
  y: number;
  color: 'pink' | 'cyan' | 'purple' | 'gold' | 'green';
  duration: number;
  delay: number;
  size: 'small' | 'medium';
}

export function CityLights() {
  const [lights, setLights] = useState<Light[]>([]);

  useEffect(() => {
    // Generate random lights for the city skyline
    const colors: Light['color'][] = ['pink', 'cyan', 'purple', 'gold', 'green'];
    const generatedLights: Light[] = [];

    // Create lights scattered across the skyline area (bottom 60% of hero)
    for (let i = 0; i < 50; i++) {
      generatedLights.push({
        id: i,
        x: Math.random() * 100, // percentage across width
        y: 40 + Math.random() * 50, // percentage from top (40-90% to stay in skyline area)
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 1.5 + Math.random() * 3, // 1.5-4.5s
        delay: Math.random() * 5, // 0-5s delay
        size: Math.random() > 0.7 ? 'medium' : 'small',
      });
    }

    setLights(generatedLights);
  }, []);

  return (
    <div className="city-lights">
      {lights.map((light) => (
        <div
          key={light.id}
          className={`city-light ${light.color}`}
          style={{
            left: `${light.x}%`,
            top: `${light.y}%`,
            width: light.size === 'medium' ? '4px' : '2px',
            height: light.size === 'medium' ? '4px' : '2px',
            ['--twinkle-duration' as string]: `${light.duration}s`,
            ['--twinkle-delay' as string]: `${light.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function WindowLights() {
  const [windows, setWindows] = useState<Array<{
    id: number;
    x: number;
    y: number;
    type: 'warm' | 'cool';
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const generatedWindows = [];
    
    // Create window lights in building areas
    for (let i = 0; i < 30; i++) {
      generatedWindows.push({
        id: i,
        x: Math.random() * 100,
        y: 50 + Math.random() * 40, // Lower portion of screen
        type: Math.random() > 0.5 ? 'warm' : 'cool' as 'warm' | 'cool',
        duration: 2 + Math.random() * 4,
        delay: Math.random() * 8,
      });
    }

    setWindows(generatedWindows);
  }, []);

  return (
    <div className="city-lights">
      {windows.map((window) => (
        <div
          key={window.id}
          className={`window-light ${window.type}`}
          style={{
            left: `${window.x}%`,
            top: `${window.y}%`,
            ['--flicker-duration' as string]: `${window.duration}s`,
            ['--flicker-delay' as string]: `${window.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
