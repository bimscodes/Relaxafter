import { useState, useEffect, useRef } from 'react';

const PATTERNS = [
  { name: 'Calm', inhale: 4, hold: 4, exhale: 4, label: '4-4-4' },
  { name: 'Relax', inhale: 4, hold: 7, exhale: 8, label: '4-7-8' },
  { name: 'Box', inhale: 4, hold: 4, exhale: 4, label: 'Box' },
  { name: 'Deep', inhale: 5, hold: 2, exhale: 7, label: '5-2-7' },
];

export default function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [phase, setPhase] = useState('idle');
  const [counter, setCounter] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      setCounter(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let currentPhase = 'inhale';
    let currentCount = pattern.inhale;
    setPhase('inhale');
    setCounter(pattern.inhale);

    intervalRef.current = setInterval(() => {
      currentCount -= 1;

      if (currentCount <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
          currentCount = pattern.hold;
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
          currentCount = pattern.exhale;
        } else {
          currentPhase = 'inhale';
          currentCount = pattern.inhale;
          setCycles(prev => prev + 1);
        }
        setPhase(currentPhase);
      }

      setCounter(currentCount);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [active, pattern]);

  const getCircleScale = () => {
    if (phase === 'inhale') return 'scale-150';
    if (phase === 'hold') return 'scale-150';
    if (phase === 'exhale') return 'scale-100';
    return 'scale-100';
  };

  const getPhaseLabel = () => {
    if (phase === 'inhale') return 'Breathe In';
    if (phase === 'hold') return 'Hold';
    if (phase === 'exhale') return 'Breathe Out';
    return 'Ready';
  };

  return (
    <div className="space-y-6">
      {/* Pattern selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PATTERNS.map(p => (
          <button
            key={p.name}
            onClick={() => {
              setPattern(p);
              if (active) {
                setActive(false);
                setTimeout(() => setActive(true), 100);
              }
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              pattern.name === p.name
                ? 'bg-accent text-white'
                : 'bg-surface text-muted hover:text-white'
            }`}
          >
            {p.name} ({p.label})
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer glow */}
          <div
            className={`absolute inset-0 rounded-full bg-accent/20 blur-xl transition-transform duration-1000 ease-in-out ${getCircleScale()}`}
          />

          {/* Main circle */}
          <div
            className={`relative w-full h-full rounded-full bg-gradient-to-br from-accent/40 to-accent/10 border-2 border-accent/30 flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out ${getCircleScale()}`}
          >
            <span className="text-3xl font-bold text-white">
              {active ? counter : '--'}
            </span>
            <span className="text-sm text-accent-light mt-1">
              {getPhaseLabel()}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => {
              setActive(!active);
              if (!active) setCycles(0);
            }}
            className="btn-primary px-10"
          >
            {active ? 'Stop' : 'Start'}
          </button>

          {cycles > 0 && (
            <p className="text-sm text-muted animate-fade-in">
              {cycles} cycle{cycles !== 1 ? 's' : ''} completed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
