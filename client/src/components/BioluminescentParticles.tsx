import { useEffect, useState } from 'react';

interface Spore {
  id: number;
  left: string;
  delay: number;
  duration: number;
  color: 'green' | 'cyan' | 'pink' | 'purple';
  size: number;
}

interface Woodsprite {
  id: number;
  left: string;
  top: string;
  delay: number;
}

export function BioluminescentParticles() {
  const [spores, setSpores] = useState<Spore[]>([]);
  const [woodsprites, setWoodsprites] = useState<Woodsprite[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Generate random spores
    const generatedSpores: Spore[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * -20,
      duration: 15 + Math.random() * 10,
      color: ['green', 'cyan', 'pink', 'purple'][Math.floor(Math.random() * 4)] as Spore['color'],
      size: 4 + Math.random() * 4,
    }));
    setSpores(generatedSpores);

    // Generate woodsprites
    const generatedWoodsprites: Woodsprite[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top: `${20 + Math.random() * 60}%`,
      delay: Math.random() * -12,
    }));
    setWoodsprites(generatedWoodsprites);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Bioluminescent Spores */}
      <div className="bio-spores">
        {spores.map((spore) => (
          <div
            key={spore.id}
            className={`bio-spore ${spore.color === 'cyan' ? 'cyan' : spore.color === 'pink' ? 'pink' : spore.color === 'purple' ? 'purple' : ''}`}
            style={{
              left: spore.left,
              width: `${spore.size}px`,
              height: `${spore.size}px`,
              animationDelay: `${spore.delay}s`,
              animationDuration: `${spore.duration}s, 3s`,
            }}
          />
        ))}
      </div>

      {/* Woodsprites (floating jellyfish-like creatures) */}
      {woodsprites.map((sprite) => (
        <div
          key={sprite.id}
          className="woodsprite"
          style={{
            left: sprite.left,
            top: sprite.top,
            animationDelay: `${sprite.delay}s`,
          }}
        />
      ))}

      {/* Tree of Souls background effect */}
      <div className="tree-of-souls-bg" />

      {/* Luminescent moss at bottom */}
      <div className="luminescent-moss" />
    </>
  );
}

export function FloatingPollen() {
  const [particles, setParticles] = useState<{ id: number; left: string; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * -25,
      duration: 20 + Math.random() * 15,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="floating-pollen">
      {particles.map((p) => (
        <div
          key={p.id}
          className="pollen-particle"
          style={{
            left: p.left,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function GlowingVines() {
  return (
    <>
      <div 
        className="glowing-vine" 
        style={{ left: '5%', height: '200px', top: '10%' }}
      />
      <div 
        className="glowing-vine" 
        style={{ right: '8%', height: '250px', top: '20%' }}
      />
      <div 
        className="glowing-vine" 
        style={{ left: '15%', height: '180px', bottom: '30%' }}
      />
      <div 
        className="glowing-vine" 
        style={{ right: '12%', height: '220px', bottom: '25%' }}
      />
    </>
  );
}

export function PandoraStars() {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; delay: number; large: boolean }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 40}%`,
      delay: Math.random() * -3,
      large: Math.random() > 0.85,
    }));
    setStars(generated);
  }, []);

  return (
    <div className="pandora-stars">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`pandora-star ${star.large ? 'large' : ''}`}
          style={{
            left: star.left,
            top: star.top,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function IkranFlight() {
  const [ikrans, setIkrans] = useState<{ id: number; top: string; delay: number; scale: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      top: `${10 + Math.random() * 30}%`,
      delay: i * -10,
      scale: 0.5 + Math.random() * 0.5,
    }));
    setIkrans(generated);
  }, []);

  return (
    <>
      {ikrans.map((ikran) => (
        <div
          key={ikran.id}
          className="ikran-silhouette"
          style={{
            top: ikran.top,
            animationDelay: `${ikran.delay}s`,
            transform: `scale(${ikran.scale})`,
          }}
        />
      ))}
    </>
  );
}

export function SeedPods() {
  const [pods, setPods] = useState<{ id: number; left: string; top: string; delay: number }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      top: `${10 + Math.random() * 70}%`,
      delay: Math.random() * -15,
    }));
    setPods(generated);
  }, []);

  return (
    <>
      {pods.map((pod) => (
        <div
          key={pod.id}
          className="seed-pod"
          style={{
            left: pod.left,
            top: pod.top,
            animationDelay: `${pod.delay}s`,
          }}
        />
      ))}
    </>
  );
}

// Combined component for full Avatar-style jungle atmosphere
export function AvatarJungleAtmosphere({ intensity = 'medium' }: { intensity?: 'low' | 'medium' | 'high' }) {
  const showWoodsprites = intensity === 'medium' || intensity === 'high';
  const showIkrans = intensity === 'high';
  const showSeedPods = intensity === 'medium' || intensity === 'high';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <PandoraStars />
      <FloatingPollen />
      {showWoodsprites && <BioluminescentParticles />}
      {showSeedPods && <SeedPods />}
      {showIkrans && <IkranFlight />}
    </div>
  );
}

export default BioluminescentParticles;
