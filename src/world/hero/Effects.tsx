/** Bloom on emissive things only (high tier). Its own chunk, so phones never download it. */
import { Bloom, EffectComposer } from '@react-three/postprocessing';

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.62} luminanceSmoothing={0.3} intensity={1.1} radius={0.7} />
    </EffectComposer>
  );
}
