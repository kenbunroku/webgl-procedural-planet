import {
  loadFile,
  createProgram,
  createVbo,
  createIbo,
} from "./libs/webglUtils";
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
  distance: 2,
  min: 1.0,
  max: 3.0,
  move: 2.0,
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

  return gl;
};

const initProgram = async (gl) => {
  // const vs = await loadFile("/src/shaders/main.vert");
  // const fs = await loadFile("/src/shaders/main.frag");

  const program = await createProgram(gl, vs, fs);

  return program;
};

const setUp = (gl, program) => {
  const icosahedron = Icosahedron(4);
  numOfTriangles = icosahedron.index.length;

  const sphereVbos = [
    createVbo(gl, icosahedron.position, gl.STATIC_DRAW),
    createVbo(gl, icosahedron.texCoord, gl.STATIC_DRAW),
    createVbo(gl, icosahedron.normal, gl.STATIC_DRAW),
  ];

  sphereVao = gl.createVertexArray();
  gl.bindVertexArray(sphereVao);

  sphereVbos.forEach((vbo, index) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, 3, gl.FLOAT, false, 0, 0);
  });

  const sphereIbo = createIbo(gl, icosahedron.index);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIbo);
  gl.bindVertexArray(null);

  const resolutionLocation = gl.getUniformLocation(program, "resolution");
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

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
  const rotateAngle = deltaTime * 0.3;
  const m = m4.rotate(m4.identity(), rotateAngle, rotateAxis);
  const v = camera.update();
  const fovy = 90;
  const aspect = gl.canvas.width / gl.canvas.height;
  const near = 0.01;
  const far = 100.0;
  const p = m4.perspective(fovy, aspect, near, far);
  const vp = m4.multiply(p, v);
  const mvp = m4.multiply(vp, m);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);
  gl.bindVertexArray(sphereVao);
  gl.uniform1f(gl.getUniformLocation(program, "time"), deltaTime);
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "mvpMatrix"), false, mvp);
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
