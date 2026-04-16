import { useState, useEffect, useRef } from 'react';

const SOUNDS = [
  { id: 'rain', label: 'Rain', icon: '🌧️' },
  { id: 'ocean', label: 'Ocean', icon: '🌊' },
  { id: 'wind', label: 'Wind', icon: '🍃' },
  { id: 'fire', label: 'Fireplace', icon: '🔥' },
  { id: 'night', label: 'Night', icon: '🌜' },
  { id: 'white', label: 'White Noise', icon: '☁️' },
];

export default function SleepMode() {
  const [isActive, setIsActive] = useState(false);
  const [selectedSound, setSelectedSound] = useState(null);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [remaining, setRemaining] = useState(0);
  const [dimLevel, setDimLevel] = useState(90);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive || remaining <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (isActive && remaining <= 0 && remaining !== null) {
        setIsActive(false);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive, remaining]);

  const startSleep = () => {
    setIsActive(true);
    setRemaining(timerMinutes * 60);
  };

  const stopSleep = () => {
    setIsActive(false);
    setRemaining(0);
  };

  const formatCountdown = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Full screen sleep mode
  if (isActive) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000"
        style={{ opacity: dimLevel / 100 }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent/30 rounded-full animate-pulse"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`,
              }}
            />
          ))}
        </div>

        {/* Timer display */}
        <div className="text-center z-10">
          <p className="text-6xl font-light text-white/80 mb-4 tracking-wider">
            {formatCountdown(remaining)}
          </p>
          {selectedSound && (
            <p className="text-lg text-white/40 mb-2">
              {SOUNDS.find(s => s.id === selectedSound)?.icon}{' '}
              {SOUNDS.find(s => s.id === selectedSound)?.label}
            </p>
          )}
          <p className="text-sm text-white/20 mb-12">Sleep mode active</p>
        </div>

        {/* Exit button */}
        <button
          onClick={stopSleep}
          className="z-10 px-8 py-3 rounded-full bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60 transition-all duration-300"
        >
          Wake Up
        </button>

        {/* Dim slider */}
        <div className="absolute bottom-8 z-10 flex items-center gap-3">
          <span className="text-xs text-white/20">Brightness</span>
          <input
            type="range"
            min="10"
            max="100"
            value={dimLevel}
            onChange={e => setDimLevel(Number(e.target.value))}
            className="w-24 accent-accent/50"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sleep Mode</h1>
        <p className="text-muted">Dim the screen and drift off peacefully.</p>
      </div>

      {/* Sound selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Background Sound</h2>
        <div className="grid grid-cols-3 gap-3">
          {SOUNDS.map(sound => (
            <button
              key={sound.id}
              onClick={() =>
                setSelectedSound(selectedSound === sound.id ? null : sound.id)
              }
              className={`card flex flex-col items-center gap-2 py-5 transition-all duration-300 hover:scale-105 ${
                selectedSound === sound.id
                  ? 'border-accent/50 bg-accent/10'
                  : ''
              }`}
            >
              <span className="text-2xl">{sound.icon}</span>
              <span className="text-xs font-medium text-muted">{sound.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timer setting */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Sleep Timer</h2>
        <div className="flex gap-3">
          {[15, 30, 45, 60, 90].map(min => (
            <button
              key={min}
              onClick={() => setTimerMinutes(min)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                timerMinutes === min
                  ? 'bg-accent text-white'
                  : 'bg-surface text-muted hover:text-white'
              }`}
            >
              {min}m
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-center mb-8">
        <div className="text-4xl mb-3">🌝</div>
        <p className="text-muted text-sm">
          {selectedSound
            ? `${SOUNDS.find(s => s.id === selectedSound)?.label} for ${timerMinutes} minutes`
            : `${timerMinutes} minute timer`}
        </p>
      </div>

      {/* Start button */}
      <button onClick={startSleep} className="btn-primary w-full text-lg py-4">
        Enter Sleep Mode
      </button>
    </div>
  );
}
