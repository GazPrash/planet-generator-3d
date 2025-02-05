import { Color3, Color4, FloatArray, Scene, Vector3 } from "@babylonjs/core";
import { NoiseFunction3D } from "simplex-noise";
import generate_simplex from "./simplexnoise.ts";

var g_elevation_max = 0;

export class PlanetShape {
  seed: string;
  planetRadius: number;
  noise3D: NoiseFunction3D;
  noise_layers: NoiseLayer[];
  elevationMax: number;
  elevationMin: number;
  deformations: number[];

  constructor(
    seed: string,
    planetRadius: number,
    noise_layers: NoiseLayer[],
  ) {
    this.seed = seed;
    this.planetRadius = planetRadius;
    this.noise_layers = noise_layers;
    this.noise3D = generate_simplex(this.seed);

    this.elevationMin = Number.MAX_VALUE;
    this.elevationMax = Number.MIN_VALUE;
    this.deformations = [];
  }

  update_minmax(value: number) {
    this.deformations.push(value);
    this.elevationMin = Math.min(this.elevationMin, value);
    this.elevationMax = Math.max(this.elevationMax, value);
  }

  resetElevationMax() {
    this.elevationMin = Number.MAX_VALUE;
    this.elevationMax = Number.MIN_VALUE;
  }

  // noise evaluation method
  // simple noise filter
  noise_filter(pointOnSphere: Vector3, settings: NoiseSettings) {
    var noise_value = 0;
    var frequency = settings.base_roughness;
    var amplitude = 1;

    for (let i = 0; i < settings.numLayers; i++) {
      pointOnSphere = pointOnSphere.scale(frequency).add(settings.center);
      const v = this.noise3D(pointOnSphere.x, pointOnSphere.y, pointOnSphere.z);
      noise_value += (v + 1) * 0.5 * amplitude;
      frequency *= settings.roughness;
      amplitude *= settings.persistance;
    }
    noise_value = Math.max(0, noise_value - settings.minValue);
    return noise_value * settings.strength;

    // prior : (1 layered)
    // pointOnSphere = pointOnSphere.scale(this.roughness).add(this.center);
    // const noise_value =
    //   (this.noise3D(pointOnSphere.x, pointOnSphere.y, pointOnSphere.z) + 1) *
    //   0.5;
    // return noise_value * this.strength;
  }
  // not rigid lol --> ridged -> mountain crest
  noise_filter_ridged(pointOnSphere: Vector3, settings: NoiseSettings) {
    var noise_value = 0;
    var frequency = settings.base_roughness;
    var amplitude = 1;
    var weight = 1;

    for (let i = 0; i < settings.numLayers; i++) {
      pointOnSphere = pointOnSphere.scale(frequency).add(settings.center);
      var v =
        1 -
        Math.abs(
          this.noise3D(pointOnSphere.x, pointOnSphere.y, pointOnSphere.z),
        );
      v *= v;
      v *= weight;
      weight = v;
      noise_value += (v + 1) * 0.5 * amplitude;
      frequency *= settings.roughness;
      amplitude *= settings.persistance;
    }
    noise_value = Math.max(0, noise_value - settings.minValue);
    return noise_value * settings.strength;
  }
  calculatePointOnPlanet(pointOnSphere: Vector3, colorSettings: PlanetColor) {
    var firstLayerValue = 0;
    var deformation = 0;
    if (this.noise_layers.length > 0) {
      const first_layer = this.noise_layers[0];
      const layer_type = first_layer.noise_settings.filter;
      if (layer_type == filter_type.SIMPLE) {
        firstLayerValue = this.noise_filter(
          pointOnSphere,
          this.noise_layers[0].noise_settings,
        );
      } else if (layer_type == filter_type.RIDGED) {
        firstLayerValue = this.noise_filter_ridged(
          pointOnSphere,
          this.noise_layers[0].noise_settings,
        );
      } else {
        firstLayerValue = 0;
      }
      if (first_layer.noise_settings.useAsLayerMask) {
        deformation = firstLayerValue;
      }
    }
    for (let i = 1; i < this.noise_layers.length; i++) {
      const layer = this.noise_layers[i];
      if (layer.enabled) {
        const mask = layer.noise_settings.useAsLayerMask ? firstLayerValue : 1;
        switch (layer.noise_settings.filter) {
          case filter_type.SIMPLE:
            deformation +=
              this.noise_filter(pointOnSphere, layer.noise_settings) * mask;
            break;
          case filter_type.RIDGED:
            deformation +=
              this.noise_filter_ridged(pointOnSphere, layer.noise_settings) *
              mask;
          default:
            deformation +=
              this.noise_filter(pointOnSphere, layer.noise_settings) * mask;
            break;
        }
      }
    }
    deformation = this.planetRadius * (1 + deformation);
    this.update_minmax(deformation);
    // const vertexColor = colorSettings.getColorFromElevation(deformation);
    // colorSettings.colors.push(vertexColor.r, vertexColor.g, vertexColor.b, vertexColor.a);
    return pointOnSphere.scale(deformation);
  }
}

export enum filter_type {
  SIMPLE,
  RIDGED,
}

export type NoiseSettings = {
  filter: filter_type;
  numLayers: number;
  useAsLayerMask: boolean;
  base_roughness: number;
  roughness: number;
  strength: number;
  persistance: number;
  center: Vector3;
  minValue: number;
};

export type RidgedNoiseSettings = NoiseSettings & {
  ridgidness: number;
};

export class NoiseLayer {
  enabled: boolean;
  noise_settings: NoiseSettings | RidgedNoiseSettings;
  constructor(settings: NoiseSettings) {
    this.enabled = true;
    this.noise_settings = settings;
  }
}

export class PlanetColor {
  colors: any[];
  gradient_stops: {
    stop: number;
    color: string;
  }[];
  biomes: string[][];

  constructor(biomes: string[][]) {
    this.colors = [];
    this.gradient_stops = [];
    this.biomes = biomes;
    // this.gradient_stops = [
    //   { stop: 2.0, color: "#042e5e" }, // 0.000
    //   { stop: 2.05, color: "#022041" }, // 0.1667
    //   { stop: 2.065, color: "#07b800" }, // 0.2167
    //   { stop: 2.15, color: "#634302" }, // 0.5
    //   { stop: 2.20, color: "#634302" }, // 0.667
    //   { stop: 2.30, color: "#ffffff" }, // 1.0
    // ];
  }
  generate_gradient_stops(biome_index: number = 0, min_val: number = 2.0, max_val: number = 2.3) {
    const diff = max_val - min_val;
    this.gradient_stops = [
      { stop: min_val, color: this.biomes[biome_index][0] },
      { stop: min_val + 0.1667 * (diff) * 1, color: this.biomes[biome_index][1] },
      { stop: min_val + 0.2167 * (diff) * 1, color: this.biomes[biome_index][2] },
      { stop: min_val + 0.5 * (diff) * 1, color: this.biomes[biome_index][3] },
      { stop: min_val + 0.667 * (diff) * 1, color: this.biomes[biome_index][4] },
      { stop: max_val, color: this.biomes[biome_index][5] },
    ]
    console.log("minmax : ", max_val, min_val);
    console.log(this.gradient_stops);
  }
  hexToColor4(hexstring: string) {
    const bigint = parseInt(hexstring.slice(1), 16); // Remove the '#' and parse the string
    const r = ((bigint >> 16) & 255) / 255; // Extract red and normalize to [0, 1]
    const g = ((bigint >> 8) & 255) / 255;  // Extract green and normalize to [0, 1]
    const b = (bigint & 255) / 255;         // Extract blue and normalize to [0, 1]
    return new Color4(r, g, b, 1);  // Return a Color4 with full opacity
  }
  getColorFromElevation(elevation: number) {
    for (let i = 0; i < this.gradient_stops.length - 1; i++) {
      const lower = this.gradient_stops[i];
      const upper = this.gradient_stops[i + 1];

      if (elevation >= lower.stop && elevation <= upper.stop) {
        const factor = (elevation - lower.stop) / (upper.stop - lower.stop);
        return Color4.Lerp(this.hexToColor4(lower.color), this.hexToColor4(upper.color), factor);
      }
    }
    return this.hexToColor4(this.gradient_stops[this.gradient_stops.length - 1].color); // Fallback to last color
  }
}
