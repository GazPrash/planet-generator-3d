import { Mesh, Vector2, Vector3, StandardMaterial, VertexData, VertexBuffer, Scene, PBRMaterial, Color3, TransformNode } from "@babylonjs/core";
import { PlanetShape, PlanetColor } from "./customizer";

export class SphereFace {
  mesh: Mesh;
  resolution: number;
  localUp: Vector3; // kinda like local normal of this face
  axisA: Vector3; // kinda like local normal of this face
  axisB: Vector3; // kinda like local normal of this face
  shapeSettings: PlanetShape;
  colorSettings: PlanetColor;

  constructor(
    mesh: Mesh,
    resolution: number,
    localUp: Vector3,
    shapeSettings: PlanetShape,
    colorSettings: PlanetColor,
  ) {
    this.mesh = mesh;
    this.resolution = resolution;
    this.localUp = localUp;

    this.axisA = new Vector3(localUp.y, localUp.z, localUp.x);
    this.axisB = Vector3.Cross(localUp, this.axisA);

    this.shapeSettings = shapeSettings;
    this.colorSettings = colorSettings;
  }

  public meshconstructor() {
    const vertices: Vector3[] = Array.from(
      { length: this.resolution ** 2 },
      () => new Vector3(),
    );
    const triangles: Int32Array = new Int32Array(
      (this.resolution - 1) * (this.resolution - 1) * 6,
    );

    let triInd = 0;
    for (let y = 0; y < this.resolution; y++) {
      for (let x = 0; x < this.resolution; x++) {
        let i = x + y * this.resolution;
        const percentage: Vector2 = new Vector2(
          x / (this.resolution - 1),
          y / (this.resolution - 1),
        );
        const pointOnCube: Vector3 = this.localUp
          .add(this.axisA.scale((percentage.x - 0.5) * 2))
          .add(this.axisB.scale((percentage.y - 0.5) * 2));

        const pointOnSphere = pointOnCube.normalize();
        // normalize pointOnCube to convert it into a sphere - lol accidental discovery
        // vertices[i] = this.shapeSettings.calculatePointOnPlanet(pointOnSphere);
        vertices[i] = this.shapeSettings.calculatePointOnPlanet(pointOnSphere, this.colorSettings);

        if (x < this.resolution - 1 && y < this.resolution - 1) {
          triangles[triInd] = i;
          triangles[triInd + 1] = i + this.resolution + 1;
          triangles[triInd + 2] = i + this.resolution;

          triangles[triInd + 3] = i;
          triangles[triInd + 4] = i + 1;
          triangles[triInd + 5] = i + this.resolution + 1;
          triInd += 6;
        }
      }
    }

    const positions = vertices.flatMap((v) => [v.x, v.y, v.z]);
    // console.log(vertices[0], positions.slice(0, 3));
    // console.log(indices);
    const normals = [];
    VertexData.ComputeNormals(positions, triangles, normals);

    const vertex_data = new VertexData();
    vertex_data.positions = positions;
    vertex_data.indices = triangles;
    vertex_data.normals = normals;
    vertex_data.applyToMesh(this.mesh);

    // console.log(this.colorSettings.colors);
    // this.mesh.setVerticesData(VertexBuffer.ColorKind, this.colorSettings.colors);
    // this.mesh.hasVertexAlpha = false;
  }

  colorgenerator() {
    this.colorSettings.gradient_stops[0].stop = this.shapeSettings.elevationMin;
    this.colorSettings.gradient_stops[this.colorSettings.gradient_stops.length - 1].stop = this.shapeSettings.elevationMax;
    // console.log(this.colorSettings.gradient_stops);
    for (let defo of this.shapeSettings.deformations) {
      const vertexColor = this.colorSettings.getColorFromElevation(defo);
      // console.log(vertexColor, defo);
      this.colorSettings.colors.push(vertexColor.r, vertexColor.g, vertexColor.b, vertexColor.a);
    }

    this.mesh.setVerticesData(VertexBuffer.ColorKind, this.colorSettings.colors);
    this.mesh.hasVertexAlpha = false;

    this.colorSettings.colors = [];
    this.shapeSettings.resetElevationMax();
    this.shapeSettings.deformations = [];
  }
}



export class Planet {
  resolution: number;
  directions: Vector3[];
  sphereFaces: SphereFace[];
  material: PBRMaterial;
  planetShapeSettings: PlanetShape;
  planetColorSettings: PlanetColor;
  parentNode: TransformNode;

  constructor(
    scene: Scene,
    resolution: number,
    wireframe_on: boolean,
    planetShapeSettings: PlanetShape,
    planetColorSettings: PlanetColor,
    parentNode: TransformNode,

  ) {
    this.resolution = resolution;
    this.directions = [
      Vector3.Up(),
      Vector3.Down(),
      Vector3.Left(),
      Vector3.Right(),
      Vector3.Forward(),
      Vector3.Backward(),
    ];
    this.sphereFaces = [];

    this.material = new PBRMaterial("spherematerial_pbr", scene);
    this.material.albedoColor = Color3.FromHexString("#ffffff");
    this.material.metallic = 0;
    this.material.roughness = 0.2;
    this.material.backFaceCulling = false;
    this.material.alpha = 1;
    this.material.transparencyMode = 0;

    this.planetShapeSettings = planetShapeSettings;
    this.planetColorSettings = planetColorSettings;

    this.parentNode = parentNode;

    for (let i = 0; i < 6; i++) {
      const new_mesh = new Mesh(`mesh${i}`, scene);
      new_mesh.material = this.material;
      new_mesh.parent = parentNode;
      const face = new SphereFace(
        new_mesh,
        this.resolution,
        this.directions[i],
        this.planetShapeSettings,
        this.planetColorSettings,
      );
      this.sphereFaces.push(face);
    }
  }

  generate() {
    for (let face of this.sphereFaces) {
      face.meshconstructor();
      face.colorSettings.generate_gradient_stops(0);
      face.colorgenerator();
    }

  }
};
