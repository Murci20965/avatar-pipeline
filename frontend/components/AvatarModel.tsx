"use client";

import { useRef } from "react";
import { Mesh } from "three";

export const AvatarModel = ({ currentAnimation }: { currentAnimation: string }) => {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={[0, 1, 0]}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color={currentAnimation === "Idle" ? "gray" : "blue"} />
    </mesh>
  );
};
