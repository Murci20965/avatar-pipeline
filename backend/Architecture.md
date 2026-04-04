# **Avatar-Pipeline: Technical Architecture & Design**

This document serves as the technical blueprint for the **Avatar-Pipeline** prototype, outlining the system design, AI logic, engineering challenges, and roadmap for enterprise scaling within NexEra's training modules.

## **1\. System Architecture & AI Logic**

The pipeline follows a decoupled **"Director & Marionette"** architecture. Instead of generating 3D files dynamically (which is currently too slow for real-time interaction), the system uses an AI "Director" to rigidly control a pre-rigged WebGL "Marionette."

mermaid  
\`\`\`  
graph TD  
    %% Global Styles  
    classDef user fill:\#f9f9f9,stroke:\#333,stroke-width:2px;  
    classDef frontend fill:\#e1f5fe,stroke:\#01579b,stroke-width:2px;  
    classDef backend fill:\#e8f5e9,stroke:\#2e7d32,stroke-width:2px;  
    classDef external fill:\#fff3e0,stroke:\#ef6c00,stroke-width:2px,stroke-dasharray: 5 5;

    %% Nodes  
    Learner((Learner)):::user  
      
    subgraph "Frontend: Avatar-UI (Next.js 16.2)"  
        UI\[Tailwind Interface\]:::frontend  
        Store\[React State / Animation Hooks\]:::frontend  
        Canvas\["WebGL Canvas \<br/\> (R3F / Drei)"\]:::frontend  
        Model\["RobotExpressive.glb \<br/\> (14 Baked Tracks)"\]:::frontend  
    end

    subgraph "Backend: Avatar-Director (Docker / FastAPI)"  
        API\[FastAPI Endpoint: /animate\]:::backend  
        Validator\[Pydantic Schema Validation\]:::backend  
        Prompt\[System Instruction: Classification Mode\]:::backend  
    end

    subgraph "Intelligence: AI Engine"  
        Groq\[Groq: Llama-3.3-70b-versatile\]:::external  
    end

    %% Flow Connections  
    Learner \-- "Unstructured Command \<br/\> 'Give me a thumbs up'" \--\> UI  
    UI \-- "POST {text: ...}" \--\> API  
      
    API \-- "Context \+ Literal Constraints" \--\> Prompt  
    Prompt \-- "JSON Request" \--\> Groq  
      
    Groq \-- "{'animation': 'ThumbsUp'}" \--\> Validator  
    Validator \-- "Validated JSON Response" \--\> UI  
      
    UI \-- "Update currentAnim State" \--\> Store  
    Store \-- "AnimationMixer.crossFade(0.5s)" \--\> Canvas  
    Canvas \-- "Update Skeletal Bones" \--\> Model  
    Model \-- "Visual Feedback" \--\> Learner

    %% Layout Hints  
    UI \-.-\> Canvas  
\`\`\`

### **The AI Logic ("Direct Engine Coupling")**

LLMs are inherently non-deterministic. If a user says *"Give me a high five"*, the LLM might invent an animation name like HighFive. If the WebGL engine tries to play HighFive and the .glb file lacks that specific bone track, the React application will crash.

**The Solution:**

* **Asset Selection:** Utilized the RobotExpressive.glb asset, which contains exactly 14 baked skeletal animations (e.g., Idle, Walking, Punch, Death, ThumbsUp).  
* **Classification Routing:** Using Pydantic Literal typing and Groq's strict json\_object response format, force the LLM to act purely as a classification router.  
* **Instruction Tuning:** The LLM is given a system prompt mapping natural language intents to *only* those 14 exact strings. This guarantees 100% engine compatibility and prevents "hallucinated" animations.

## **2\. Engineering Challenges & Solutions**

### **A. Next.js 16 WebGL SSR Collision (React 19\)**

**Challenge:** Next.js utilizes Turbopack and Server-Side Rendering (SSR). Because a server lacks a GPU and a window object, Three.js instantly throws fatal errors during the pre-render phase.

**Solution:** Implemented **Dynamic Named Exports**. Standard async/await wrappers often fail the strict AST requirements of Next.js 16\. Solved this by using: dynamic(() \=\> import('../components/AvatarScene').then((mod) \=\> mod.AvatarScene), { ssr: false }).

### **B. Animation Snapping & Organic Movement**

**Challenge:** Hard-switching from Running to Idle causes the 3D model's bones to snap violently.

**Solution:** We utilized Three.js AnimationMixer with a **0.5-second crossfade**. Every time a state changes, the React useEffect triggers:

currentAction.reset().fadeIn(0.5).play(). This smoothly interpolates bone weights for a human-like transition.

### **C. Dockerized Environment Parity**

**Challenge:** Python 3.14 and Pydantic v2 have specific C-extensions that can behave differently on Windows vs. Linux.

**Solution:** A **multi-stage Docker build** using python:3.14-slim. This ensures the API environment is immutable and identical from Murci’s local machine to the final HuggingFace/NexEra cloud deployment.

### **D. State Synchronization & Auto-Reset**

**Challenge:** After performing an action (like ThumbsUp), the avatar remains in that pose indefinitely, which looks unnatural.

**Solution:** Implemented a **sticky useRef timer**. Every incoming command clears the previous timer and sets a new 5-second window. If no further input is received, the frontend automatically dispatches a transition back to the Idle state.

## **3\. Scaling Roadmap**

1. **RAG Vector Routing (Zero-Latency):** Integrate a local Vector Database (Pinecone/Milvus). Match user commands against a pre-computed dictionary using Cosine Similarity. This allows 90% of commands to trigger animations in **\<50ms**, using the LLM only for complex edge cases.  
2. **WebRTC Voice Integration:** Replace text input with a low-latency audio stream to Whisper AI, allowing trainees to speak naturally to the coach while their hands are busy in a simulation.  
3. **Procedural Inverse Kinematics (IK):** Move beyond "baked" clips. Use the AI to return \[X, Y, Z\] coordinates, allowing the avatar to dynamically point at or pick up randomized objects in the 3D scene.