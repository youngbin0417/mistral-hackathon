# Mistral Snap & Build 🚀

Mistral Snap & Build는 아이들이 자연어로 코딩하고, Mistral AI(Codestral)가 이를 실시간으로 Javascript 코드로 변환해주는 AI 네이티브 블록 코딩 플랫폼입니다.

## 🌟 Key Features
- **Magic Block**: 자연어 프롬프트를 입력하면 AI가 실시간으로 p5.js 또는 Matter.js 코드를 생성합니다.
- **Self-Healing**: 런타임 에러가 발생하면 AI가 자동으로 원인을 파악하고 코드를 수정합니다.
- **AI-Native Monitoring (Grafana/Loki)**: 모든 AI 생성 과정과 런타임 이벤트를 Grafana 대시보드에서 실시간으로 분석합니다.
- **Community Magics (Redis)**: Redis 캐싱을 통해 AI 응답 속도를 높이고, 다른 사용자가 만든 코드를 실시간으로 공유합니다.

## 🛠️ Getting Started

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (모니터링 및 캐시 스택용)
- Node.js 18+
- Mistral API Key (`.env` 파일에 설정)

### 2. Environment Setup
`.env` 파일을 루트에 생성하고 아래 내용을 입력하세요:
```env
MISTRAL_API_KEY=your_api_key_here
```

### 3. Running the Infrastructure (Redis, Grafana, Loki)
애플리케이션의 풀 기능을 사용하려면 Docker를 통해 인프라를 먼저 실행해야 합니다:
```bash
cd observability
docker compose up -d
```
- **Grafana**: `http://localhost:3000` (ID: admin / PW: admin)
- **Loki**: 로그 수집기 (Promtail 연동)
- **Redis**: 캐시 및 최근 기록 저장소 (`localhost:6379`)

### 4. Running the Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start coding!

## 🧪 Testing
```bash
npm test          # 단위 및 통합 테스트 실행
npm run test:watch # 라이브 테스트 모드
```
현재 코드 변환 로직(codeTransform)에 대한 100% 테스트 커버리지를 유지하고 있습니다.

## 📂 Project Structure
- `/src/app/api`: AI 생성, 수정, 최근 기록 API
- `/src/lib`: AI 마커 파싱, import 주입 등 핵심 로직 (테스트 완료)
- `/observability`: Grafana, Loki, Promtail, Redis 설정 파일
- `/logs`: 애플리케이션 구조화된 로그(JSON) 저장소
