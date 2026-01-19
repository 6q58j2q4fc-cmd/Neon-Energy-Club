import { useMemo } from 'react';

interface Light {
  id: number;
  x: number;
  y: number;
  color: 'pink' | 'cyan' | 'purple' | 'gold' | 'green';
  duration: number;
  delay: number;
  size: 'small' | 'medium';
}

// Reduced from 50 to 15 lights for performance
const CITY_LIGHTS_COUNT = 15;
const WINDOW_LIGHTS_COUNT = 10;

export function CityLights() {
  // Use useMemo to prevent regeneration on every render
  const lights = useMemo<Light[]>(() => {
    const colors: Light['color'][] = ['pink', 'cyan', 'purple', 'gold', 'green'];
    const generatedLights: Light[] = [];

    for (let i = 0; i < CITY_LIGHTS_COUNT; i++) {
      generatedLights.push({
        id: i,
        x: Math.random() * 100,
        y: 40 + Math.random() * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 2 + Math.random() * 3, // Slower animation
        delay: Math.random() * 5,
        size: Math.random() > 0.7 ? 'medium' : 'small',
      });
    }

    return generatedLights;
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
  // Use useMemo to prevent regeneration on every render
  const windows = useMemo(() => {
    const generatedWindows = [];
    
    for (let i = 0; i < WINDOW_LIGHTS_COUNT; i++) {
      generatedWindows.push({
        id: i,
        x: Math.random() * 100,
        y: 50 + Math.random() * 40,
        type: Math.random() > 0.5 ? 'warm' : 'cool' as 'warm' | 'cool',
        duration: 3 + Math.random() * 4, // Slower animation
        delay: Math.random() * 8,
      });
    }

    return generatedWindows;
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
