export class Noise {
  private static readonly Source: number[] = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
    36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
    234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
    134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
    230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
    116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
    124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
    47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
    154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
    108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
    242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
    239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
    141, 128, 195, 78, 66, 215, 61, 156, 180,
  ];

  private static readonly Grad3: number[][] = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ];

  private static readonly F3 = 1 / 3;
  private static readonly G3 = 1 / 6;

  private random: number[] = [];

  constructor(seed: number = 0) {
    this.randomize(seed);
  }

  private randomize(seed: number): void {
    this.random = Noise.Source.slice();

    if (seed !== 0) {
      const rng = new Random(seed);
      for (let i = this.random.length - 1; i > 0; i--) {
        const j = Math.floor(rng.nextFloat() * (i + 1));
        [this.random[i], this.random[j]] = [this.random[j], this.random[i]];
      }
    }

    this.random = this.random.concat(this.random);
  }

  private static fastFloor(x: number): number {
    return x > 0 ? Math.floor(x) : Math.floor(x) - 1;
  }

  private static dot(g: number[], x: number, y: number, z: number): number {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  public evaluate(point: { x: number; y: number; z: number }): number {
    const { x, y, z } = point;

    const s = (x + y + z) * Noise.F3;
    const i = Noise.fastFloor(x + s);
    const j = Noise.fastFloor(y + s);
    const k = Noise.fastFloor(z + s);

    const t = (i + j + k) * Noise.G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;

    const x0 = x - X0;
    const y0 = y - Y0;
    const z0 = z - Z0;

    let i1: number, j1: number, k1: number;
    let i2: number, j2: number, k2: number;

    if (x0 >= y0) {
      if (y0 >= z0) {
        [i1, j1, k1] = [1, 0, 0];
        [i2, j2, k2] = [1, 1, 0];
      } else if (x0 >= z0) {
        [i1, j1, k1] = [1, 0, 0];
        [i2, j2, k2] = [1, 0, 1];
      } else {
        [i1, j1, k1] = [0, 0, 1];
        [i2, j2, k2] = [1, 0, 1];
      }
    } else {
      if (y0 < z0) {
        [i1, j1, k1] = [0, 0, 1];
        [i2, j2, k2] = [0, 1, 1];
      } else if (x0 < z0) {
        [i1, j1, k1] = [0, 1, 0];
        [i2, j2, k2] = [0, 1, 1];
      } else {
        [i1, j1, k1] = [0, 1, 0];
        [i2, j2, k2] = [1, 1, 0];
      }
    }

    const x1 = x0 - i1 + Noise.G3;
    const y1 = y0 - j1 + Noise.G3;
    const z1 = z0 - k1 + Noise.G3;

    const x2 = x0 - i2 + 2 * Noise.G3;
    const y2 = y0 - j2 + 2 * Noise.G3;
    const z2 = z0 - k2 + 2 * Noise.G3;

    const x3 = x0 - 1 + 3 * Noise.G3;
    const y3 = y0 - 1 + 3 * Noise.G3;
    const z3 = z0 - 1 + 3 * Noise.G3;

    const ii = i & 0xff;
    const jj = j & 0xff;
    const kk = k & 0xff;

    let n0 = 0,
      n1 = 0,
      n2 = 0,
      n3 = 0;

    const t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) {
      const gi0 = this.random[ii + this.random[jj + this.random[kk]]] % 12;
      n0 = t0 * t0 * Noise.dot(Noise.Grad3[gi0], x0, y0, z0);
    }

    const t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) {
      const gi1 =
        this.random[ii + i1 + this.random[jj + j1 + this.random[kk + k1]]] % 12;
      n1 = t1 * t1 * Noise.dot(Noise.Grad3[gi1], x1, y1, z1);
    }

    const t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) {
      const gi2 =
        this.random[ii + i2 + this.random[jj + j2 + this.random[kk + k2]]] % 12;
      n2 = t2 * t2 * Noise.dot(Noise.Grad3[gi2], x2, y2, z2);
    }

    const t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) {
      const gi3 =
        this.random[ii + 1 + this.random[jj + 1 + this.random[kk + 1]]] % 12;
      n3 = t3 * t3 * Noise.dot(Noise.Grad3[gi3], x3, y3, z3);
    }

    return 32 * (n0 + n1 + n2 + n3);
  }
}

class Random {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed & 0x7fffffff;
  }
  nextFloat(): number {
    this.seed = (this.seed * 16807) % 0x7fffffff;
    return (this.seed - 1) / 0x7ffffffe;
  }
}

const noise = new Noise(42); // Use a seed value
for (let i = 0; i < 100; i++) {
  const value = noise.evaluate({
    x: Math.random() * 5,
    y: Math.random() * 5,
    z: Math.random() * 5,
  });
  console.log(value);
}
