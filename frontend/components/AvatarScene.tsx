"use client";

import { useEffect } from "react";
import { useGLTF, useAnimations, ContactShadows } from "@react-three/drei";

export const AvatarScene = ({ currentAnimation }: { currentAnimation: string }) => {
  const { scene, animations } = useGLTF("/RobotExpressive.glb");
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (!actions) return;

    const safeAnim = actions[currentAnimation] ? currentAnimation : "Idle";
    const currentAction = actions[safeAnim];
    
    if (currentAction) {
      currentAction.reset().fadeIn(0.5).play();
    }

    return () => {
      if (currentAction) {
        currentAction.fadeOut(0.5);
      }
    };
  },[currentAnimation, actions]);

  return (
    <group position={[0, -0.8, 0]}>
      <primitive object={scene} scale={0.5} />
      
      <ContactShadows 
        opacity={0.8} 
        scale={10} 
        blur={2} 
        far={4} 
        resolution={256} 
        color="#000000" 
      />
    </group>
  );
};