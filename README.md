# Mistral Snap & Build 🚀

**Mistral Snap & Build** is an AI-native block coding platform where kids can code using natural language, and Mistral AI (Codestral) transforms their prompts into real-time JavaScript code.

## 🌟 Key Features

- **✨ Magic Block**: Enter natural language prompts and watch AI generate p5.js or Matter.js code in real-time.
- **🔧 Self-Healing**: When runtime errors occur, AI automatically detects the cause and fixes the code.
- **📊 AI-Native Monitoring (Grafana/Loki)**: Analyze all AI generation processes and runtime events in real-time through Grafana dashboards.
- **🚀 Community Magics (Redis)**: Redis caching accelerates AI response times and enables real-time sharing of user-created code.

## 🛠️ Getting Started

### 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for monitoring and cache stack)
- Node.js 18+
- Mistral API Key (configured in `.env` file)

### 2. Environment Setup

Create a `.env` file in the root directory and add the following:

```env
MISTRAL_API_KEY=your_api_key_here
```

### 3. Running the Infrastructure (Redis, Grafana, Loki)

To use the full features of the application, start the infrastructure via Docker first:

```bash
cd observability
docker compose up -d
```

**Services:**
| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | `http://localhost:3000` | admin / admin |
| Loki | - | Log collector (Promtail integration) |
| Redis | `localhost:6379` | Cache & recent history storage |

### 4. Running the Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start coding!

## 🧪 Testing

```bash
npm test          # Run unit and integration tests
npm run test:watch # Live test mode
```

The project maintains 100% test coverage for core code transformation logic (`codeTransform`).

## 📂 Project Structure

```
hack/
├── src/
│   ├── app/api/       # AI generation, modification, and recent history APIs
│   └── lib/           # Core logic (AI marker parsing, import injection) - fully tested
├── observability/     # Grafana, Loki, Promtail, Redis configuration files
├── logs/              # Structured application logs (JSON format)
└── __tests__/         # Test suites
```

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Next.js API │────▶│ Mistral AI  │
│  (Blocks)   │◀────│   Handlers   │◀────│  (Codestral)│
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Grafana   │◀────│    Loki      │     │   Redis     │
│ Dashboard   │     │   (Logs)     │     │   (Cache)   │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 📋 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React, TypeScript, Tailwind CSS |
| **AI** | Mistral AI (Codestral) |
| **Monitoring** | Grafana, Loki, Promtail |
| **Caching** | Redis |
| **Testing** | Jest, React Testing Library |
| **Code Generation** | p5.js, Matter.js |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues and questions, please open an issue on the [GitHub Issues](https://github.com/your-org/hack/issues) page.

---

**Built with ❤️ for young coders everywhere**
