import { useState, useEffect } from 'react';
import { moodApi } from '../services/api';

const MOODS = [
  { key: 'happy', emoji: '😊', label: 'Happy', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' },
  { key: 'calm', emoji: '😌', label: 'Calm', color: 'from-green-500/20 to-teal-500/20 border-green-500/30' },
  { key: 'sad', emoji: '😔', label: 'Sad', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
  { key: 'stressed', emoji: '😖', label: 'Stressed', color: 'from-red-500/20 to-pink-500/20 border-red-500/30' },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await moodApi.getHistory();
      setHistory(data);
    } catch {
      // Use local history if API unavailable
    }
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    setSaving(true);

    const entry = {
      id: Date.now(),
      mood: selectedMood,
      note: note || null,
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await moodApi.save(selectedMood, note || null);
      setHistory(prev => [result, ...prev]);
    } catch {
      // Save locally if API unavailable
      setHistory(prev => [entry, ...prev]);
    }

    setSaving(false);
    setSaved(true);
    setSelectedMood(null);
    setNote('');
    setTimeout(() => setSaved(false), 2000);
  };

  const getMoodInfo = (key) => MOODS.find(m => m.key === key);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mood Tracker</h1>
        <p className="text-muted">How are you feeling right now?</p>
      </div>

      {/* Mood selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {MOODS.map(mood => (
          <button
            key={mood.key}
            onClick={() => setSelectedMood(mood.key)}
            className={`card bg-gradient-to-br ${mood.color} flex flex-col items-center gap-3 py-8 transition-all duration-300 hover:scale-105 ${
              selectedMood === mood.key
                ? 'ring-2 ring-accent scale-105'
                : 'border-transparent'
            }`}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="font-medium">{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Note input */}
      {selectedMood && (
        <div className="space-y-4 mb-6 animate-fade-in">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note about how you're feeling... (optional)"
            rows={3}
            className="input-field resize-none"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save Mood'}
          </button>
        </div>
      )}

      {/* Success message */}
      {saved && (
        <div className="card bg-green-500/10 border-green-500/20 text-center mb-6 animate-fade-in">
          <p className="text-green-400 font-medium">Mood saved successfully!</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent History</h2>
          <div className="space-y-3">
            {history.slice(0, 10).map(entry => {
              const info = getMoodInfo(entry.mood);
              return (
                <div key={entry.id} className="card flex items-center gap-4">
                  <span className="text-2xl">{info?.emoji || '?'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{info?.label || entry.mood}</p>
                    {entry.note && (
                      <p className="text-sm text-muted truncate">{entry.note}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted flex-shrink-0">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
