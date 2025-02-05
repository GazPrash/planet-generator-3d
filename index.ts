import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  Color4,
  TransformNode,
  CubeTexture,
} from "@babylonjs/core";

import {
  filter_type,
  NoiseLayer,
  NoiseSettings,
  PlanetColor,
  PlanetShape,
} from "./src/customizer.ts";
import { Planet } from "./src/planet.ts";
import generate_random_seed from "./src/seed.ts";


const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
var engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
  antialias: true,
  useHighPrecisionFloats: true,
});
engine.setHardwareScalingLevel(1); // native

const scene = new Scene(engine);
scene.clearColor = new Color4(0.5, 0.8, 0.7, 1);
scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
  "https://assets.babylonjs.com/environments/environmentSpecular.env",
  scene,
);
scene.environmentIntensity = 0.5;

const parent_node = new TransformNode("parent", scene);

const camera = new ArcRotateCamera(
  "camera",
  Math.PI / 4,
  Math.PI / 3,
  10,
  Vector3.Zero(),
  scene,
);
camera.lowerRadiusLimit = 2;
camera.wheelDeltaPercentage = 0.01;
camera.attachControl(canvas, true);

const light = new HemisphericLight("light", new Vector3(-5, -5, 0), scene);
light.intensity = 1.05;

const settings1: NoiseSettings = {
  filter: filter_type.SIMPLE,
  numLayers: 5,
  useAsLayerMask: false,
  base_roughness: 1.25,
  roughness: 2.5,
  strength: 2.5,
  persistance: 0.25,
  center: new Vector3(0, 0, 0),
  minValue: 0.55,
};

const settings2: NoiseSettings = {
  filter: filter_type.SIMPLE,
  numLayers: 5,
  useAsLayerMask: true,
  base_roughness: 1.5,
  roughness: 1.5,
  strength: 2.0,
  persistance: 0.25,
  center: new Vector3(0, 0, 0),
  minValue: 2.0,
};

const settings3: NoiseSettings = {
  filter: filter_type.RIDGED,
  numLayers: 5,
  useAsLayerMask: true,
  base_roughness: 2.0,
  roughness: 2.0,
  strength: 0.35,
  persistance: 0.25,
  center: new Vector3(0, 0, 0),
  minValue: 0.85,
};

const layer1 = new NoiseLayer(settings1);
const layer2 = new NoiseLayer(settings2);
const layer3 = new NoiseLayer(settings3);
// layer1.enabled = false;
// layer2.enabled = false;

const noise_layers: NoiseLayer[] = [];
noise_layers.push(layer1);
noise_layers.push(layer2);
noise_layers.push(layer3);

const world_seed = generate_random_seed(10);
const planetShapeSettings = new PlanetShape(world_seed, 2, noise_layers);

const biomes: string[][] = [];
const biome_earth = [
  "#042e5e",
  "#022041",
  "#07b800",
  "#634302",
  "#634302",
  "#ffffff",
];

const biome_volcano = [
  "#ff1100",
  "#ffd666",
  "#422100",
  "#422100",
  "#d45800",
  "#b00017",
];

const biome_snowy = [
  "#ffffff",
  "#c7c7c7",
  "#e3e3e3",
  "#7acaff",
  "#006887",
  "#ffffff",
];

biomes.push(biome_earth);
biomes.push(biome_volcano);
biomes.push(biome_snowy);
const planetColorSettings = new PlanetColor(biomes);


const new_planet = new Planet(scene, 100, false, planetShapeSettings, planetColorSettings, parent_node);
new_planet.generate();

const rotation_speed = Math.PI;
scene.onBeforeRenderObservable.add(() => {
  const deltaTime = engine.getDeltaTime() * 0.00025;
  parent_node.rotation.y += rotation_speed * deltaTime;
});

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});
