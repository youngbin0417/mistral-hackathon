# Mistral Snap & Build 🚀

**Mistral Snap & Build** is an AI-native block coding platform designed for the next generation of creators. Powered by Mistral AI (Codestral), it enables children to build complex interactive worlds using natural language. Watch characters talk, interact, and explain their own logic in simple, friendly English.

## 🌟 Key Features

- **✨ AI Magic Blocks**: Describe your ideas in plain English to generate p5.js or Matter.js logic instantly.
- **🎙️ AI Voice (TTS)**: Bring characters to life with 4 unique ElevenLabs voices (Adam, Antoni, Josh, Sam).
- **💬 Dialogue Scene**: Create seamless 2-person conversations between game entities with a single block.
- **🎵 Magic BGM**: Set the mood with background music (Tense, Peaceful, Exciting, Mysterious) that reacts to game states.
- **🤔 AI Mentor**: Ask the AI to explain complex code in simple, friendly English—perfect for young learners.
- **🔧 Self-Healing Core**: AI automatically detects and fixes runtime errors in real-time, ensuring a smooth creative flow.
- **🕹️ Targeted Control**: Move, turn, or apply physics to specific entities (Hero, Enemy) directly using visual blocks.
- **💥 Event-Driven Interaction**: Easily react to events like `Player takes damage`, `Enemy is defeated`, or `Game starts`.

## 🛠️ Getting Started

### 1. Prerequisites

- Node.js 18+
- Mistral API Key (Codestral & Mistral-Large)
- ElevenLabs API Key (for speech & SFX features)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Optional: for Redis cache & Grafana observability)

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your keys:

```env
# Mistral AI API - https://console.mistral.ai/
MISTRAL_API_KEY=your_mistral_api_key_here

# ElevenLabs API - https://elevenlabs.io/
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Infrastructure (Optional)
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

### 3. Infrastructure & Observability (Optional)

To enable advanced caching and the Grafana/Loki monitoring stack:

```bash
cd observability
docker compose up -d
```

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | `http://localhost:3000` | admin / admin |
| **Redis** | `localhost:6379` | Cache & Recent History |

### 4. Installation & Launch

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to enter the world of AI-powered creation.

## 🧪 Testing & Quality

We maintain high stability through comprehensive unit and integration tests.

```bash
npm test          # Run all tests (API, Hooks, Libraries)
```

## 📂 Architecture & Workflow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Next.js API │────▶│ Mistral AI  │
│  (Blockly)  │◀────│ (App Router) │◀────│ (Codestral) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ ElevenLabs  │◀────│   Postgres/  │     │  Sandpack   │
│   (Voice)   │     │ Redis/Loki   │     │ (Real-time) │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 📋 Technology Stack

- **Framework**: Next.js 15, TypeScript, Tailwind CSS
- **AI Models**: Mistral AI (Codestral-Latest, Mistral-Large-Latest), ElevenLabs (Multilingual v2)
- **Visuals**: Blockly (Visual UI), p5.js (2D Canvas), Matter.js (Physics Engine)
- **Tooling**: Sandpack (Browser IDE), GSAP (Animations), Lucide React (Icons)
- **Backend/Ops**: Redis (Cache), Grafana & Loki (Observability), Winston/Pino (Logging)

---

**Built with ❤️ for the global community of young coders at the Mistral AI Hackathon.**
