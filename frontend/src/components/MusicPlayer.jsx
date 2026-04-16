import { useState, useRef, useEffect } from 'react';

const DEMO_TRACKS = [
  { id: 1, title: 'Ocean Waves', artist: 'Nature Sounds', category: 'Nature', durationSeconds: 300 },
  { id: 2, title: 'Rainfall', artist: 'Nature Sounds', category: 'Nature', durationSeconds: 420 },
  { id: 3, title: 'Forest Birds', artist: 'Nature Sounds', category: 'Nature', durationSeconds: 360 },
  { id: 4, title: 'Peaceful Piano', artist: 'Calm Collective', category: 'Instrumental', durationSeconds: 240 },
  { id: 5, title: 'Ambient Dreams', artist: 'Calm Collective', category: 'Ambient', durationSeconds: 480 },
  { id: 6, title: 'Tibetan Bowls', artist: 'Meditation Masters', category: 'Meditation', durationSeconds: 600 },
  { id: 7, title: 'Night Cricket', artist: 'Nature Sounds', category: 'Nature', durationSeconds: 540 },
  { id: 8, title: 'Gentle Stream', artist: 'Nature Sounds', category: 'Nature', durationSeconds: 360 },
];

const CATEGORIES = ['All', 'Nature', 'Instrumental', 'Ambient', 'Meditation'];

const TIMER_OPTIONS = [
  { label: 'Off', minutes: 0 },
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '60m', minutes: 60 },
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const [tracks] = useState(DEMO_TRACKS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const timerRef = useRef(null);

  const filtered = activeCategory === 'All'
    ? tracks
    : tracks.filter(t => t.category === activeCategory);

  useEffect(() => {
    if (timerRemaining <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (timer > 0 && isPlaying) {
        setIsPlaying(false);
        setCurrentTrack(null);
        setTimer(0);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimerRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timerRemaining, timer, isPlaying]);

  const handlePlay = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleTimer = (minutes) => {
    setTimer(minutes);
    setTimerRemaining(minutes * 60);
  };

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              activeCategory === cat
                ? 'bg-accent text-white'
                : 'bg-surface text-muted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Track list */}
      <div className="space-y-3">
        {filtered.map(track => (
          <button
            key={track.id}
            onClick={() => handlePlay(track)}
            className={`w-full card flex items-center gap-4 text-left transition-all duration-300 hover:border-accent/30 ${
              currentTrack?.id === track.id ? 'border-accent/50 bg-accent/10' : ''
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              currentTrack?.id === track.id && isPlaying
                ? 'bg-accent animate-pulse-slow'
                : 'bg-accent/20'
            }`}>
              {currentTrack?.id === track.id && isPlaying ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.title}</p>
              <p className="text-sm text-muted truncate">{track.artist}</p>
            </div>
            <span className="text-sm text-muted flex-shrink-0">
              {formatTime(track.durationSeconds)}
            </span>
          </button>
        ))}
      </div>

      {/* Now playing bar */}
      {currentTrack && (
        <div className="card bg-accent/10 border-accent/20 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">{currentTrack.title}</p>
              <p className="text-sm text-muted">{currentTrack.artist}</p>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent-light transition-colors"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Sleep timer */}
          <div>
            <p className="text-xs text-muted mb-2 uppercase tracking-wider">Sleep Timer</p>
            <div className="flex gap-2">
              {TIMER_OPTIONS.map(opt => (
                <button
                  key={opt.minutes}
                  onClick={() => handleTimer(opt.minutes)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    timer === opt.minutes
                      ? 'bg-accent text-white'
                      : 'bg-midnight text-muted hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {timerRemaining > 0 && (
              <p className="text-sm text-accent mt-2">
                Stopping in {formatTime(timerRemaining)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
