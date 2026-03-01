# Mistral Snap & Build 🚀

**Mistral Snap & Build** is an AI-native block coding platform where kids can code using natural language. Powered by Mistral AI (Codestral), characters can talk, interact, and even explain their own logic in simple Korean.

## 🌟 Key Features

- **✨ AI Magic Blocks**: Use natural language to generate p5.js, Matter.js, or complex game logic in real-time.
- **🎙️ AI Voice (TTS)**: Bring your characters to life with 4 unique ElevenLabs voices (Adam, Antoni, Josh, Sam).
- **💬 Dialogue Scene**: Create seamless 2-person conversations between game entities with just one block.
- **🎵 Magic BGM**: Set the mood with background music (Tense, Peaceful, Exciting, Mysterious) that reacts to your game's vibe.
- **🤔 Explain This**: Ask the AI to explain the game's code in simple, friendly Korean—perfect for young learners.
- **🔧 Self-Healing**: Powered by AI, the platform automatically detects and fixes runtime errors, letting you focus on creating.
- **🕹️ Targeted Entity Control**: Move, turn, or apply physics to specific entities (Hero, Enemy) directly using blocks.
- **💥 Event-Driven Interaction**: React to game events like `Player takes damage`, `Enemy is defeated`, or `Game starts`.

## 🛠️ Getting Started

### 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Optional, for monitoring and caching)
- Node.js 18+
- Mistral API Key
- ElevenLabs API Key (for speech features)

### 2. Environment Setup

Create a `.env` file in the root directory and add the following:

```env
# Mistral AI API Key - https://console.mistral.ai/
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_API_URL=https://api.mistral.ai

# ElevenLabs API Key - https://elevenlabs.io/
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_API_URL=https://api.elevenlabs.io/v1

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Log Level
LOG_LEVEL=info
```

### 3. Running the Infrastructure (Optional: Redis, Grafana, Loki)

To enable advanced feature caching and observability, start the infrastructure:

```bash
cd observability
docker compose up -d
```

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | `http://localhost:3000` | admin / admin |
| Redis | `localhost:6379` | Cache & recent history storage |

### 4. Running the Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building!

## 🧪 Testing

The core transformation logic and custom blocks are fully tested with Jest.

```bash
npm test          # Run all unit and integration tests
```

## 📂 Project Structure

```
hack/
├── src/
│   ├── app/api/       # AI (generate, heal, explain), Audio (sfx, speak) APIs
│   ├── lib/           # Core logic (Blockly runtime, code transformation)
│   └── components/    # Blockly workspace, UI overlays, and and modals
├── observability/     # Grafana/Loki/Redis configuration
├── __tests__/         # Comprehensive test suites (lib, hooks, api)
└── public/audio/      # BGM and SFX assets
```

## 🏗️ AI Workflow Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Next.js API │────▶│ Mistral AI  │
│  (Blockly)  │◀────│   Handlers   │◀────│ (Codestral) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ ElevenLabs  │◀────│   Loki/Redis │     │  Sandpack   │
│   (Voice)   │     │ (Cache/Logs) │     │ (Execution) │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 📋 Technology Stack

- **Core**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **AI**: Mistral AI (Codestral, Mistral-Large), ElevenLabs TTS
- **Logic**: Blockly (Visual Coding), Sandpack (Real-time Browser Execution)
- **Engines**: p5.js (Creative Coding), Matter.js (Physics), GSAP (Animation)
- **Infrastructure**: Redis (Cache), Grafana & Loki (Observability)
- **Quality**: Jest (Testing)

---

**Built with ❤️ for the next generation of creators at Mistral Hackathon.**
