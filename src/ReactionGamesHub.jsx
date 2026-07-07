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

// Los ids se mantienen estables: son la clave de los récords en localStorage.
const GAMES = [
  { id: "reflejos", title: "Defensa", desc: "Cada ataque pide su defensa — elige la respuesta correcta (ley de Hick)", icon: "🛡️" },
  { id: "semaforo", title: "Fintas", desc: "Golpea en verde · NO piques con la finta (Go/No-Go)", icon: "🎭" },
  { id: "apunta", title: "Precisión", desc: "Blancos pequeños y móviles — colocación sobre volumen", icon: "🎯" },
  { id: "secuencia", title: "Combinaciones", desc: "Memoriza el combo y repítelo — cada ronda añade un golpe", icon: "🥊" },
  { id: "reaccion", title: "Contragolpe", desc: "Espera el verde y dispara — reacción simple pura", icon: "⚡" },
  { id: "intruso", title: "Lectura", desc: "Caza el detalle que no encaja — los micro-gestos delatan el golpe", icon: "👁️" },
];

// ============ TRAINING PROGRAM ============
// `plays` = cuántas partidas completas de ese juego forman el ejercicio
// en la sesión guiada automática.
const TRAINING_PROGRAM = {
  1: {
    name: "Velocidad de Contra",
    subtitle: "Lunes · Línea base",
    icon: "⚡",
    why: "Un jab tarda unos 300 ms en llegar; la reacción visual simple de un boxeador de élite ronda los 200 ms. Si tu línea base es lenta, el contragolpe sale tarde por muy buena que sea tu técnica. Hoy medimos dónde estás y la empujamos.",
    drills: [
      { gameId: "reaccion", label: "5 intentos", note: "Mide tu línea base. Élite: <220ms de promedio", plays: 1 },
      { gameId: "reflejos", label: "3 partidas", note: "Decisión rápida con pocas opciones", plays: 3 },
      { gameId: "apunta", label: "1 ronda (30s)", note: "Mantén precisión >80%", plays: 1 },
    ],
    total: "~8 min",
  },
  2: {
    name: "Disciplina ante Fintas",
    subtitle: "Martes · Inhibición de respuesta",
    icon: "🎭",
    why: "Morder una finta es regalar el contragolpe. Los estudios de control inhibitorio (tareas Go/No-Go) muestran que los atletas de combate de élite destacan más por FRENAR respuestas que por reaccionar rápido: frenar un golpe ya iniciado cuesta más que lanzarlo.",
    drills: [
      { gameId: "semaforo", label: "2 partidas", note: "Foco del día. No piques con la finta: cada error es un contra que comes", plays: 2 },
      { gameId: "intruso", label: "1 ronda", note: "Discriminación visual fina antes de decidir", plays: 1 },
      { gameId: "reflejos", label: "2 partidas", note: "Vuelta a la calma decidiendo rápido", plays: 2 },
    ],
    total: "~10 min",
  },
  3: {
    name: "Precisión de Impacto",
    subtitle: "Miércoles · Ley de Fitts",
    icon: "🎯",
    why: "La ley de Fitts: a más velocidad, menos precisión. El golpeo eficaz vive en ese límite — mentón, hígado o pierna adelantada son blancos pequeños y móviles. Se entrena la colocación a máxima velocidad, no el volumen.",
    drills: [
      { gameId: "apunta", label: "2 rondas", note: "Precisión >85% o repite — los blancos encogen", plays: 2 },
      { gameId: "intruso", label: "Llega a grid 5×5", note: "Escaneo amplio: manos arriba, piernas abajo", plays: 1 },
      { gameId: "reflejos", label: "2 partidas", note: "Decisión correcta a máxima velocidad", plays: 2 },
    ],
    total: "~10 min",
  },
  4: {
    name: "Combinaciones",
    subtitle: "Jueves · Memoria de trabajo",
    icon: "🥊",
    why: "Un 1-2-3-low kick fluido no se piensa: se recupera de memoria como un solo bloque ('chunking'). Automatizar combinaciones libera atención para leer al rival, que es donde se ganan los asaltos. Hoy: memoria de secuencias bajo presión.",
    drills: [
      { gameId: "secuencia", label: "Llega a 10+ golpes", note: "Un combo largo sin romper la cadena", plays: 1 },
      { gameId: "reflejos", label: "2 partidas", note: "Mantén la concentración tras memorizar", plays: 2 },
      { gameId: "reaccion", label: "5 intentos", note: "¿La carga mental te frena la reacción?", plays: 1 },
    ],
    total: "~10 min",
  },
  5: {
    name: "Simulación de Combate",
    subtitle: "Viernes · Práctica variada",
    icon: "🔄",
    why: "Un asalto es cambio de contexto constante: atacar, defender, leer, resetear. La investigación en aprendizaje motor (interferencia contextual) muestra que la práctica variada y aleatoria retiene más que repetir lo mismo en bloque. Circuito completo sin pausa.",
    drills: [
      { gameId: "reaccion", label: "5 intentos", note: "Activación", plays: 1 },
      { gameId: "semaforo", label: "1 partida", note: "Sin picar ni una finta", plays: 1 },
      { gameId: "apunta", label: "1 ronda", note: "Colocación limpia", plays: 1 },
      { gameId: "secuencia", label: "1 run", note: "Combo en memoria", plays: 1 },
      { gameId: "reflejos", label: "1 partida", note: "Cierre decidiendo rápido", plays: 1 },
    ],
    total: "~12 min",
  },
  6: {
    name: "Decisión Bajo Fatiga",
    subtitle: "Sábado · Resistencia mental",
    icon: "🔥",
    why: "La mayoría de los KOs llegan en asaltos tardíos, cuando la fatiga degrada las decisiones antes que el físico. El entrenamiento de resistencia cerebral (tareas cognitivas en estado de fatiga) mejora la toma de decisiones al final del combate. Ideal justo después de tu sesión física: sesión larga, precisión cuando ya no queda frescura.",
    drills: [
      { gameId: "reflejos", label: "3 partidas seguidas", note: "Sin parar entre partidas", plays: 3 },
      { gameId: "semaforo", label: "2 partidas", note: "Disciplina ante la finta, ya cansado", plays: 2 },
      { gameId: "apunta", label: "2 rondas", note: "Que la precisión no caiga con la fatiga", plays: 2 },
    ],
    total: "~15 min",
  },
  0: {
    name: "Recuperación",
    subtitle: "Domingo · Consolidación",
    icon: "🌙",
    why: "El cerebro consolida el aprendizaje motor durante el descanso y el sueño, no acumulando volumen. Un estímulo corto y sin presión mantiene el hábito sin frenar la recuperación.",
    drills: [
      { gameId: "reaccion", label: "5 intentos relax", note: "Sin presión, solo sentir la señal", plays: 1 },
      { gameId: "intruso", label: "1 ronda suave", note: "Mantener el ojo activo", plays: 1 },
    ],
    total: "~5 min",
  },
};

const QUICK_WARMUP = {
  name: "Activación Pre-Sparring",
  subtitle: "5 min antes de guantear o competir",
  icon: "🔥",
  why: "La activación moderada mejora el tiempo de reacción (curva en U invertida de Yerkes-Dodson): ni frío ni pasado de vueltas. 5 minutos de reacción despiertan el sistema nervioso sin gastar gasolina — esto NO es entrenamiento, es encender la máquina.",
  drills: [
    { gameId: "reaccion", label: "3 intentos rápidos", note: "Despierta el nervio", plays: 1 },
    { gameId: "reflejos", label: "1 partida", note: "Activa la decisión rápida", plays: 1 },
    { gameId: "apunta", label: "30s", note: "Mano caliente y ojo fino", plays: 1 },
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
  const [session, setSession] = useState(null); // { program, mark }
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
    setCompletedDates((prev) => {
      if (prev.includes(today)) return prev;
      const next = [...prev, today].sort();
      saveToStorage("completedDates", next);
      return next;
    });
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const completedToday = completedDates.includes(todayStr);
  const streak = calculateStreak(completedDates);

  if (session) {
    return (
      <TrainingSession
        program={session.program}
        markOnFinish={session.mark}
        highScores={highScores}
        updateHighScore={updateHighScore}
        onFinish={markTodayComplete}
        onExit={() => setSession(null)}
      />
    );
  }

  const GameComponent = activeGame ? GAME_COMPONENTS[activeGame] : null;

  if (activeGame) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <button
          onClick={() => setActiveGame(null)}
          className="fixed left-4 z-10 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-full px-4 py-2 text-sm backdrop-blur transition-colors"
          style={{ top: 'max(16px, calc(env(safe-area-inset-top) + 8px))' }}
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
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-3xl mx-auto p-5 pt-12 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight">
            react
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Reflejos para boxeo y kickboxing
          </p>
        </div>

        <div className="flex gap-1 mb-8 bg-zinc-900/60 p-1 rounded-full border border-zinc-800/80 w-fit">
          <TabButton active={view === "games"} onClick={() => setView("games")} label="Juegos" />
          <TabButton
            active={view === "training"}
            onClick={() => setView("training")}
            label="Entrenamiento"
            badge={streak > 0 ? `${streak}` : null}
          />
        </div>

        {view === "games" && <GamesGrid highScores={highScores} onSelect={setActiveGame} />}

        {view === "training" && (
          <TrainingView
            onSelectGame={setActiveGame}
            onStartSession={(program, mark) => setSession({ program, mark })}
            streak={streak}
            completedToday={completedToday}
            completedDates={completedDates}
          />
        )}

        <div className="mt-12 text-zinc-600 text-xs">
          Entrenamiento cognitivo para deportes de combate
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm transition-colors flex items-center gap-2 ${
        active
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <span>{label}</span>
      {badge && <span className="text-xs text-amber-300/90">{badge}🔥</span>}
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
          className="bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 text-left transition-colors active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="text-2xl w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-800/60">
              {g.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-zinc-100 font-medium truncate">{g.title}</h3>
                {highScores[g.id] > 0 && (
                  <span className="text-amber-300/80 text-xs font-mono whitespace-nowrap">
                    {highScores[g.id]}
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-xs mt-1">{g.desc}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============ TRAINING VIEW ============
function TrainingView({ onSelectGame, onStartSession, streak, completedToday, completedDates }) {
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
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Racha" value={streak} subtitle={streak === 1 ? "día" : "días"} highlight={streak >= 3} />
        <StatCard label="Total" value={completedDates.length} subtitle="sesiones" />
        <StatCard label="Hoy" value={completedToday ? "✓" : "—"} subtitle={completedToday ? "Listo" : "Pendiente"} highlight={completedToday} />
      </div>

      <button
        onClick={() => { setShowWarmup(!showWarmup); setSelectedDay(today); }}
        className={`w-full rounded-2xl p-4 border transition-colors ${
          showWarmup
            ? "bg-zinc-900 border-zinc-600"
            : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-xl">🔥</div>
          <div className="text-left flex-1">
            <div className="text-zinc-100 font-medium text-sm">Activación Pre-Sparring</div>
            <div className="text-zinc-500 text-xs">5 min antes de guantear o competir</div>
          </div>
          <div className="text-xs text-zinc-500">{showWarmup ? "✓ Activo" : "Ver →"}</div>
        </div>
      </button>

      {!showWarmup && (
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2 px-1">
            Programa semanal
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const p = TRAINING_PROGRAM[d];
              const active = selectedDay === d;
              const isTodayBtn = d === today;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`rounded-xl p-2 text-center border transition-colors ${
                    active
                      ? "bg-zinc-800 border-zinc-600"
                      : isTodayBtn
                      ? "bg-zinc-900/50 border-amber-300/30 hover:border-zinc-600"
                      : "bg-zinc-900/50 border-zinc-800/60 hover:border-zinc-700"
                  }`}
                >
                  <div className={`text-[10px] uppercase ${active ? "text-zinc-300" : "text-zinc-600"}`}>
                    {DAY_SHORT[d]}
                  </div>
                  <div className="text-lg">{p.icon}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{program.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-zinc-100 font-medium text-lg">{program.name}</h3>
                {isToday && (
                  <span className="bg-amber-300/10 text-amber-300 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-300/30">Hoy</span>
                )}
              </div>
              <p className="text-zinc-500 text-xs">{program.subtitle}</p>
            </div>
            <div className="text-zinc-500 text-xs font-mono">{program.total}</div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <button
              onClick={() => onStartSession(program, !showWarmup)}
              className="w-full py-3 rounded-full bg-zinc-100 hover:bg-white text-zinc-900 font-medium text-sm transition-colors active:scale-[0.99]"
            >
              ▶ Iniciar sesión automática
            </button>
            <p className="text-zinc-500 text-xs text-center mt-2">
              Los ejercicios se encadenan solos{!showWarmup && " y la sesión se registra al terminar"} · {program.total}
            </p>
          </div>

          <div>
            <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1.5">Por qué esto importa</div>
            <p className="text-zinc-400 text-sm leading-relaxed">{program.why}</p>
          </div>

          <div>
            <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">Ejercicios</div>
            <div className="space-y-2">
              {program.drills.map((d, i) => {
                const game = GAMES.find((g) => g.id === d.gameId);
                return (
                  <button
                    key={i}
                    onClick={() => onSelectGame(d.gameId)}
                    className="w-full bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 text-left transition-colors flex items-center gap-3 active:scale-[0.99]"
                  >
                    <div className="bg-zinc-800/80 rounded-lg w-9 h-9 flex items-center justify-center text-lg flex-shrink-0">
                      {game?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-zinc-200 font-medium text-sm">{game?.title}</span>
                        <span className="text-zinc-500 text-xs font-mono">{d.label}</span>
                      </div>
                      <div className="text-zinc-500 text-xs mt-0.5">{d.note}</div>
                    </div>
                    <div className="text-zinc-600 text-sm">→</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4">
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Últimos 14 días</div>
        <div className="grid grid-cols-7 gap-1.5">
          {recentDays.map((d) => (
            <div
              key={d.date}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs transition-colors ${
                d.completed
                  ? "bg-zinc-200 text-zinc-900 font-medium"
                  : d.isToday
                  ? "border border-amber-300/40 text-amber-300/90"
                  : "bg-zinc-800/40 text-zinc-600"
              }`}
              title={d.date}
            >
              {d.day}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-600">
          <span>Hace 14 días</span>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle, highlight }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
      <div className={`font-semibold text-2xl ${highlight ? "text-amber-300" : "text-zinc-100"}`}>{value}</div>
      <div className="text-[10px] text-zinc-600">{subtitle}</div>
    </div>
  );
}

// ============ GUIDED AUTO SESSION ============
// Encadena los ejercicios del programa sin intervención: cuenta atrás,
// el juego arranca solo, al terminar pasa al siguiente y al final la
// sesión se registra automáticamente.
function TrainingSession({ program, markOnFinish, highScores, updateHighScore, onFinish, onExit }) {
  const drills = program.drills;
  const totalPlays = drills.reduce((a, d) => a + (d.plays || 1), 0);

  const [drillIdx, setDrillIdx] = useState(0);
  const [play, setPlay] = useState(0); // partidas completadas del ejercicio actual
  const [phase, setPhase] = useState("intro"); // intro | playing | rest | done
  const [countdown, setCountdown] = useState(3);
  const [results, setResults] = useState([]);
  const [lastScore, setLastScore] = useState(null);
  const endGuard = useRef(false);
  const finishGuard = useRef(false);

  const drill = drills[drillIdx];
  const game = GAMES.find((g) => g.id === drill.gameId);
  const plays = drill.plays || 1;
  const playsDone = drills.slice(0, drillIdx).reduce((a, d) => a + (d.plays || 1), 0) + play;
  const GameComponent = GAME_COMPONENTS[drill.gameId];

  const isLastPlay = play + 1 >= plays;
  const nextDrill = isLastPlay ? drills[drillIdx + 1] : null;
  const nextGame = nextDrill ? GAMES.find((g) => g.id === nextDrill.gameId) : null;

  const advance = useCallback(() => {
    endGuard.current = false;
    setLastScore(null);
    if (play + 1 < plays) {
      setPlay(play + 1);
      setPhase("playing");
    } else if (drillIdx + 1 < drills.length) {
      setDrillIdx(drillIdx + 1);
      setPlay(0);
      setCountdown(3);
      setPhase("intro");
    } else {
      setPhase("done");
    }
  }, [play, plays, drillIdx, drills.length]);

  useEffect(() => {
    if (phase !== "intro" && phase !== "rest") return;
    const t = setTimeout(() => {
      if (countdown > 1) { setCountdown((c) => c - 1); return; }
      if (phase === "intro") { endGuard.current = false; setPhase("playing"); }
      else advance();
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, advance]);

  useEffect(() => {
    if (phase !== "done" || finishGuard.current) return;
    finishGuard.current = true;
    if (markOnFinish) onFinish();
  }, [phase, markOnFinish, onFinish]);

  const handleGameEnd = (score) => {
    if (endGuard.current) return;
    endGuard.current = true;
    updateHighScore(drill.gameId, score);
    setLastScore(score);
    setResults((r) => [...r, { icon: game?.icon, title: game?.title, score }]);
    setCountdown(3);
    setPhase("rest");
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="fixed left-0 right-0 z-10 px-4" style={{ top: 'max(12px, calc(env(safe-area-inset-top) + 6px))' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={onExit}
            className="bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-full px-3 py-1.5 text-xs backdrop-blur transition-colors"
          >
            ✕ Salir
          </button>
          <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-zinc-300 transition-all duration-500"
              style={{ width: `${phase === "done" ? 100 : Math.round((playsDone / totalPlays) * 100)}%` }}
            />
          </div>
          <div className="text-zinc-500 text-xs whitespace-nowrap">
            {phase === "done" ? "✓" : `${Math.min(drillIdx + 1, drills.length)}/${drills.length}`}
          </div>
        </div>
      </div>

      {phase === "intro" && (
        <SessionScreen>
          <div className="text-zinc-500 text-xs uppercase tracking-widest mb-4">
            Ejercicio {drillIdx + 1} de {drills.length}
          </div>
          <div className="text-5xl mb-4">{game?.icon}</div>
          <h2 className="text-xl font-medium text-zinc-100 mb-1">{game?.title}</h2>
          <div className="text-zinc-400 text-sm mb-1">{drill.label}{plays > 1 && ` · ${plays} partidas`}</div>
          <p className="text-zinc-500 text-sm mb-6">{drill.note}</p>
          <div className="text-zinc-500 text-xs uppercase tracking-widest">Empieza en</div>
          <div className="text-4xl font-semibold text-zinc-100 mt-1">{countdown}</div>
        </SessionScreen>
      )}

      {phase === "playing" && (
        <GameComponent
          key={`${drillIdx}-${play}`}
          autoPlay
          onScore={handleGameEnd}
          highScore={highScores[drill.gameId] || 0}
        />
      )}

      {phase === "rest" && (
        <SessionScreen>
          <div className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Ronda completada</div>
          <div className="text-5xl font-semibold text-zinc-100 mb-6">{lastScore}</div>
          <p className="text-zinc-400 text-sm mb-6">
            {!isLastPlay
              ? `Siguiente: ${game?.title} · partida ${play + 2} de ${plays}`
              : nextGame
              ? `Siguiente: ${nextGame.title} · ${nextDrill.label}`
              : "Cerrando sesión..."}
          </p>
          <div className="text-zinc-500 text-xs uppercase tracking-widest">Continúa en</div>
          <div className="text-4xl font-semibold text-zinc-100 mt-1">{countdown}</div>
        </SessionScreen>
      )}

      {phase === "done" && (
        <SessionScreen>
          <div className="text-5xl mb-4">{program.icon}</div>
          <h2 className="text-xl font-medium text-zinc-100 mb-1">Sesión completada</h2>
          <p className="text-zinc-500 text-sm mb-6">{program.name} · {program.total}</p>
          <div className="space-y-2 mb-6 text-left">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-zinc-800/40 rounded-xl p-3">
                <div className="text-lg">{r.icon}</div>
                <div className="flex-1 text-zinc-200 text-sm">{r.title}</div>
                <div className="text-zinc-100 font-medium text-sm font-mono">{r.score}</div>
              </div>
            ))}
          </div>
          {markOnFinish && (
            <div className="text-emerald-400 text-sm mb-6">✓ Registrada en tu racha</div>
          )}
          <button
            onClick={onExit}
            className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-3 px-8 rounded-full transition-colors active:scale-[0.98]"
          >
            Volver
          </button>
        </SessionScreen>
      )}
    </div>
  );
}

function SessionScreen({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ paddingTop: 'max(4rem, calc(env(safe-area-inset-top) + 3.5rem))' }}>
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 text-center max-w-md w-full">
        {children}
      </div>
    </div>
  );
}

// ============ GAME 1: COLOR MATCH ============
function ColorMatchGame({ onScore, highScore, autoPlay }) {
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
    if (!autoPlay) return;
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <GameShell title="Defensa" feedback={feedback}>
      {state === "idle" && !autoPlay && (
        <StartScreen icon="🛡️" title="Defensa"
          desc="Cada ataque pide su defensa. Encuentra el color objetivo entre las opciones — a más nivel, más opciones y más lenta la decisión (ley de Hick). Un solo fallo y estás fuera."
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
          <div className="text-center text-xs tracking-widest text-zinc-500 uppercase mb-2 mt-4">
            Responde a este ataque
          </div>
          <div className="h-28 rounded-2xl mb-6"
            style={{ backgroundColor: target.hex }} />
          <div className={`grid gap-3 ${buttons.length <= 4 ? "grid-cols-2" : buttons.length <= 6 ? "grid-cols-3" : "grid-cols-4"}`}>
            {buttons.map((c, i) => (
              <button key={`${c.hex}-${i}`} onClick={() => click(c)}
                className="aspect-square rounded-xl active:scale-95 transition-transform hover:opacity-90"
                style={{ backgroundColor: c.hex }} />
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
function GoNoGoGame({ onScore, highScore, autoPlay }) {
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

  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <GameShell title="Fintas">
      {state === "idle" && !autoPlay && (
        <StartScreen icon="🎭" title="Fintas"
          desc="Verde = golpe real, GOLPEA. Rojo = finta, NO piques. Frenar un golpe ya iniciado cuesta más que lanzarlo — eso es control inhibitorio."
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
            className="w-full aspect-square mt-6 rounded-3xl transition-colors duration-100 flex items-center justify-center active:scale-[0.98]"
            style={{
              backgroundColor: signal === "go" ? "#22c55e" : signal === "nogo" ? "#ef4444" : "#18181b",
            }}>
            <span className={`text-3xl md:text-4xl font-semibold tracking-wide ${signal ? "text-white" : "text-zinc-500"}`}>
              {signal === "go" ? "¡Golpea!" : signal === "nogo" ? "¡Finta!" : "Espera..."}
            </span>
          </button>
          {bestRT && (
            <div className="text-center mt-4 text-sm text-zinc-500">
              Mejor reacción: <span className="text-zinc-200 font-mono">{bestRT}ms</span>
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
function AimTrainerGame({ onScore, highScore, autoPlay }) {
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
    if (!autoPlay) return;
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <GameShell title="Precisión">
      {state === "idle" && !autoPlay && (
        <StartScreen icon="🎯" title="Precisión"
          desc="30 segundos. Golpea los blancos rojos: mentón, hígado, pierna. Fallar resta puntos y los blancos encogen con cada impacto — velocidad y precisión compiten (ley de Fitts)."
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
            className="relative w-full h-[400px] md:h-[500px] mt-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden cursor-crosshair">
            <div onClick={hitTarget}
              className="absolute rounded-full bg-red-500 cursor-pointer transition-transform hover:scale-105"
              style={{
                left: target.x - target.size / 2, top: target.y - target.size / 2,
                width: target.size, height: target.size,
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
function SimonGame({ onScore, highScore, autoPlay }) {
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

  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <GameShell title="Combinaciones">
      {state === "idle" && !autoPlay && (
        <StartScreen icon="🥊" title="Combinaciones"
          desc="Memoriza la combinación y repítela. Cada ronda añade un golpe, como aprender un combo nuevo: 1-2… 1-2-3… Un error y se rompe la cadena."
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
                className={`aspect-square rounded-2xl transition-all duration-100 ${
                  activePad === p.id ? "scale-95 brightness-125" : "brightness-[0.55] hover:brightness-75"
                }`}
                style={{ backgroundColor: p.color }} />
            ))}
          </div>
          <div className="text-center mt-6 text-sm text-zinc-500">
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
function ReactionTimerGame({ onScore, highScore, autoPlay }) {
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

  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(beginAttempt, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const bg = state === "waiting" ? "#7f1d1d" : state === "go" ? "#16a34a" : state === "tooEarly" ? "#78350f" : "#18181b";
  const avg = reactions.length > 0 ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : null;
  const best = reactions.length > 0 ? Math.min(...reactions) : null;

  return (
    <GameShell title="Contragolpe">
      {state === "idle" && reactions.length === 0 && !autoPlay && (
        <StartScreen icon="⚡" title="Contragolpe"
          desc={`Cuando la pantalla se ponga VERDE, golpea lo más rápido posible. Antes de tiempo = te comes el contra. ${ATTEMPTS} intentos. Promedio humano: 250ms · élite del boxeo: ~200ms.`}
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
            className="w-full aspect-square mt-6 rounded-3xl transition-colors duration-100 flex flex-col items-center justify-center active:scale-[0.98]"
            style={{ backgroundColor: bg }}>
            <span className="text-white text-2xl md:text-3xl font-semibold tracking-wide text-center px-4">
              {state === "waiting" && "Espera al verde..."}
              {state === "go" && "¡Golpea!"}
              {state === "tooEarly" && "Muy pronto · Toca para continuar"}
              {state === "result" && (
                <>
                  {currentRT ? `${currentRT}ms` : "Falló"}
                  <div className="text-base mt-2 opacity-70 font-normal">Toca para siguiente</div>
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
function OddOneOutGame({ onScore, highScore, autoPlay }) {
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
    if (!autoPlay) return;
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <GameShell title="Lectura">
      {state === "idle" && !autoPlay && (
        <StartScreen icon="👁️" title="Lectura"
          desc="Encuentra el cuadro que no encaja — como cazar el micro-gesto que delata el golpe. 30s. Aciertos = +2s. Fallos = −3s. Cada ronda las diferencias son más sutiles y la cuadrícula más amplia."
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
          <div className="grid gap-1 mt-6 mx-auto w-full"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, maxWidth: "min(100%, 48vh, 420px)" }}>
            {grid.map((c, i) => (
              <button key={i} onClick={() => click(i)}
                className="aspect-square rounded-lg active:scale-90 transition-transform"
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

const GAME_COMPONENTS = {
  reflejos: ColorMatchGame,
  semaforo: GoNoGoGame,
  apunta: AimTrainerGame,
  secuencia: SimonGame,
  reaccion: ReactionTimerGame,
  intruso: OddOneOutGame,
};

// ============ SHARED UI ============
function GameShell({ title, children, feedback }) {
  const bgFlash = feedback === "ok" ? "bg-emerald-500/5" : feedback === "bad" ? "bg-red-500/10" : "";
  return (
    <div className={`min-h-screen p-4 transition-colors duration-200 ${bgFlash}`} style={{ paddingTop: 'max(4rem, calc(env(safe-area-inset-top) + 3.5rem))' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-zinc-100 tracking-tight">
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
          className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-2 text-center">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">{it.label}</div>
          <div className={`font-semibold text-base md:text-lg ${it.highlight ? "text-amber-300" : "text-zinc-100"}`}>
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function StartScreen({ icon, title, desc, highScore, onStart }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-xl font-medium text-zinc-100 mb-3">{title}</h2>
      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{desc}</p>
      {highScore > 0 && <div className="text-amber-300/90 mb-4 text-sm">Récord: {highScore}</div>}
      <button onClick={onStart}
        className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-3 px-8 rounded-full transition-colors active:scale-[0.98]">
        Empezar
      </button>
    </div>
  );
}

function GameOverScreen({ score, isHighScore, stats = [], onRestart, customScoreLabel }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 text-center mt-6">
      <h2 className="text-lg font-medium text-zinc-400 mb-2">Fin de la partida</h2>
      {customScoreLabel && (
        <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{customScoreLabel}</div>
      )}
      <div className="text-5xl font-semibold text-zinc-100 mb-6">
        {score}
      </div>
      {stats.length > 0 && (
        <div className="grid gap-3 mb-6 text-sm" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
          {stats.map((s, i) => (
            <div key={i} className="bg-zinc-800/40 rounded-xl p-3">
              <div className="text-zinc-500 text-xs uppercase tracking-widest">{s.label}</div>
              <div className="text-zinc-100 font-medium text-xl">{s.value}</div>
            </div>
          ))}
        </div>
      )}
      {isHighScore && <div className="text-amber-300/90 text-sm mb-4">Nuevo récord</div>}
      <button onClick={onRestart}
        className="bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-3 px-8 rounded-full transition-colors active:scale-[0.98]">
        Jugar de nuevo
      </button>
    </div>
  );
}
