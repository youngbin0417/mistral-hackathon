"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, Mic, Music, MessageCircleQuestion, Zap, Code2, Rocket, ChevronRight, MonitorPlay, Brain, ShieldCheck, Globe } from 'lucide-react';

export default function IntroPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Force allow scrolling on the landing page in case other components locked it
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';

    return () => {
      // Re-apply original lock if exiting (optional, let the main page handle it)
    };
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#050508]" />;
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-[var(--neon-pink)] selection:text-white font-sans scroll-smooth overflow-y-auto">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--neon-purple)]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--neon-cyan)]/5 blur-[150px] rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cyber-dust.png')] opacity-[0.03]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 max-w-7xl mx-auto backdrop-blur-xl bg-[#050508]/60 border-b border-white/5 shadow-2xl transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-purple)] flex items-center justify-center shadow-[0_0_20px_rgba(255,0,200,0.3)] group-hover:scale-110 transition-all duration-500">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-black tracking-tighter block leading-none">SNAP & BUILD</span>
          </div>
        </Link>
        <div className="flex items-center gap-4 md:gap-8 text-xs md:text-sm font-bold text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
          <Link
            href="/main"
            className="px-4 py-2 rounded-lg bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)] hover:text-black transition-all font-black text-[10px] uppercase tracking-widest"
          >
            Open App
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-10 animate-fade-in">
            <Sparkles size={14} className="text-[var(--neon-pink)] animate-pulse" />
            Powered by Mistral AI Codestral
          </div>

          <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-600">
            Code as Fast <br />
            <span className="text-[var(--neon-cyan)] text-shadow-bolt">as You Imagine</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 leading-relaxed mb-14 font-medium">
            The world's first AI-native block coding platform where children bring stories to life.
            Speak, drag, and watch Mistral AI transform your imagination into real-time interactive games.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/main"
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white font-black text-xl shadow-[0_0_50px_rgba(0,229,255,0.3)] hover:shadow-[0_0_70px_rgba(0,229,255,0.5)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 group"
            >
              Start Building Now <Zap size={22} fill="currentColor" className="group-hover:animate-bounce" />
            </Link>
            <a
              href="#features"
              className="px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 transition-all backdrop-blur-md"
            >
              Explore Features
            </a>
          </div>

          {/* Decorative Mockup */}
          <div className="mt-32 relative max-w-5xl mx-auto group animate-float-slow">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-cyan)]/20 to-[var(--neon-pink)]/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative rounded-[2.5rem] border border-white/10 bg-[#0a0a12] p-4 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 h-5 w-40 bg-white/5 rounded-full" />
              </div>
              <div className="grid grid-cols-12 gap-4 h-[400px]">
                <div className="col-span-4 bg-white/[0.02] rounded-2xl border border-white/5 p-4 space-y-3">
                  <div className="h-8 w-full bg-[var(--neon-pink)]/20 rounded-lg border border-[var(--neon-pink)]/30" />
                  <div className="h-8 w-3/4 bg-[var(--neon-purple)]/20 rounded-lg border border-[var(--neon-purple)]/30" />
                  <div className="h-8 w-full bg-[var(--neon-cyan)]/20 rounded-lg border border-[var(--neon-cyan)]/30" />
                </div>
                <div className="col-span-8 bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1)_0%,transparent_70%)]" />
                  <Sparkles className="w-20 h-20 text-[var(--neon-cyan)]/20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-8 py-40">
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Superpowers for Next-Gen Creators</h2>
            <p className="text-gray-400 text-lg max-w-2xl">Everything you need to build, play, and learn with industry-leading AI models.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="text-[var(--neon-pink)]" />}
              title="Real-time AI Magic"
              description="Type anything in plain English. Mistral Codestral turns your prompts into high-performance p5.js code instantly."
              tag="Mistral AI"
            />
            <FeatureCard
              icon={<Mic className="text-[var(--neon-cyan)]" />}
              title="Living Characters"
              description="Characters gain personality with ElevenLabs TTS. Choose from hero, villain, robot, or alien presets."
              tag="Voice"
            />
            <FeatureCard
              icon={<Brain className="text-[#00ff88]" />}
              title="Explain Like I'm 5"
              description="Complex code simplified. Our AI mentor explains how every line works in friendly, easy-to-understand language."
              tag="EdTech"
            />
            <FeatureCard
              icon={<ShieldCheck className="text-[#ff8800]" />}
              title="Auto-Healing Core"
              description="Bugs are fixed before you notice. Our self-healing engine detects runtime errors and patches logic in milliseconds."
              tag="Stability"
            />
            <FeatureCard
              icon={<Music className="text-[var(--neon-purple)]" />}
              title="Cinematic Atmosphere"
              description="Audio that reacts to your game. Dynamic BGM selections match your game mood automatically."
              tag="Audio"
            />
            <FeatureCard
              icon={<MonitorPlay className="text-[#00e5ff]" />}
              title="Matter.js Engine"
              description="Professional-grade physics. Gravity, collisions, and particle effects are just one block away."
              tag="Engine"
            />
          </div>
        </section>

        {/* Workflow Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-8 py-40">
          <div className="p-12 md:p-24 rounded-[3.5rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--neon-purple)]/10 blur-[120px] rounded-full" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5">
                <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tight leading-none uppercase">The Magic <br />Workflow</h2>
                <p className="text-gray-400 text-lg mb-12">Building a game shouldn't be hard. We've condensed months of learning into a 3-step magic process.</p>
                <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap items-center gap-8">
                  <Link
                    href="/main"
                    className="px-8 py-3 rounded-xl bg-[var(--neon-cyan)] text-black font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
                  >
                    Go to Builder <Rocket size={14} className="inline ml-2" />
                  </Link>
                  <a
                    href="#"
                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 group"
                  >
                    <ChevronRight size={14} className="-rotate-90 group-hover:-translate-y-1 transition-transform" /> Back to Top
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-12">
                <UsageStep
                  num="01"
                  color="var(--neon-pink)"
                  title="Imagine & Speak"
                  content="Drop an 'AI Magic' block and type: 'Make a hero that shoots sparkles when clicked'. No syntax, just your voice."
                />
                <UsageStep
                  num="02"
                  color="var(--neon-purple)"
                  title="Mistral Processing"
                  content="Codestral analyzes the intent, maps the logic to p5.js, and injects industry-standard physics in seconds."
                />
                <UsageStep
                  num="03"
                  color="var(--neon-cyan)"
                  title="Live Sandbox"
                  content="Watch it run instantly. Adjust, remix, and expand your world with characters that talk and react in real-time."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-8 py-60 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,0,200,0.05)_0%,transparent_60%)] -z-10" />
          <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter">Ready to Build Your Universe?</h2>
          <Link
            href="/main"
            className="px-16 py-6 rounded-3xl bg-white text-black font-black text-2xl hover:bg-[var(--neon-cyan)] hover:text-white transition-all hover:scale-110 active:scale-95 shadow-xl"
          >
            Launch Builder
          </Link>
          <p className="mt-12 text-gray-500 font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-4">
            <Globe size={14} /> Available Worldwide • Multi-Model Support
          </p>
        </section>
      </main>

      <footer className="py-20 px-8 border-t border-white/5 bg-black/60 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Rocket size={18} className="text-[var(--neon-pink)]" />
            <span className="font-bold text-lg">Snap & Build</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">© 2026 Mistral Snap & Build. A Next-Gen Creative Project for Mistral Hackathon.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Code2 size={20} /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Sparkles size={20} /></a>
          </div>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, title, description, tag }: { icon: React.ReactNode, title: string, description: string, tag: string }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-white/30 hover:bg-white/[0.05] transition-all duration-700 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1 h-16 bg-gradient-to-b from-[var(--neon-cyan)] to-transparent blur-[2px]" />
      </div>
      <div className="mb-8 relative flex items-center justify-between">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/[0.1] transition-all duration-500">
          {icon}
        </div>
        <span className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-500 border border-white/10 px-3 py-1.5 rounded-full">
          {tag}
        </span>
      </div>
      <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function UsageStep({ num, title, content, color }: { num: string, title: string, content: string, color: string }) {
  return (
    <div className="flex gap-10 group">
      <div className="flex flex-col items-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-4 transition-all duration-500 group-hover:scale-110 shadow-xl"
          style={{ backgroundColor: `${color}15`, border: `2px solid ${color}30`, color: color }}
        >
          {num}
        </div>
        <div className="flex-1 w-0.5 bg-gradient-to-b from-white/10 to-transparent mb-4" />
      </div>
      <div>
        <h4 className="text-2xl font-black mb-3 text-white transition-colors group-hover:translate-x-1 duration-500 uppercase tracking-tight">{title}</h4>
        <p className="text-gray-400 leading-relaxed font-medium max-w-lg">{content}</p>
      </div>
    </div>
  );
}
