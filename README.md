# Procedural Planet Generator 🌍🔥❄️

A 3D web-based procedural planet generator built with [Babylon.js](https://www.babylonjs.com/) and [Vite.js](https://vitejs.dev/). This project allows users to generate random planets with customizable biomes using procedural noise.

## ✨ Features

- 🌎 **Procedural Mesh Generation** using Perlin noise
- 🎨 **Customizable Biomes** with predefined color schemes
- 🎲 **Random Seeded Planets** for unique worlds
- ⚡ **Fast & Optimized** rendering with Babylon.js
- 🌐 **Web-based** with instant previews using Vite.js

## 🛠️ Installation

[1] Clone the repository:

   ```sh
   git clone https://github.com/yourusername/procedural-planet.git
   cd procedural-planet
   ```
[2] Install dependencies:

   ```sh
   npm install
   ```
[3]
   ```sh
   npm run dev
   ```

## 🎨 Custom Biomes using colour swatches

```typescript

const biome_earth = [
  "#042e5e", // Deep Ocean
  "#022041", // Ocean
  "#07b800", // Grassland
  "#634302", // Hills
  "#634302", // Mountains
  "#ffffff", // Snow Caps
];

const biome_volcano = [
  "#ff1100", // Lava
  "#ffd666", // Ash
  "#422100", // Rocky Terrain
  "#422100", // More Rocks
  "#d45800", // Magma
  "#b00017", // Deep Lava
];

const biome_snowy = [
  "#ffffff", // Ice
  "#c7c7c7", // Snow
  "#e3e3e3", // Frost
  "#7acaff", // Frozen Lakes
  "#006887", // Cold Ocean
  "#ffffff", // Glaciers
];

```

## 📦 Dependencies

```json
"dependencies": {
  "@babylonjs/core": "^7.41.0",
  "@babylonjs/materials": "^7.41.0",
  "@types/seedrandom": "^3.0.8",
  "seedrandom": "^3.0.5",
  "simplex-noise": "^4.0.3",
  "typescript": "^5.7.2"
},
"devDependencies": {
  "vite": "^6.0.4"
}
```

## 📄 References
[1] Procedural Planet Generation in Unity by Sebastian Lague: https://www.youtube.com/playlist?list=PLFt_AvWsXl0cONs3T0By4puYy6GM22ko8
[2] Perlin Noise: https://en.wikipedia.org/wiki/Perlin_noise
[3] Procedural Mesh Generation: https://en.wikipedia.org/wiki/Procedural_generation

