"use client";

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Mic,
  Music,
  MessageCircleQuestion,
  Zap,
  Code2,
  Rocket,
  ChevronRight,
  MonitorPlay,
  Brain
} from 'lucide-react';

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden selection:bg-[var(--neon-pink)] selection:text-white">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--neon-purple)]/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--neon-cyan)]/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-purple)] flex items-center justify-center glow-pink group-hover:scale-110 transition-transform duration-300">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Snap & Build</span>
        </div>
        <Link
          href="/main"
          className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 transition-all font-medium text-sm flex items-center gap-2"
        >
          Open App <ChevronRight size={16} />
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-40">
        <div className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-widest uppercase text-gray-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={14} className="text-[var(--neon-pink)]" />
            Powered by Mistral AI Codestral
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            AI가 숨을 불어넣는 <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--neon-cyan)] via-[var(--neon-purple)] to-[var(--neon-pink)]">마법의 블록 코딩</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 leading-relaxed mb-12">
            말하는 대로 코드가 짜이고, 캐릭터가 대화하며, 음악이 흐르는 세상을 만드세요.
            아이들을 위한 가장 강력하고 직관적인 AI 네이티브 창작 환경입니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/main"
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white font-bold text-lg glow-cyan hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 group"
            >
              지금 시작하기 <Zap size={20} fill="currentColor" className="group-hover:animate-bounce" />
            </Link>
            <a
              href="#logic"
              className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all"
            >
              핵심 가이드
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="logic" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-40">
          <FeatureCard
            icon={<Sparkles className="text-[var(--neon-pink)]" />}
            title="실시간 AI 매직"
            description="자연어로 원하는 기능을 설명하세요. Mistral AI가 즉시 실행 가능한 JavaScript 코드로 변환해줍니다."
            tag="AI Core"
          />
          <FeatureCard
            icon={<Mic className="text-[var(--neon-cyan)]" />}
            title="목소리를 가진 캐릭터"
            description="ElevenLabs의 고퀄리티 목소리로 캐릭터에게 개성을 부여하세요. 봇, 외계인, 영웅 등 다양한 프리셋이 준비되어 있습니다."
            tag="Audio"
          />
          <FeatureCard
            icon={<Brain className="text-[#00ff88]" />}
            title="똑똑한 학습 보조"
            description="'Explain This' 기능으로 AI가 짠 복잡한 코드를 초등학생 눈높이의 쉬운 한국어로 배워보세요."
            tag="Learning"
          />
          <FeatureCard
            icon={<Zap className="text-[#ff8800]" />}
            title="스스로 치유되는 코드"
            description="에러가 발생해도 걱정 마세요. AI가 실시간으로 원인을 파악하고 스스로 수정하여 게임이 멈추지 않게 합니다."
            tag="Stability"
          />
          <FeatureCard
            icon={<Music className="text-[var(--neon-purple)]" />}
            title="분위기 맞춤 배경음악"
            description="긴박함, 평화로움, 활기참 등 게임의 무드에 딱 맞는 배경음악을 AI가 선택해 재생해줍니다."
            tag="Music"
          />
          <FeatureCard
            icon={<MonitorPlay className="text-[#00e5ff]" />}
            title="강력한 물리 엔진"
            description="Matter.js와 p5.js가 결합된 런타임에서 중력, 충돌, 폭발 효과를 블록 하나로 구현하세요."
            tag="Engine"
          />
        </div>

        {/* Component Usage Logic Section */}
        <div className="rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 p-10 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--neon-pink)]/5 blur-[80px] rounded-full" />

          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 tracking-tight">어떻게 마법이 일어나나요?</h2>
            <div className="space-y-12">
              <UsageStep
                num="01"
                title="아이디어 구상"
                content="Blockly 인터페이스에서 'AI Magic' 블록을 꺼내고 '적들이 나타나면 도망쳐'라고 입력합니다."
              />
              <UsageStep
                num="02"
                title="AI 코드 변환"
                content="Mistral Codestral 모델이 해당 문장을 분석하여 엔티티 사이의 거리를 계산하는 p5.js 코드로 자동 생성합니다."
              />
              <UsageStep
                num="03"
                title="실시간 실행 및 시연"
                content="'Run Magic'을 누르면 샌드박스 환경에서 즉시 코드가 실행됩니다. 캐릭터가 말을 하고 BGM이 깔리며 게임이 시작됩니다."
              />
            </div>

            <div className="mt-20 pt-10 border-t border-white/5">
              <Link
                href="/main"
                className="inline-flex items-center gap-2 text-[var(--neon-cyan)] font-bold hover:underline"
              >
                빌더 바로가기 <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 text-center border-t border-white/5 bg-black/40">
        <p className="text-gray-500 text-sm">© 2026 Mistral Snap & Build. Project for Mistral Hackathon.</p>
      </footer>

      {/* Modern CSS for glowing effects */}
      <style jsx global>{`
        :root {
          --neon-cyan: #00e5ff;
          --neon-purple: #9000ff;
          --neon-pink: #ff00c8;
        }
        .glow-cyan {
          box-shadow: 0 0 25px rgba(0, 229, 255, 0.4);
        }
        .glow-pink {
          box-shadow: 0 0 20px rgba(255, 0, 200, 0.3);
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, description, tag }: { icon: React.ReactNode, title: string, description: string, tag: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 border border-white/5 px-2 py-1 rounded-lg">
          {tag}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function UsageStep({ num, title, content }: { num: string, title: string, content: string }) {
  return (
    <div className="flex gap-6">
      <span className="text-4xl font-black text-white/10 select-none">{num}</span>
      <div>
        <h4 className="text-xl font-bold mb-2 text-white/90">{title}</h4>
        <p className="text-gray-400 leading-relaxed text-sm md:text-base">{content}</p>
      </div>
    </div>
  );
}
