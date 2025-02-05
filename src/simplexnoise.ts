import { createNoise3D, NoiseFunction3D } from "simplex-noise";
import seedrandom from "seedrandom";

export default function generate_simplex(seed: string): NoiseFunction3D {
  const prng = seedrandom.alea(seed);
  const noise3D = createNoise3D(prng);
  return noise3D;
}
