import { Pane } from "tweakpane";

import { createProgram, createVbo, createIbo } from "./libs/webglUtils";
import { Icosahedron } from "./libs/geometry.js";
import { WebGLOrbitCamera } from "./libs/camera.js";
import { WebGLMath } from "./libs/math.js";
import vs from "../shaders/main.vert";
import fs from "../shaders/main.frag";

let startTime = Date.now();
let sphereVao = [];
let numOfTriangles = 0;
let camera;
let cameraOptions = {
  distance: 20,
  min: 1.0,
  max: 30.0,
  move: 2.0,
};
let params = {
  continentShapeFrequency: 0.2,
  continentShapeStrength: 2.5,
  oceanFloorDepth: 3.0,
  oceanFloorSmoothing: 0.5,
  oceanDepthMultiplier: 5.0,
  mountainShapeFrequency: 0.2,
  mountainShapeStrength: 5.0,
  maskFrequency: 0.1,
};
const m4 = WebGLMath.Mat4;
const v3 = WebGLMath.Vec3;

const init = () => {
  const canvas = document.getElementById("webgl-canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("WebGL2.0 not supported");
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pane = new Pane();
  pane.addBinding(params, "continentShapeFrequency", {
    label: "Continent Shape Frequency",
    min: 0.001,
    max: 1.0,
    step: 0.001,
  });
  pane.addBinding(params, "continentShapeStrength", {
    label: "Continent Shape Strength",
    min: 0.01,
    max: 5.0,
  });
  pane.addBinding(params, "oceanFloorDepth", {
    label: "Ocean Floor Depth",
    min: 0.0,
    max: 5.0,
  });
  pane.addBinding(params, "oceanFloorSmoothing", {
    label: "Ocean Floor Smoothing",
    min: 0.01,
    max: 5.0,
  });
  pane.addBinding(params, "oceanDepthMultiplier", {
    label: "Ocean Depth Multiplier",
    min: 0.01,
    max: 10.0,
  });
  pane.addBinding(params, "mountainShapeFrequency", {
    label: "Mountain Shape Frequency",
    min: 0.01,
    max: 0.5,
  });
  pane.addBinding(params, "mountainShapeStrength", {
    label: "Mountain Shape Strength",
    min: 0.01,
    max: 10.0,
  });
  pane.addBinding(params, "maskFrequency", {
    label: "Mask Frequency",
    min: 0.01,
    max: 3.0,
  });

  return gl;
};

const initProgram = async (gl) => {
  const program = await createProgram(gl, vs, fs);

  return program;
};

const setUp = (gl, program) => {
  const icosahedron = Icosahedron(6, true, 10);
  numOfTriangles = icosahedron.index.length;

  const sphereVbos = [
    createVbo(gl, icosahedron.position, gl.STATIC_DRAW),
    createVbo(gl, icosahedron.texCoord, gl.STATIC_DRAW),
    createVbo(gl, icosahedron.normal, gl.STATIC_DRAW),
  ];
  const strides = [3, 2, 3];
  const locations = ["position", "uv", "normal"];

  sphereVao = gl.createVertexArray();
  gl.bindVertexArray(sphereVao);

  sphereVbos.forEach((vbo, index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const attributeLocation = gl.getAttribLocation(program, locations[index]);
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(index, strides[index], gl.FLOAT, false, 0, 0);
  });

  const sphereIbo = createIbo(gl, icosahedron.index);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIbo);
  gl.bindVertexArray(null);

  const resolutionLocation = gl.getUniformLocation(program, "resolution");
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);

  camera = new WebGLOrbitCamera(gl.canvas, cameraOptions);
};

const render = (gl, program) => {
  requestAnimationFrame(() => render(gl, program));

  // delta time
  const currentTime = Date.now();
  const deltaTime = (currentTime - startTime) / 1000;

  // Update mvp matrix
  const velocity = deltaTime * 0.2;
  const rotateAxis = v3.create(Math.cos(velocity), Math.sin(velocity), 0.5);
  const rotateAngle = deltaTime * 0;
  const m = m4.rotate(m4.identity(), rotateAngle, rotateAxis);
  const v = camera.update();
  const fovy = 90;
  const aspect = gl.canvas.width / gl.canvas.height;
  const near = 0.01;
  const far = 100.0;
  const p = m4.perspective(fovy, aspect, near, far);
  const vp = m4.multiply(p, v);
  const mvp = m4.multiply(vp, m);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);
  gl.bindVertexArray(sphereVao);

  // Uniforms
  gl.uniform1f(gl.getUniformLocation(program, "time"), deltaTime);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "mvpMatrix"), false, mvp);
  gl.uniform1f(
    gl.getUniformLocation(program, "continentShapeFrequency"),
    params.continentShapeFrequency
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "continentShapeStrength"),
    params.continentShapeStrength
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "oceanFloorDepth"),
    params.oceanFloorDepth
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "oceanFloorSmoothing"),
    params.oceanFloorSmoothing
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "oceanDepthMultiplier"),
    params.oceanDepthMultiplier
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "mountainShapeFrequency"),
    params.mountainShapeFrequency
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "mountainShapeStrength"),
    params.mountainShapeStrength
  );
  gl.uniform1f(
    gl.getUniformLocation(program, "maskFrequency"),
    params.maskFrequency
  );

  // drawing
  gl.drawElements(gl.TRIANGLES, numOfTriangles, gl.UNSIGNED_SHORT, 0);

  gl.bindVertexArray(null);
};

const run = async () => {
  const gl = init();
  const program = await initProgram(gl);
  setUp(gl, program);
  render(gl, program);
};

const resize = (gl) => {
  const displayWidth = gl.canvas.clientWidth;
  const displayHeight = gl.canvas.clientHeight;

  if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
};

window.addEventListener("load", run);
window.addEventListener("resize", () => {
  const gl = init();
  resize(gl);
});
