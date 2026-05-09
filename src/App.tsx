/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo, FormEvent } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Check, 
  Trash2, 
  CloudRain, 
  TreePine, 
  Coffee, 
  Volume2, 
  VolumeX,
  Focus,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface AudioTrack {
  id: string;
  name: string;
  icon: any;
  url: string;
}

const POMODORO_TIME = 25 * 60; // 25 minutes

const AUDIO_TRACKS: AudioTrack[] = [
  { 
    id: 'rain', 
    name: 'Hujan', 
    icon: CloudRain, 
    url: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg' 
  },
  { 
    id: 'forest', 
    name: 'Hutan', 
    icon: TreePine, 
    url: 'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg' 
  },
  { 
    id: 'lofi', 
    name: 'Lo-Fi', 
    icon: Coffee, 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' 
  },
  { 
    id: 'white-noise', 
    name: 'Derau Putih', 
    icon: Volume2, 
    url: 'https://actions.google.com/sounds/v1/ambiences/white_noise.ogg' 
  },
];

const ALARM_URL = 'https://actions.google.com/sounds/v1/alarms/alarm_clock_short.ogg';

export default function App() {
  // --- Task Manager State ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('focus-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskText, setNewTaskText] = useState('');

  // --- Pomodoro State ---
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Audio State ---
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  // --- Persist Tasks ---
  useEffect(() => {
    localStorage.setItem('focus-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- Timer Logic ---
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      setIsDone(false);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      setIsDone(true);
      alarmRef.current?.play();
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // --- Audio Logic ---
  useEffect(() => {
    if (activeAudio) {
      const track = AUDIO_TRACKS.find(t => t.id === activeAudio);
      if (track) {
        if (audioRef.current) {
          audioRef.current.src = track.url;
          audioRef.current.loop = true;
          audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
        }
      }
    } else {
      audioRef.current?.pause();
    }
  }, [activeAudio]);

  // --- Derived State ---
  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return (completed / tasks.length) * 100;
  }, [tasks]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Handlers ---
  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsDone(false);
    setTimeLeft(POMODORO_TIME);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-slate-100 font-sans p-4 md:p-8 flex items-center justify-center">
      {/* Hidden Audio Elements */}
      <audio ref={audioRef} />
      <audio ref={alarmRef} src={ALARM_URL} />

      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <header className="text-center space-y-2 mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="p-3 bg-indigo-500/20 backdrop-blur-xl border border-indigo-400/30 rounded-2xl">
              <Focus className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
              Bantuan Fokus
            </h1>
          </motion.div>
          <p className="text-slate-400 font-medium">Temukan ketenangan dan selesaikan pekerjaan Anda</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Timer & Progress */}
          <div className="space-y-6">
            {/* Pomodoro Timer */}
            <motion.section 
              initial={{ x: -20, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                boxShadow: isDone ? '0 0 50px rgba(244, 63, 94, 0.4)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              className={`bg-white/5 backdrop-blur-2xl border rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-colors duration-500 ${
                isDone ? 'border-rose-500/50' : 'border-white/10'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <RotateCcw className="w-32 h-32" />
              </div>
              
              <div className="relative z-10 text-center space-y-6">
                <h2 className={`text-sm font-semibold uppercase tracking-[0.2em] transition-colors ${
                  isDone ? 'text-rose-400' : 'text-indigo-300/70'
                }`}>
                  {isDone ? 'Sesi Selesai!' : 'Waktu Fokus'}
                </h2>
                
                <motion.div 
                  animate={isDone ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } } : {}}
                  className={`text-7xl md:text-8xl font-mono font-bold tracking-tighter tabular-nums drop-shadow-lg transition-colors ${
                    isDone ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {formatTime(timeLeft)}
                </motion.div>
                
                <div className="flex justify-center gap-4 pt-4">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`group flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-xl ${
                      isRunning 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                      : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                  >
                    {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    {isRunning ? 'Jeda' : 'Mulai'}
                  </button>
                  
                  <button
                    onClick={resetTimer}
                    className="p-3 rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-all shadow-lg"
                    title="Reset"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Daily Goal / Progress */}
            <motion.section 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl"
            >
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-lg font-bold text-indigo-200">Sasaran Hari Ini</h3>
                  <p className="text-sm text-slate-400">
                    {tasks.filter(t => t.completed).length} dari {tasks.length} tugas selesai
                  </p>
                </div>
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  {Math.round(progress)}%
                </div>
              </div>
              
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                />
              </div>
            </motion.section>

            {/* Ambient Music */}
            <motion.section 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-xl"
            >
              <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-300/70 mb-4 flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> Suara Ambient
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {AUDIO_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setActiveAudio(activeAudio === track.id ? null : track.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                      activeAudio === track.id
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <track.icon className={`w-6 h-6 ${activeAudio === track.id ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-medium">{track.name}</span>
                  </button>
                ))}
              </div>
              {activeAudio && (
                <div className="mt-4 flex items-center justify-between px-3 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <p className="text-xs text-indigo-300 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Memutar {AUDIO_TRACKS.find(t => t.id === activeAudio)?.name}
                  </p>
                  <button onClick={() => setActiveAudio(null)} className="text-indigo-400 hover:text-indigo-300">
                    <VolumeX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.section>
          </div>

          {/* Right Column: Tasks */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col"
          >
            <section className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-bottom border-white/10">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-400" /> Daftar Tugas
                </h3>
              </div>

              <form onSubmit={addTask} className="p-6 pt-0">
                <div className="relative group">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Tambah tugas baru..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-500"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </form>

              <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 max-h-[500px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence mode="popLayout">
                  {tasks.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 space-y-3"
                    >
                      <div className="inline-block p-4 bg-white/5 rounded-full">
                        <CheckCircle2 className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 font-medium">Bagus! Belum ada tugas.</p>
                    </motion.div>
                  ) : (
                    tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                          task.completed 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-500' 
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-6 h-6 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                            task.completed 
                            ? 'bg-emerald-500 border-emerald-500 bg-emerald-500/30' 
                            : 'border-slate-600 bg-transparent hover:border-indigo-400'
                          }`}
                        >
                          {task.completed && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <span className={`flex-1 font-medium transition-all ${task.completed ? 'line-through opacity-50' : ''}`}>
                          {task.text}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>
        </div>

        {/* Footer Info */}
        <footer className="text-center pt-8">
          <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest">
            DIRANCANG UNTUK PRODUKTIVITAS MAKSIMAL
          </p>
        </footer>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
