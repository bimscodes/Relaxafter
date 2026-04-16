import { useState } from 'react';
import MusicPlayer from '../components/MusicPlayer';
import BreathingExercise from '../components/BreathingExercise';

const TABS = ['Music', 'Breathing'];

export default function Home() {
  const [activeTab, setActiveTab] = useState('Music');

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to <span className="text-accent">Unwind</span>
        </h1>
        <p className="text-muted">Take a moment to relax and recharge.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-surface rounded-xl p-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-accent text-white shadow-lg shadow-accent/25'
                : 'text-muted hover:text-white'
            }`}
          >
            {tab === 'Music' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Music
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Breathing
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Music' ? <MusicPlayer /> : <BreathingExercise />}
    </div>
  );
}
