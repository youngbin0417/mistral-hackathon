"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Mic,
  Music,
  Code2,
  SquareTerminal,
  Cpu,
  ShieldCheck,
  Globe,
  ChevronRight,
  Sparkles,
  MonitorPlay
} from 'lucide-react';

export default function IntroPage() {
  const [mounted, setMounted] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  useEffect(() => {
    setMounted(true);
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';

    const interval = setInterval(() => setCursorBlink(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#000000]" />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#F3ECE5] font-sans scroll-smooth overflow-x-hidden selection:bg-[#FD5A1E] selection:text-white">
      {/* CLI Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{ backgroundImage: 'linear-gradient(#F3ECE5 1px, transparent 1px), linear-gradient(90deg, #F3ECE5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto backdrop-blur-md bg-[#000000]/80 border-b border-[#F3ECE5]/10">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 flex items-center justify-center text-[#FD5A1E]">
            <Terminal className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold tracking-tight text-[#F3ECE5]">snap_build</span>
          </div>
        </Link>
        <div className="flex items-center gap-6 text-sm font-mono text-[#F3ECE5]/60">
          <a href="#features" className="hover:text-[#FD5A1E] transition-colors">[ features ]</a>
          <a href="#how-it-works" className="hover:text-[#FD5A1E] transition-colors">[ workflow ]</a>
          <Link
            href="/main"
            className="px-4 py-2 border border-[#FD5A1E] text-[#FD5A1E] hover:bg-[#FD5A1E] hover:text-[#000000] transition-all font-bold tracking-wide"
          >
            &gt; open_app
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-40">
        {/* CLI Hero Section */}
        <section className="max-w-5xl mx-auto px-8 text-left mb-32">
          <div className="font-mono text-[#FD5A1E] mb-6 flex items-center gap-2">
            <span className="text-sm">system@mistral:~$ ./run_snap_build.sh</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-medium mb-8 tracking-tight leading-[1]">
            Code as Fast <br />
            <span className="text-gray-500 italic">as You Imagine</span><span className={`text-[#FD5A1E] ${cursorBlink ? 'opacity-100' : 'opacity-0'}`}>_</span>
          </h1>

          <p className="max-w-2xl text-lg font-mono text-[#F3ECE5]/70 leading-relaxed mb-12">
            The world's first AI-native block coding platform powered by <span className="text-white font-bold">Mistral.</span><br />
            Speak, drag, and transform your imagination into real-time interactive games.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/main"
              className="px-8 py-4 bg-[#FD5A1E] text-black font-bold font-mono text-lg hover:bg-[#FF733D] transition-colors flex items-center gap-3"
            >
              &gt; start_building <ChevronRight size={20} />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 border border-[#F3ECE5]/20 text-[#F3ECE5] font-mono font-bold text-lg hover:bg-[#F3ECE5]/10 transition-colors"
            >
              explore_docs
            </a>
          </div>

          {/* Terminal Mockup */}
          <div className="mt-24 border border-[#F3ECE5]/20 bg-[#0A0A0A] p-1 font-mono text-sm relative">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#F3ECE5]/20 mb-4 bg-[#111111]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-[#F3ECE5]/40 text-xs">mistral-codestral-latest</div>
              <div className="w-12" /> {/* Spacer */}
            </div>

            <div className="p-4 space-y-4 text-[#F3ECE5]/80">
              <p><span className="text-green-400">?</span> <span className="font-bold whitespace-pre">Enter prompt: </span>  Create a hero that shoots sparkles.</p>
              <p className="text-[#FD5A1E]">&gt;&gt; [Codestral] Analyzing intent...</p>
              <div className="pl-4 border-l-2 border-[#FD5A1E]/30 text-gray-400">
                <p>Generating Matter.js physics entities.</p>
                <p>Binding p5.js draw loop.</p>
                <p>Injecting active particle constraints.</p>
              </div>
              <p className="text-green-400">&gt;&gt; Success! Code mapped to visual blocks.</p>
              <p className="flex items-center gap-1"><span className="text-blue-400">info</span> Running live engine... <span className={`inline-block w-2 h-4 bg-[#F3ECE5] ${cursorBlink ? 'opacity-100' : 'opacity-0'}`} /></p>
            </div>
          </div>
        </section>

        {/* Features Minimalist Grid */}
        <section id="features" className="max-w-6xl mx-auto px-8 py-32 border-t border-[#F3ECE5]/10">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-medium mb-4">/features</h2>
            <p className="text-[#F3ECE5]/50 font-mono">Capabilities of the Next-Gen Creator Engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<Cpu className="text-[#FD5A1E]" strokeWidth={1.5} />}
              title="Real-time AI Magic"
              description="Type anything in plain English. Mistral Codestral turns your prompts into high-performance p5.js code instantly."
            />
            <FeatureCard
              icon={<Mic className="text-[#F3ECE5]" strokeWidth={1.5} />}
              title="Living Characters"
              description="Characters gain personality with ElevenLabs TTS. Choose from hero, villain, robot, or alien presets."
            />
            <FeatureCard
              icon={<SquareTerminal className="text-[#F3ECE5]" strokeWidth={1.5} />}
              title="Explain Like I'm 5"
              description="Complex code simplified. Our AI mentor explains how every line works in friendly, easy-to-understand language."
            />
            <FeatureCard
              icon={<ShieldCheck className="text-[#FD5A1E]" strokeWidth={1.5} />}
              title="Auto-Healing Core"
              description="Bugs are fixed before you notice. Our self-healing engine detects runtime errors and patches logic in milliseconds."
            />
            <FeatureCard
              icon={<Music className="text-[#F3ECE5]" strokeWidth={1.5} />}
              title="Cinematic Atmosphere"
              description="Audio that reacts to your game. Dynamic BGM selections match your game mood automatically."
            />
            <FeatureCard
              icon={<MonitorPlay className="text-[#F3ECE5]" strokeWidth={1.5} />}
              title="Matter.js Engine"
              description="Professional-grade physics. Gravity, collisions, and particle effects are just one block away."
            />
          </div>
        </section>

        {/* Workflow CLI Style */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-8 py-32 border-t border-[#F3ECE5]/10">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-medium mb-4">/workflow</h2>
            <p className="text-[#F3ECE5]/50 font-mono">From idea to execution in three steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UsageStep
              num="01"
              title="Imagine & Speak"
              content="Drop an 'AI Magic' block and type your prompt. No syntax, just your voice."
            />
            <UsageStep
              num="02"
              title="Mistral Processing"
              content="Codestral analyzes the intent and injects industry-standard physics in seconds."
            />
            <UsageStep
              num="03"
              title="Live Sandbox"
              content="Watch it run instantly. Adjust, remix, and expand your world in real-time."
            />
          </div>

          <div className="mt-20 flex justify-end">
            <a
              href="#"
              className="text-[#F3ECE5]/50 hover:text-[#FD5A1E] transition-colors font-mono text-sm flex items-center gap-2"
            >
              [ back_to_top ] <ChevronRight size={14} className="-rotate-90" />
            </a>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-8 py-40 text-center">
          <Terminal className="w-16 h-16 mx-auto text-[#FD5A1E] mb-8 opacity-80" />
          <h2 className="text-4xl md:text-6xl font-medium mb-8">Ready to compile?</h2>
          <Link
            href="/main"
            className="inline-block px-12 py-5 bg-[#F3ECE5] text-black font-mono font-bold text-xl hover:bg-[#FD5A1E] hover:text-white transition-all shadow-lg"
          >
            &gt; launch_builder
          </Link>
          <p className="mt-12 text-[#F3ECE5]/40 font-mono text-xs flex items-center justify-center gap-4">
            <Globe size={14} /> Available Worldwide | Multi-Model Support
          </p>
        </section>
      </main>

      <footer className="py-12 border-t border-[#F3ECE5]/10 font-mono text-sm">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[#F3ECE5]/40">
          <div className="flex items-center gap-2 text-[#F3ECE5]">
            <Terminal size={16} className="text-[#FD5A1E]" />
            <span className="font-bold">snap_build</span>
          </div>
          <p>© 2026 Powered by Mistral AI. Hackathon Project.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#FD5A1E] transition-colors">[ src ]</a>
            <a href="#" className="hover:text-[#FD5A1E] transition-colors">[ docs ]</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 border border-[#F3ECE5]/10 bg-[#0A0A0A] hover:border-[#FD5A1E]/50 transition-colors group">
      <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 font-mono">{title}</h3>
      <p className="text-[#F3ECE5]/60 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function UsageStep({ num, title, content }: { num: string, title: string, content: string }) {
  return (
    <div className="p-8 border border-[#F3ECE5]/10 bg-[#0A0A0A] relative hover:bg-[#111111] transition-colors">
      <div className="text-[#FD5A1E] font-mono text-sm mb-6 border-b border-[#FD5A1E]/20 pb-2 inline-block">
        Step_{num}
      </div>
      <h4 className="text-xl font-bold mb-3 font-mono text-[#F3ECE5]">{title}</h4>
      <p className="text-[#F3ECE5]/60 leading-relaxed text-sm">{content}</p>
    </div>
  );
}
