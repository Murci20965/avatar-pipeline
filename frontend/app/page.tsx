"use client";

import { useState, useRef, Suspense } from "react";
import { Send, Zap, Mouse, Loader2, Box, MousePointer2, MoveVertical } from "lucide-react";
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
  "I completed the safety check!",
  "Do you understand the instructions?",
  "Should I touch the exposed wire?",
  "Walk forward slowly.",
  "Run away quickly!",
  "Smash the barrier!",
  "I passed the test, let's celebrate!",
  "Have a seat and rest.",
  "Get up on your feet.",
  "Jump over the obstacle!",
  "Dodge that moving hazard!",
  "Critical system failure!",
  "Just stand by and wait."
];

export default function AvatarPipeline() {
  const[command, setCommand] = useState("");
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
    <main className="relative w-full h-screen bg-gradient-to-b from-zinc-700 to-zinc-950 overflow-hidden">
      
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [-0.8, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <Environment preset="city" />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} target={[-0.8, 0, 0]} />
          
          <Suspense fallback={<CanvasLoader />}>
            <DynamicAvatar currentAnimation={currentAnimation} />
          </Suspense>
        </Canvas>
      </div>

      {/* LEFT SIDEBAR: color and width */}
      <div className="absolute top-0 left-0 w-[300px] h-full bg-[#121214] border-r border-zinc-800/50 p-6 flex flex-col gap-6 z-10 pointer-events-auto shadow-2xl">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-1">
          <div className="text-blue-500">
            <Box size={32} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-white font-extrabold text-xl leading-none tracking-wide">Avatar-3D</h1>
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest mt-1">INTERACTION PIPELINE</p>
          </div>
        </div>

        <hr className="border-zinc-800/50 -mx-6" />

        {/* System State Box */}
        <div>
          <h2 className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-3">System State</h2>
          <div className="px-4 py-3 bg-[#101726] border border-[#1d283a] rounded-xl flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-yellow-400 animate-ping' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]'}`}></div>
            <span className="text-blue-400 font-bold text-sm tracking-wide">{currentAnimation}</span>
          </div>
        </div>

        {/* AI Logic Box */}
        <div>
          <h2 className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-3">LLAMA 3.3 LOGIC</h2>
          <div className="bg-[#15171b] border border-zinc-800/80 rounded-xl p-4 min-h-[110px] shadow-inner">
            <p className="text-zinc-400 text-[13px] leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        {/* Quick Prompts List */}
        <div className="flex-1 flex flex-col min-h-0 mt-1">
          <h2 className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap size={14} className="text-yellow-600" /> Quick Prompts
          </h2>
          <div className="flex flex-col gap-2.5 overflow-y-auto pr-2 pb-6">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => submitCommand(ex)}
                disabled={loading}
                className="text-left text-[12px] bg-[#15171b] hover:bg-[#1d2025] text-zinc-300 py-3.5 px-4 rounded-xl border border-zinc-800/80 transition-colors disabled:opacity-50 font-medium tracking-wide"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TOP RIGHT HELPERS */}
        <div className="absolute top-8 right-8 flex flex-col gap-3 z-10 pointer-events-none">
          <div className="flex items-center gap-2 text-zinc-600 text-xs font-medium bg-zinc-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-zinc-800/50 shadow-sm">
            <MousePointer2 className="w-3.5 h-3.5" />
            <span>Click & Drag to Rotate</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-600 text-xs font-medium bg-zinc-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-zinc-800/50 shadow-sm">
            <MoveVertical className="w-3.5 h-3.5" />
            <span>Scroll to Zoom</span>
          </div>
        </div>

      {/* BOTTOM CENTER: Unified Command Bar */}
      <div className="absolute bottom-8 left-[300px] right-0 flex justify-center z-10 pointer-events-none px-8">
        <div className="w-full max-w-2xl pointer-events-auto">
          <form 
            onSubmit={handleFormSubmit} 
            className="flex items-center gap-2 bg-[#09090b]/95 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-1.5 shadow-2xl w-full"
          >
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={loading}
              placeholder="Type a command to animate the 3D avatar..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-200 px-3 py-2 placeholder:text-zinc-600 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={loading || !command.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center min-w-[48px]"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

    </main>
  );
}