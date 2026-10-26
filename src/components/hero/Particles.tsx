"use client";

import { useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { ParticleField } from "./ParticleField";

type Props = { stage: number; reduce: boolean };

/** Pont R3F ↔ ParticleField : nuage de particules du hero. */
export default function Particles({ stage, reduce }: Props) {
  const camera = useThree((s) => s.camera);
  const domElement = useThree((s) => s.gl.domElement);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const dpr = useThree((s) => s.viewport.dpr);
  const [field] = useState(() => new ParticleField(window.innerWidth < 700 ? 4500 : 9000));

  useEffect(() => () => field.dispose(), [field]);
  useEffect(() => field.resize(camera as PerspectiveCamera, width / height, dpr), [field, camera, width, height, dpr]);
  useEffect(() => field.setStage(stage), [field, stage]);
  useEffect(() => field.attach(domElement, camera), [field, domElement, camera]);

  useFrame((state, delta) => field.update(delta, state.camera, reduce));

  return <primitive object={field.group} />;
}
