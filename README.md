# REACT · Reaction Training Hub

Hub de juegos para entrenar reflejos y tiempo de reacción. Listo para desplegar como PWA en iPhone.

## 🚀 Despliegue rápido (15 minutos)

### 1. Instalar y probar localmente

```bash
npm install
npm run dev
```

Abre http://localhost:5173 — debería verse la app funcionando.

### 2. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Crea un repositorio nuevo en https://github.com/new (puede ser privado), luego:

```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### 3. Desplegar en Vercel

1. Entra en https://vercel.com (login con GitHub)
2. Click en **Add New → Project**
3. Importa tu repo
4. Vercel detecta Vite automáticamente — solo dale a **Deploy**
5. Te dará una URL como `https://tu-app.vercel.app`

### 4. Instalar en iPhone como app

1. Abre la URL en **Safari** (importante: tiene que ser Safari, no Chrome)
2. Toca el botón **Compartir** (cuadrado con flecha hacia arriba)
3. Scroll hacia abajo → **"Añadir a pantalla de inicio"**
4. Nombre sugerido: **REACT**
5. Toca **Añadir**

Ahora aparece como app en tu home screen, abre a pantalla completa sin barra de navegador, y guarda tus high scores y racha localmente.

## 📁 Estructura

```
react-hub/
├── public/
│   ├── manifest.json       # Configuración PWA
│   ├── icon-192.png        # Icono PWA
│   ├── icon-512.png        # Icono PWA
│   ├── apple-touch-icon.png # Icono iOS home screen
│   └── icon.svg            # Favicon
├── src/
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # Root component
│   ├── ReactionGamesHub.jsx # Toda la lógica de juegos
│   └── index.css           # Tailwind + estilos iOS
├── index.html              # HTML con meta tags PWA
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎮 Juegos incluidos

- **🎯 Reflejos** — Empareja el color (sudden death, 30s)
- **🚦 Semáforo** — Go/No-Go training
- **🔴 Apunta** — Aim trainer
- **🧠 Secuencia** — Simon Says
- **⚡ Reacción Pura** — Mide tu tiempo de reacción
- **👁️ Intruso** — Encuentra el color diferente

## 📅 Plan de entrenamiento

Programa semanal de 7 días con calentamiento pre-match, racha, heatmap de 14 días y tracking persistente.

## 🔧 Personalización

Para cambiar colores, dificultad, drills del programa, etc., edita `src/ReactionGamesHub.jsx`. Las constantes principales están al inicio del archivo:

- `COLORS` — paleta de colores
- `GAMES` — metadata de cada juego
- `TRAINING_PROGRAM` — drills por día
- `QUICK_WARMUP` — rutina pre-match

## 🐛 Notas

- Los datos se guardan en `localStorage` (solo en tu dispositivo)
- Para borrar progreso: ajustes de Safari → Borrar historial y datos web
- Para actualizar la app después de subir cambios: cierra y reabre la PWA del home screen

## 🏆 Road to EVO France 2026

¡A entrenar!
