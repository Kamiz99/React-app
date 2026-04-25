import { useState, useEffect, useRef, useCallback } from "react";

// ============ SHARED ============
const COLORS = [
  { name: "Rojo", hex: "#ef4444" },
  { name: "Azul", hex: "#3b82f6" },
  { name: "Verde", hex: "#22c55e" },
  { name: "Amarillo", hex: "#eab308" },
  { name: "Morado", hex: "#a855f7" },
  { name: "Naranja", hex: "#f97316" },
  { name: "Rosa", hex: "#ec4899" },
  { name: "Cyan", hex: "#06b6d4" },
];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const GAMES = [
  { id: "reflejos", title: "Reflejos", desc: "Empareja el color antes de que los botones se muevan", icon: "🎯", color: "from-purple-600 to-pink-600" },
  { id: "semaforo", title: "Semáforo", desc: "Pulsa en verde · NO pulses en rojo", icon: "🚦", color: "from-green-600 to-red-600" },
  { id: "apunta", title: "Apunta", desc: "Hit targets fast — entrenamiento de puntería", icon: "🔴", color: "from-orange-600 to-red-600" },
  { id: "secuencia", title: "Secuencia", desc: "Memoriza el patrón y repítelo (Simon)", icon: "🧠", color: "from-blue-600 to-cyan-600" },
  { id: "reaccion", title: "Reacción Pura", desc: "Espera el verde y pulsa lo más rápido posible", icon: "⚡", color: "from-yellow-600 to-green-600" },
  { id: "intruso", title: "Intruso", desc: "Encuentra el color diferente en la cuadrícula", icon: "👁️", color: "from-indigo-600 to-purple-600" },
];

// ============ TRAINING PROGRAM ============
const TRAINING_PROGRAM = {
  1: {
    name: "Velocidad Pura",
    subtitle: "Lunes · Baseline Day",
    icon: "⚡",
    color: "from-yellow-500 to-orange-500",
    why: "Tu tiempo de reacción base define el techo de tus punishes. Si tu baseline es 280ms, nunca vas a castigar un gap de 5f. Hoy medimos dónde estás.",
    drills: [
      { gameId: "reaccion", label: "5 intentos", note: "Calibra tu baseline. Apunta a <250ms promedio" },
      { gameId: "reflejos", label: "3 min", note: "Sube hasta nivel 5 mínimo" },
      { gameId: "apunta", label: "1 ronda (30s)", note: "Mantén precisión >80%" },
    ],
    total: "~8 min",
  },
  2: {
    name: "Discriminación",
    subtitle: "Martes · Brake Training",
    icon: "🚦",
    color: "from-green-500 to-red-500",
    why: "Frenar una reacción ya iniciada es MÁS difícil que reaccionar. Es lo que haces cuando Siegfried bloquea un mixup: el cerebro ya estaba listo para anti-aéreo y hay que cancelar.",
    drills: [
      { gameId: "semaforo", label: "4-5 min", note: "Focus principal. Resiste la tentación de pulsar" },
      { gameId: "intruso", label: "1 ronda", note: "Discriminación visual fina" },
      { gameId: "reflejos", label: "2 min", note: "Warmdown" },
    ],
    total: "~10 min",
  },
  3: {
    name: "Precisión",
    subtitle: "Miércoles · Accuracy Day",
    icon: "🎯",
    color: "from-orange-500 to-red-500",
    why: "Reaccionar rápido al input equivocado no sirve. Hoy entrenamos reaccionar rápido Y bien. En GBVSR: confirmar correcto antes de gastar meter en super.",
    drills: [
      { gameId: "apunta", label: "2 rondas", note: "Precisión >85% o repite" },
      { gameId: "intruso", label: "Llega a grid 5×5", note: "Los tonos se parecen más" },
      { gameId: "reflejos", label: "Solo nivel 7+", note: "Máxima velocidad" },
    ],
    total: "~10 min",
  },
  4: {
    name: "Memoria y Patrones",
    subtitle: "Jueves · Pattern Day",
    icon: "🧠",
    color: "from-blue-500 to-cyan-500",
    why: "Fighting games no son solo reacción — son reconocimiento de patrones. Un top player sabe que rival X hace Y, luego Z. Hoy: memoria de trabajo bajo presión.",
    drills: [
      { gameId: "secuencia", label: "Llega a secuencia 10+", note: "No rompas la cadena" },
      { gameId: "reflejos", label: "Combo x10", note: "Mantén concentración" },
      { gameId: "reaccion", label: "3 intentos", note: "Mide si la fatiga mental afecta" },
    ],
    total: "~10 min",
  },
  5: {
    name: "Circuito Completo",
    subtitle: "Viernes · Tournament Sim",
    icon: "🔄",
    color: "from-purple-500 to-pink-500",
    why: "En un torneo cambias de contexto todo el tiempo: warmup, match, pausa, match, nervios, análisis. Hoy entrenas switching rápido entre tareas cognitivas distintas.",
    drills: [
      { gameId: "reaccion", label: "3 intentos", note: "Check-in" },
      { gameId: "semaforo", label: "2 min", note: "Sin errores" },
      { gameId: "apunta", label: "1 ronda", note: "Precisión alta" },
      { gameId: "secuencia", label: "1 run", note: "Memoria activa" },
      { gameId: "reflejos", label: "2 min", note: "Cierre" },
    ],
    total: "~12 min",
  },
  6: {
    name: "Max Effort",
    subtitle: "Sábado · Push Day",
    icon: "🔥",
    color: "from-red-500 to-orange-600",
    why: "Los sábados van largos. Ataca tus dos drills más débiles el doble de tiempo. El progreso real ocurre saliendo de la zona de confort.",
    drills: [
      { gameId: "reflejos", label: "Intenta nivel 10+", note: "Sesión larga, sin parar" },
      { gameId: "semaforo", label: "5+ min", note: "Precisión bajo fatiga" },
      { gameId: "apunta", label: "2 rondas", note: "Empuja tu high score" },
    ],
    total: "~15 min",
  },
  0: {
    name: "Descanso Activo",
    subtitle: "Domingo · Recovery",
    icon: "🌙",
    color: "from-indigo-500 to-purple-500",
    why: "La recuperación ES parte del entrenamiento. Un drill corto mantiene el hábito sin acumular fatiga. El cerebro consolida gains mientras descansa.",
    drills: [
      { gameId: "reaccion", label: "5 intentos relax", note: "Sin presión, solo feel" },
      { gameId: "intruso", label: "1 ronda suave", note: "Ojo visual" },
    ],
    total: "~5 min",
  },
};

const QUICK_WARMUP = {
  name: "Calentamiento Pre-Match",
  subtitle: "5 min antes de jugar competitivo",
  icon: "🔥",
  color: "from-pink-500 to-red-500",
  why: "Rutina corta para activar reflejos justo antes de entrar a ranked o torneo. NO es entrenamiento — es despertar el sistema.",
  drills: [
    { gameId: "reaccion", label: "3 intentos rápidos", note: "Despierta el nervio" },
    { gameId: "reflejos", label: "1-2 min", note: "Activa visión periférica" },
    { gameId: "apunta", label: "30s", note: "Mano caliente" },
  ],
  total: "~5 min",
};

const DAY_SHORT = ["D", "L", "M", "M", "J", "V", "S"];

// ============ STORAGE (localStorage for browser/PWA) ============
const loadFromStorage = (key, fallback) => {
  try {
    if (typeof window === "undefined") return fallback;
    const r = window.localStorage.getItem(key);
    return r ? JSON.parse(r) : fallback;
  } catch { return fallback; }
};
const saveToStorage = (key, value) => {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

function calculateStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  let current = new Date(sorted[0]);
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i]);
    const diff = Math.round((current - prev) / 86400000);
    if (diff === 1) { streak++; current = prev; } else break;
  }
  return streak;
}

// ============ MAIN HUB ============
export default function ReactionGamesHub() {
  const [view, setView] = useState("games");
  const [activeGame, setActiveGame] = useState(null);
  const [highScores, setHighScores] = useState({});
  const [completedDates, setCompletedDates] = useState([]);

  useEffect(() => {
    setHighScores(loadFromStorage("highScores", {}));
    setCompletedDates(loadFromStorage("completedDates", []));
  }, []);

  const updateHighScore = (gameId, score) => {
    setHighScores((prev) => {
      const next = { ...prev, [gameId]: Math.max(prev[gameId] || 0, score) };
      saveToStorage("highScores", next);
      return next;
    });
  };

  const markTodayComplete = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (completedDates.includes(today)) return;
    const next = [...completedDates, today].sort();
    setCompletedDates(next);
    saveToStorage("completedDates", next);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = completedDates.includes(todayStr);
  const streak = calculateStreak(completedDates);

  const gameComponents = {
    reflejos: ColorMatchGame,
    semaforo: GoNoGoGame,
    apunta: AimTrainerGame,
    secuencia: SimonGame,
    reaccion: ReactionTimerGame,
    intruso: OddOneOutGame,
  };
  const GameComponent = activeGame ? gameComponents[activeGame] : null;

  if (activeGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <button
          onClick={() => setActiveGame(null)}
          className="absolute top-4 left-4 z-10 bg-black/60 hover:bg-black/80 border border-purple-500/30 text-white rounded-lg px-3 py-2 text-sm backdrop-blur transition-colors"
        >
          ← Volver
        </button>
        <GameComponent
          onScore={(s) => updateHighScore(activeGame, s)}
          highScore={highScores[activeGame] || 0}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="max-w-3xl mx-auto p-4 pt-8 pb-12">
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 mb-2 tracking-tight">
            REACT
          </h1>
          <p className="text-purple-300/70 text-xs md:text-sm tracking-[0.3em] uppercase">
            Reaction Training Hub
          </p>
        </div>

        <div className="flex gap-2 mb-6 bg-black/30 p-1 rounded-xl border border-purple-500/20">
          <TabButton active={view === "games"} onClick={() => setView("games")} label="Juegos" icon="🎮" />
          <TabButton
            active={view === "training"}
            onClick={() => setView("training")}
            label="Entrenamiento"
            icon="📅"
            badge={streak > 0 ? `${streak}🔥` : null}
          />
        </div>

        {view === "games" && <GamesGrid highScores={highScores} onSelect={setActiveGame} />}

        {view === "training" && (
          <TrainingView
            onSelectGame={setActiveGame}
            streak={streak}
            completedToday={completedToday}
            onMarkComplete={markTodayComplete}
            completedDates={completedDates}
          />
        )}

        <div className="text-center mt-8 text-purple-300/40 text-xs">
          Entrena tus reflejos · Road to EVO France 2026
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
        active
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
          : "text-purple-200/60 hover:text-white hover:bg-white/5"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {badge && <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

function GamesGrid({ highScores, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {GAMES.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g.id)}
          className="group bg-black/40 backdrop-blur border border-purple-500/20 hover:border-purple-400/60 rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className={`text-4xl w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${g.color} shadow-lg`}>
              {g.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-white font-bold text-lg truncate">{g.title}</h3>
                {highScores[g.id] > 0 && (
                  <span className="text-yellow-400 text-xs font-mono whitespace-nowrap">
                    🏆 {highScores[g.id]}
                  </span>
                )}
              </div>
              <p className="text-purple-200/60 text-xs mt-1">{g.desc}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============ TRAINING VIEW ============
function TrainingView({ onSelectGame, streak, completedToday, onMarkComplete, completedDates }) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [showWarmup, setShowWarmup] = useState(false);
  const today = new Date().getDay();
  const program = showWarmup ? QUICK_WARMUP : TRAINING_PROGRAM[selectedDay];
  const isToday = selectedDay === today && !showWarmup;

  const recentDays = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    recentDays.push({
      date: d.toISOString().slice(0, 10),
      day: d.getDate(),
      completed: completedDates.includes(d.toISOString().slice(0, 10)),
      isToday: i === 0,
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Racha" value={`${streak}🔥`} subtitle={streak === 1 ? "día" : "días"} highlight={streak >= 3} />
        <StatCard label="Total" value={completedDates.length} subtitle="sesiones" />
        <StatCard label="Hoy" value={completedToday ? "✓" : "—"} subtitle={completedToday ? "Listo" : "Pendiente"} highlight={completedToday} />
      </div>

      <button
        onClick={() => { setShowWarmup(!showWarmup); setSelectedDay(today); }}
        className={`w-full rounded-xl p-4 border transition-all ${
          showWarmup
            ? "bg-gradient-to-r from-pink-600/30 to-red-600/30 border-pink-400/60"
            : "bg-black/30 border-purple-500/20 hover:border-pink-400/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🔥</div>
          <div className="text-left flex-1">
            <div className="text-white font-bold text-sm">Calentamiento Pre-Match</div>
            <div className="text-purple-200/60 text-xs">5 min antes de ranked o torneo</div>
          </div>
          <div className="text-xs text-purple-300/60">{showWarmup ? "✓ Activo" : "Ver →"}</div>
        </div>
      </button>

      {!showWarmup && (
        <div>
          <div className="text-xs uppercase tracking-wider text-purple-300/60 mb-2 px-1">
            Programa semanal
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const p = TRAINING_PROGRAM[d];
              const active = selectedDay === d;
              const isTodayBtn = d === today;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`rounded-lg p-2 text-center border transition-all ${
                    active
                      ? "bg-gradient-to-br " + p.color + " border-white/40 shadow-lg"
                      : isTodayBtn
                      ? "bg-white/5 border-yellow-400/40 hover:bg-white/10"
                      : "bg-black/30 border-purple-500/10 hover:bg-white/5"
                  }`}
                >
                  <div className={`text-[10px] uppercase ${active ? "text-white/80" : "text-purple-300/60"}`}>
                    {DAY_SHORT[d]}
                  </div>
                  <div className="text-xl">{p.icon}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={`bg-black/40 backdrop-blur border rounded-2xl overflow-hidden ${isToday ? "border-yellow-400/40" : "border-purple-500/30"}`}>
        <div className={`bg-gradient-to-r ${program.color} p-5`}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{program.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-black text-xl">{program.name}</h3>
                {isToday && (
                  <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">HOY</span>
                )}
              </div>
              <p className="text-white/70 text-xs">{program.subtitle}</p>
            </div>
            <div className="text-white/80 text-xs font-mono">{program.total}</div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-purple-300/60 text-[10px] uppercase tracking-wider mb-1">Por qué esto importa</div>
            <p className="text-purple-100/90 text-sm leading-relaxed">{program.why}</p>
          </div>

          <div>
            <div className="text-purple-300/60 text-[10px] uppercase tracking-wider mb-2">Ejercicios</div>
            <div className="space-y-2">
              {program.drills.map((d, i) => {
                const game = GAMES.find((g) => g.id === d.gameId);
                return (
                  <button
                    key={i}
                    onClick={() => onSelectGame(d.gameId)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 rounded-lg p-3 text-left transition-all flex items-center gap-3 active:scale-[0.98]"
                  >
                    <div className="bg-black/40 rounded-lg w-10 h-10 flex items-center justify-center text-xl flex-shrink-0">
                      {game?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{game?.title}</span>
                        <span className="text-pink-400 text-xs font-mono">{d.label}</span>
                      </div>
                      <div className="text-purple-200/60 text-xs mt-0.5">{d.note}</div>
                    </div>
                    <div className="text-purple-300/40 text-sm">→</div>
                  </button>
                );
              })}
            </div>
          </div>

          {isToday && (
            <button
              onClick={onMarkComplete}
              disabled={completedToday}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                completedToday
                  ? "bg-green-500/20 text-green-400 border border-green-500/40 cursor-default"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {completedToday ? "✓ Sesión de hoy completada" : "Marcar sesión completada"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur border border-purple-500/20 rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wider text-purple-300/60 mb-3">Últimos 14 días</div>
        <div className="grid grid-cols-7 gap-1.5">
          {recentDays.map((d) => (
            <div
              key={d.date}
              className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                d.completed
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                  : d.isToday
                  ? "bg-yellow-400/20 border border-yellow-400/60 text-yellow-400"
                  : "bg-white/5 text-purple-300/40"
              }`}
              title={d.date}
            >
              {d.day}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-[10px] text-purple-300/50">
          <span>Hace 14 días</span>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle, highlight }) {
  return (
    <div className={`bg-black/40 backdrop-blur border rounded-xl p-3 text-center ${highlight ? "border-yellow-400/40" : "border-purple-500/20"}`}>
      <div className="text-[10px] uppercase tracking-wider text-purple-300/60">{label}</div>
      <div className={`font-black text-2xl ${highlight ? "text-yellow-400" : "text-white"}`}>{value}</div>
      <div className="text-[10px] text-purple-300/50">{subtitle}</div>
    </div>
  );
}

// ============ GAME 1: COLOR MATCH ============
function ColorMatchGame({ onScore, highScore }) {
  const [state, setState] = useState("idle");
  const [target, setTarget] = useState(COLORS[0]);
  const [buttons, setButtons] = useState(COLORS.slice(0, 4));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const getCount = (l) => Math.min(8, 4 + Math.floor(l / 3));

  const newRound = (lvl) => {
    const selected = shuffle(COLORS).slice(0, getCount(lvl));
    setTarget(selected[Math.floor(Math.random() * selected.length)]);
    setButtons(selected);
  };

  const start = () => {
    setScore(0); setTimeLeft(30); setLevel(1); setCombo(0); setHits(0); setState("playing"); newRound(1);
  };

  useEffect(() => {
    if (state !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setState("over");
          onScore(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [state, onScore]);

  const click = (c) => {
    if (state !== "playing") return;
    if (c.hex === target.hex) {
      const newCombo = combo + 1;
      const newScore = score + 10 + newCombo * 2;
      setScore(newScore); setCombo(newCombo); setHits((h) => h + 1); setFeedback("ok");
      const newLevel = 1 + Math.floor(newScore / 100);
      setLevel(newLevel);
      setTimeout(() => setFeedback(null), 150);
      newRound(newLevel);
    } else {
      setFeedback("bad");
      setState("over");
      onScore(scoreRef.current);
      clearInterval(timerRef.current);
    }
  };

  return (
    <GameShell title="Reflejos" feedback={feedback}>
      {state === "idle" && (
        <StartScreen icon="🎯" title="Reflejos"
          desc="30 segundos. Haz clic en el color objetivo. UN SOLO FALLO y pierdes. Más nivel = más colores a elegir."
          highScore={highScore} onStart={start} />
      )}
      {state === "playing" && (
        <>
          <StatsBar items={[
            { label: "Puntos", value: score },
            { label: "Tiempo", value: `${timeLeft}s`, highlight: timeLeft <= 5 },
            { label: "Combo", value: `x${combo}`, highlight: combo >= 5 },
            { label: "Hits", value: hits },
          ]} />
          <div className="text-center text-xs tracking-widest text-purple-300/60 uppercase mb-2 mt-4">
            Encuentra este color
          </div>
          <div className="h-28 rounded-2xl border-2 border-white/20 mb-6"
            style={{ backgroundColor: target.hex, boxShadow: `0 0 60px ${target.hex}80` }} />
          <div className={`grid gap-3 ${buttons.length <= 4 ? "grid-cols-2" : buttons.length <= 6 ? "grid-cols-3" : "grid-cols-4"}`}>
            {buttons.map((c, i) => (
              <button key={`${c.hex}-${i}`} onClick={() => click(c)}
                className="aspect-square rounded-xl border-2 border-white/10 hover:border-white/40 active:scale-90 transition-all hover:scale-105"
                style={{ backgroundColor: c.hex, boxShadow: `0 4px 20px ${c.hex}60` }} />
            ))}
          </div>
        </>
      )}
      {state === "over" && (
        <GameOverScreen score={score} isHighScore={score > 0 && score >= highScore}
          stats={[{ label: "Hits", value: hits }, { label: "Nivel", value: level }]} onRestart={start} />
      )}
    </GameShell>
  );
}

// ============ GAME 2: GO / NO-GO ============
function GoNoGoGame({ onScore, highScore }) {
  const [state, setState] = useState("idle");
  const [signal, setSignal] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);
  const [showTime, setShowTime] = useState(null);
  const [lastRT, setLastRT] = useState(null);
  const [bestRT, setBestRT] = useState(null);
  const timeoutRef = useRef(null);
  const scoreRef = useRef(0);
  const stateRef = useRef("idle");
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { stateRef.current = state; }, [state]);

  const nextSignal = useCallback(() => {
    setSignal(null);
    const delay = 700 + Math.random() * 1800;
    timeoutRef.current = setTimeout(() => {
      const isGo = Math.random() < 0.65;
      setSignal(isGo ? "go" : "nogo");
      setShowTime(Date.now());
      timeoutRef.current = setTimeout(() => {
        setSignal((s) => {
          if (s === "nogo") { setScore((sc) => sc + 5); setRound((r) => r + 1); nextSignal(); return null; }
          if (s === "go") {
            setLives((l) => {
              const nl = l - 1;
              if (nl <= 0) {
                if (stateRef.current === "playing") { setState("over"); onScore(scoreRef.current); }
              } else nextSignal();
              return nl;
            });
            return null;
          }
          return s;
        });
      }, 900);
    }, delay);
  }, [onScore]);

  const start = () => {
    setScore(0); setLives(3); setRound(0); setLastRT(null); setState("playing"); nextSignal();
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const click = () => {
    if (state !== "playing") return;
    if (signal === "go") {
      const rt = Date.now() - showTime;
      setLastRT(rt);
      if (!bestRT || rt < bestRT) setBestRT(rt);
      setScore((s) => s + Math.max(5, Math.floor(100 - rt / 10)));
      setRound((r) => r + 1);
      setSignal(null);
      clearTimeout(timeoutRef.current);
      nextSignal();
    } else if (signal === "nogo") {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) {
          setState("over"); onScore(scoreRef.current); clearTimeout(timeoutRef.current);
        } else {
          clearTimeout(timeoutRef.current); setSignal(null); nextSignal();
        }
        return nl;
      });
    } else {
      setLives((l) => {
        const nl = l - 1;
        if (nl <= 0) { setState("over"); onScore(scoreRef.current); clearTimeout(timeoutRef.current); }
        return nl;
      });
    }
  };

  return (
    <GameShell title="Semáforo">
      {state === "idle" && (
        <StartScreen icon="🚦" title="Semáforo"
          desc="Verde = PULSA. Rojo = NO pulses. Tu cerebro tiene que frenar tan rápido como reacciona."
          highScore={highScore} onStart={start} />
      )}
      {state === "playing" && (
        <>
          <StatsBar items={[
            { label: "Puntos", value: score },
            { label: "Ronda", value: round },
            { label: "Última", value: lastRT ? `${lastRT}ms` : "—" },
            { label: "Vidas", value: "❤".repeat(lives) + "♡".repeat(3 - lives) },
          ]} />
          <button onClick={click}
            className="w-full aspect-square mt-6 rounded-3xl border-4 border-white/10 transition-all duration-100 flex items-center justify-center active:scale-95"
            style={{
              backgroundColor: signal === "go" ? "#22c55e" : signal === "nogo" ? "#ef4444" : "#1e1b4b",
              boxShadow: signal === "go" ? "0 0 100px #22c55e" : signal === "nogo" ? "0 0 100px #ef4444" : "none",
            }}>
            <span className="text-white text-4xl md:text-5xl font-black uppercase tracking-wider drop-shadow-lg">
              {signal === "go" ? "¡PULSA!" : signal === "nogo" ? "¡NO!" : "Espera..."}
            </span>
          </button>
          {bestRT && (
            <div className="text-center mt-4 text-sm text-purple-300/70">
              Mejor reacción: <span className="text-yellow-400 font-mono font-bold">{bestRT}ms</span>
            </div>
          )}
        </>
      )}
      {state === "over" && (
        <GameOverScreen score={score} isHighScore={score > 0 && score >= highScore}
          stats={[{ label: "Rondas", value: round }, { label: "Mejor reacción", value: bestRT ? `${bestRT}ms` : "—" }]}
          onRestart={start} />
      )}
    </GameShell>
  );
}

// ============ GAME 3: AIM TRAINER ============
function AimTrainerGame({ onScore, highScore }) {
  const [state, setState] = useState("idle");
  const [target, setTarget] = useState({ x: 50, y: 50, size: 80 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const newTarget = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const size = Math.max(40, 80 - hits * 1.5);
    const pad = size / 2 + 10;
    const x = pad + Math.random() * (rect.width - pad * 2);
    const y = pad + Math.random() * (rect.height - pad * 2);
    setTarget({ x, y, size });
  }, [hits]);

  const start = () => {
    setScore(0); setHits(0); setMisses(0); setTimeLeft(30); setState("playing");
    setTimeout(newTarget, 50);
  };

  useEffect(() => {
    if (state !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current); setState("over"); onScore(scoreRef.current); return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [state, onScore]);

  const hitTarget = (e) => { e.stopPropagation(); setScore((s) => s + 10); setHits((h) => h + 1); newTarget(); };
  const missClick = () => { if (state !== "playing") return; setMisses((m) => m + 1); setScore((s) => Math.max(0, s - 3)); };

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  return (
    <GameShell title="Apunta">
      {state === "idle" && (
        <StartScreen icon="🔴" title="Apunta"
          desc="30 segundos. Clica los objetivos rojos. Fallar resta puntos. Se hacen más pequeños con cada hit."
          highScore={highScore} onStart={start} />
      )}
      {state === "playing" && (
        <>
          <StatsBar items={[
            { label: "Puntos", value: score },
            { label: "Tiempo", value: `${timeLeft}s`, highlight: timeLeft <= 5 },
            { label: "Hits", value: hits },
            { label: "Precisión", value: `${accuracy}%` },
          ]} />
          <div ref={containerRef} onClick={missClick}
            className="relative w-full h-[400px] md:h-[500px] mt-6 rounded-2xl bg-black/60 border-2 border-purple-500/30 overflow-hidden cursor-crosshair">
            <div onClick={hitTarget}
              className="absolute rounded-full bg-gradient-to-br from-red-400 to-red-700 border-4 border-white/30 shadow-2xl cursor-pointer transition-all hover:scale-110"
              style={{
                left: target.x - target.size / 2, top: target.y - target.size / 2,
                width: target.size, height: target.size, boxShadow: "0 0 30px #ef4444",
              }} />
          </div>
        </>
      )}
      {state === "over" && (
        <GameOverScreen score={score} isHighScore={score > 0 && score >= highScore}
          stats={[{ label: "Hits", value: hits }, { label: "Precisión", value: `${accuracy}%` }]}
          onRestart={start} />
      )}
    </GameShell>
  );
}

// ============ GAME 4: SIMON ============
function SimonGame({ onScore, highScore }) {
  const pads = [
    { id: 0, color: "#22c55e" },
    { id: 1, color: "#ef4444" },
    { id: 2, color: "#3b82f6" },
    { id: 3, color: "#eab308" },
  ];

  const [state, setState] = useState("idle");
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [showing, setShowing] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const playSequence = useCallback((seq) => {
    setShowing(true); setActivePad(null);
    seq.forEach((padId, i) => {
      setTimeout(() => {
        setActivePad(padId);
        setTimeout(() => setActivePad(null), 350);
      }, (i + 1) * 600);
    });
    setTimeout(() => { setShowing(false); setUserStep(0); }, seq.length * 600 + 400);
  }, []);

  const start = () => {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first); setScore(0); setState("playing");
    setTimeout(() => playSequence(first), 500);
  };

  const click = (id) => {
    if (state !== "playing" || showing) return;
    setActivePad(id);
    setTimeout(() => setActivePad(null), 200);

    if (id === sequence[userStep]) {
      if (userStep === sequence.length - 1) {
        const newScore = score + sequence.length * 10;
        setScore(newScore);
        const next = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(next);
        setTimeout(() => playSequence(next), 800);
      } else setUserStep((s) => s + 1);
    } else {
      setState("over");
      onScore(scoreRef.current);
    }
  };

  return (
    <GameShell title="Secuencia">
      {state === "idle" && (
        <StartScreen icon="🧠" title="Secuencia"
          desc="Memoriza el patrón y repítelo. Cada ronda añade un color. Un error = game over."
          highScore={highScore} onStart={start} />
      )}
      {state === "playing" && (
        <>
          <StatsBar items={[
            { label: "Puntos", value: score },
            { label: "Secuencia", value: sequence.length },
            { label: "Estado", value: showing ? "Mira..." : "Tu turno", highlight: !showing },
          ]} />
          <div className="grid grid-cols-2 gap-3 mt-6 max-w-md mx-auto">
            {pads.map((p) => (
              <button key={p.id} onClick={() => click(p.id)} disabled={showing}
                className={`aspect-square rounded-2xl border-4 transition-all duration-100 ${
                  activePad === p.id ? "border-white scale-95 brightness-150" : "border-white/10 brightness-75 hover:brightness-100"
                }`}
                style={{
                  backgroundColor: p.color,
                  boxShadow: activePad === p.id ? `0 0 60px ${p.color}` : `0 4px 20px ${p.color}40`,
                }} />
            ))}
          </div>
          <div className="text-center mt-6 text-sm text-purple-300/60">
            Progreso: {userStep} / {sequence.length}
          </div>
        </>
      )}
      {state === "over" && (
        <GameOverScreen score={score} isHighScore={score > 0 && score >= highScore}
          stats={[{ label: "Secuencia alcanzada", value: sequence.length - 1 }]} onRestart={start} />
      )}
    </GameShell>
  );
}

// ============ GAME 5: REACTION TIMER ============
function ReactionTimerGame({ onScore, highScore }) {
  const [state, setState] = useState("idle");
  const [startTime, setStartTime] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [currentRT, setCurrentRT] = useState(null);
  const timeoutRef = useRef(null);
  const ATTEMPTS = 5;

  const beginAttempt = () => {
    setState("waiting");
    const delay = 1500 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => { setStartTime(Date.now()); setState("go"); }, delay);
  };

  const click = () => {
    if (state === "idle" || state === "result" || state === "done") {
      if (reactions.length >= ATTEMPTS) { setReactions([]); setCurrentRT(null); }
      beginAttempt();
    } else if (state === "waiting") {
      clearTimeout(timeoutRef.current); setState("tooEarly");
    } else if (state === "go") {
      const rt = Date.now() - startTime;
      setCurrentRT(rt);
      const newReactions = [...reactions, rt];
      setReactions(newReactions);
      if (newReactions.length >= ATTEMPTS) {
        setState("done");
        const avg = Math.round(newReactions.reduce((a, b) => a + b, 0) / newReactions.length);
        onScore(Math.max(0, Math.round(50000 / avg)));
      } else setState("result");
    } else if (state === "tooEarly") setState("result");
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const bg = state === "waiting" ? "#991b1b" : state === "go" ? "#16a34a" : state === "tooEarly" ? "#78350f" : "#1e1b4b";
  const avg = reactions.length > 0 ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : null;
  const best = reactions.length > 0 ? Math.min(...reactions) : null;

  return (
    <GameShell title="Reacción Pura">
      {state === "idle" && reactions.length === 0 && (
        <StartScreen icon="⚡" title="Reacción Pura"
          desc={`Cuando la pantalla se ponga VERDE, pulsa lo más rápido posible. Si pulsas antes = falta. ${ATTEMPTS} intentos. Promedio humano: 250ms.`}
          highScore={highScore > 0 ? `${Math.round(50000 / highScore)}ms avg` : 0}
          onStart={beginAttempt} />
      )}
      {(state === "waiting" || state === "go" || state === "tooEarly" || state === "result") && (
        <>
          <StatsBar items={[
            { label: "Intento", value: `${reactions.length + (state === "result" || state === "tooEarly" ? 0 : 1)}/${ATTEMPTS}` },
            { label: "Último", value: currentRT ? `${currentRT}ms` : "—" },
            { label: "Promedio", value: avg ? `${avg}ms` : "—" },
            { label: "Mejor", value: best ? `${best}ms` : "—" },
          ]} />
          <button onClick={click}
            className="w-full aspect-square mt-6 rounded-3xl border-4 border-white/10 transition-all duration-100 flex flex-col items-center justify-center active:scale-95"
            style={{ backgroundColor: bg, boxShadow: state === "go" ? "0 0 100px #22c55e" : "none" }}>
            <span className="text-white text-3xl md:text-4xl font-black uppercase tracking-wider drop-shadow-lg text-center px-4">
              {state === "waiting" && "Espera al verde..."}
              {state === "go" && "¡¡PULSA!!"}
              {state === "tooEarly" && "¡Muy pronto! Toca para continuar"}
              {state === "result" && (
                <>
                  {currentRT ? `${currentRT}ms` : "Falló"}
                  <div className="text-base mt-2 opacity-70">Toca para siguiente</div>
                </>
              )}
            </span>
          </button>
        </>
      )}
      {state === "done" && (
        <GameOverScreen score={avg ? `${avg}ms` : "—"} customScoreLabel="Promedio"
          isHighScore={!!best}
          stats={[{ label: "Mejor", value: `${best}ms` }, { label: "Intentos", value: reactions.length }]}
          onRestart={() => { setReactions([]); setCurrentRT(null); beginAttempt(); }} />
      )}
    </GameShell>
  );
}

// ============ GAME 6: ODD ONE OUT ============
function OddOneOutGame({ onScore, highScore }) {
  const [state, setState] = useState("idle");
  const [grid, setGrid] = useState([]);
  const [oddIdx, setOddIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [round, setRound] = useState(0);
  const [gridSize, setGridSize] = useState(3);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };

  const newRound = (r) => {
    const size = Math.min(6, 3 + Math.floor(r / 3));
    setGridSize(size);
    const base = COLORS[Math.floor(Math.random() * COLORS.length)];
    const rgb = hexToRgb(base.hex);
    const diff = Math.max(15, 60 - r * 3);
    const odd = {
      r: Math.max(0, Math.min(255, rgb.r + (Math.random() > 0.5 ? diff : -diff))),
      g: Math.max(0, Math.min(255, rgb.g + (Math.random() > 0.5 ? diff : -diff))),
      b: Math.max(0, Math.min(255, rgb.b + (Math.random() > 0.5 ? diff : -diff))),
    };
    const oddHex = `#${[odd.r, odd.g, odd.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
    const total = size * size;
    const idx = Math.floor(Math.random() * total);
    const cells = Array(total).fill(base.hex).map((c, i) => (i === idx ? oddHex : c));
    setGrid(cells); setOddIdx(idx);
  };

  const start = () => {
    setScore(0); setRound(0); setTimeLeft(30); setState("playing"); newRound(0);
  };

  useEffect(() => {
    if (state !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setState("over"); onScore(scoreRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [state, onScore]);

  const click = (i) => {
    if (state !== "playing") return;
    if (i === oddIdx) {
      setScore((s) => s + 15 + round);
      setTimeLeft((t) => Math.min(30, t + 2));
      const nr = round + 1;
      setRound(nr); newRound(nr);
    } else setTimeLeft((t) => Math.max(0, t - 3));
  };

  return (
    <GameShell title="Intruso">
      {state === "idle" && (
        <StartScreen icon="👁️" title="Intruso"
          desc="Encuentra el cuadro con color diferente. 30s. Aciertos = +2s. Fallos = −3s. Los colores se parecen más cada ronda."
          highScore={highScore} onStart={start} />
      )}
      {state === "playing" && (
        <>
          <StatsBar items={[
            { label: "Puntos", value: score },
            { label: "Tiempo", value: `${timeLeft}s`, highlight: timeLeft <= 5 },
            { label: "Ronda", value: round + 1 },
            { label: "Grid", value: `${gridSize}×${gridSize}` },
          ]} />
          <div className="grid gap-1 mt-6 mx-auto"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, maxWidth: "min(90vw, 500px)" }}>
            {grid.map((c, i) => (
              <button key={i} onClick={() => click(i)}
                className="aspect-square rounded-lg border border-white/5 hover:border-white/30 active:scale-90 transition-transform"
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </>
      )}
      {state === "over" && (
        <GameOverScreen score={score} isHighScore={score > 0 && score >= highScore}
          stats={[{ label: "Rondas", value: round }]} onRestart={start} />
      )}
    </GameShell>
  );
}

// ============ SHARED UI ============
function GameShell({ title, children, feedback }) {
  const bgFlash = feedback === "ok" ? "bg-green-500/10" : feedback === "bad" ? "bg-red-500/20" : "";
  return (
    <div className={`min-h-screen p-4 pt-16 transition-colors duration-200 ${bgFlash}`}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-tight">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatsBar({ items }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((it, i) => (
        <div key={i}
          className={`bg-black/40 backdrop-blur border rounded-xl p-2 text-center ${
            it.highlight ? "border-yellow-400/60" : "border-purple-500/20"
          }`}>
          <div className="text-[10px] uppercase tracking-wider text-purple-300/60">{it.label}</div>
          <div className={`font-black text-base md:text-lg ${it.highlight ? "text-yellow-400" : "text-white"}`}>
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function StartScreen({ icon, title, desc, highScore, onStart }) {
  return (
    <div className="bg-black/40 backdrop-blur border border-purple-500/30 rounded-2xl p-8 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      <p className="text-purple-200/80 text-sm mb-6 leading-relaxed">{desc}</p>
      {highScore > 0 && <div className="text-yellow-400 mb-4 font-semibold">🏆 Récord: {highScore}</div>}
      <button onClick={onStart}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/50 transition-all hover:scale-105 active:scale-95">
        EMPEZAR
      </button>
    </div>
  );
}

function GameOverScreen({ score, isHighScore, stats = [], onRestart, customScoreLabel }) {
  return (
    <div className="bg-black/40 backdrop-blur border border-pink-500/30 rounded-2xl p-8 text-center mt-6">
      <div className="text-6xl mb-4">💀</div>
      <h2 className="text-3xl font-black text-white mb-2">GAME OVER</h2>
      {customScoreLabel && (
        <div className="text-purple-300/60 text-xs uppercase tracking-wider mb-1">{customScoreLabel}</div>
      )}
      <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
        {score}
      </div>
      {stats.length > 0 && (
        <div className="grid gap-3 mb-6 text-sm" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
          {stats.map((s, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-3">
              <div className="text-purple-300/60 text-xs uppercase tracking-wider">{s.label}</div>
              <div className="text-white font-bold text-xl">{s.value}</div>
            </div>
          ))}
        </div>
      )}
      {isHighScore && <div className="text-yellow-400 font-bold mb-4 animate-pulse">🏆 ¡NUEVO RÉCORD!</div>}
      <button onClick={onRestart}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/50 transition-all hover:scale-105 active:scale-95">
        JUGAR DE NUEVO
      </button>
    </div>
  );
}
