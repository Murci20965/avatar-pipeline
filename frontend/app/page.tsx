"use client";

import { useState, useRef, Suspense } from "react";
import { Send, Zap, Mouse, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useProgress } from "@react-three/drei";

const DynamicAvatar = dynamic(
  () => import("../components/AvatarScene").then((mod) => mod.AvatarScene),
  { ssr: false }
);

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 w-48">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <div className="text-zinc-400 font-mono text-sm tracking-widest">
          LOADING STAGE {progress.toFixed(0)}%
        </div>
      </div>
    </Html>
  );
}

const EXAMPLES =[
  "Wave hello to the class!",
  "I passed the safety test!",
  "Critical system failure!",
  "Should I touch the exposed wire?",
  "Have a seat and rest."
];

export default function AvatarPipeline() {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const[currentAnimation, setCurrentAnimation] = useState("Idle");
  const [explanation, setExplanation] = useState("Awaiting your command...");
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;

    setLoading(true);
    setExplanation("Thinking...");
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/animate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmdText }),
      });

      if (!response.ok) throw new Error("Network response failed");

      const data = await response.json();
      setCurrentAnimation(data.animation);
      setExplanation(data.explanation);
      setCommand("");

      timerRef.current = setTimeout(() => {
        setCurrentAnimation("Idle");
        setExplanation("Action completed. Standing by for next command.");
      }, 5000);

    } catch (error) {
      console.error("API Error:", error);
      setExplanation("Connection error. Is the Docker backend running?");
      setCurrentAnimation("Idle");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCommand(command);
  };

  return (
    <main className="relative w-full h-screen bg-gradient-to-b from-zinc-600 to-zinc-950 overflow-hidden">
      
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position:[-0.8, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <Environment preset="city" />
          
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} target={[-0.8, 0, 0]} />
          
          <Suspense fallback={<CanvasLoader />}>
            <DynamicAvatar currentAnimation={currentAnimation} />
          </Suspense>
        </Canvas>
      </div>

      {/* FULL HEIGHT LEFT SIDEBAR: The Transparent Glass Panel */}
      <div className="absolute top-0 left-0 w-80 h-full bg-zinc-950/30 backdrop-blur-md border-r border-zinc-800/50 p-6 pt-12 flex flex-col gap-8 z-10 pointer-events-auto overflow-y-auto shadow-2xl">
        
        <div>
          <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">System State</h2>
          <div className="px-4 py-2 bg-blue-500/10 text-blue-400 font-mono text-sm rounded-lg border border-blue-500/30 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-ping' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`}></div>
            {currentAnimation}
          </div>
        </div>

        <div>
          <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">AI Logic</h2>
          <p className="text-zinc-200 text-sm leading-relaxed font-light">
            {explanation}
          </p>
        </div>

        <hr className="border-zinc-800/50" />

        <div>
          <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1">
            <Zap size={14} className="text-yellow-500" /> Quick Commands
          </h2>
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => submitCommand(ex)}
                disabled={loading}
                className="text-left text-xs bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-300 py-3 px-4 rounded-xl border border-zinc-700/30 transition-all disabled:opacity-50 hover:border-zinc-600/50 hover:shadow-lg"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT: Interaction Guide */}
      <div className="absolute bottom-8 right-8 z-10 pointer-events-none flex flex-col items-end gap-2 text-xs text-zinc-400 opacity-60">
        <div className="flex items-center gap-2 bg-zinc-950/30 backdrop-blur-sm px-3 py-2 rounded-full border border-zinc-800/30">
          <Mouse size={14} />
          <span>Click & Drag to Rotate</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950/30 backdrop-blur-sm px-3 py-2 rounded-full border border-zinc-800/30">
          <span className="font-mono text-[14px] leading-none">↕</span>
          <span>Scroll to Zoom</span>
        </div>
      </div>

      {/* BOTTOM OFFSET CENTER: Input Form */}
      <div className="absolute bottom-8 left-[calc(50%+4rem)] -translate-x-1/2 w-full max-w-2xl px-4 z-10 pointer-events-none">
        <form onSubmit={handleFormSubmit} className="bg-zinc-950/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-2 shadow-2xl flex gap-2 w-full pointer-events-auto">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type a custom scenario..."
              className="flex-1 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-500 border border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !command.trim()}
              className="bg-blue-600/90 hover:bg-blue-500 disabled:bg-zinc-800/50 disabled:text-zinc-600 text-white p-3 rounded-xl transition-all flex items-center justify-center min-w-[52px] backdrop-blur-sm border border-blue-500/50 disabled:border-transparent"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

    </main>
  );
}