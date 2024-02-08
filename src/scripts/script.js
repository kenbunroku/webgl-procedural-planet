import { loadFile, createProgram, createVbo } from "./libs/webglUtils";

let startTime = Date.now();

const init = () => {
  const canvas = document.getElementById("webgl-canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error("WebGL not supported");
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  return gl;
};

const initProgram = async (gl) => {
  const vs = await loadFile("/src/shaders/main.vert");
  const fs = await loadFile("/src/shaders/main.frag");

  const program = await createProgram(gl, vs, fs);

  return program;
};

const setUp = (gl, program) => {
  const position = [
    -1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0,
  ];
  const uv = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0];

  const planeVbo = createVbo(gl, position, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVbo);
  const attLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(attLocation);
  gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0);

  const uvVbo = createVbo(gl, uv, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, uvVbo);
  const uvLocation = gl.getAttribLocation(program, "uv");
  gl.enableVertexAttribArray(uvLocation);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, "resolution");
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
};

const render = (gl, program) => {
  requestAnimationFrame(() => render(gl, program));

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // delta time
  const currentTime = Date.now();
  const deltaTime = (currentTime - startTime) / 1000;
  gl.uniform1f(gl.getUniformLocation(program, "time"), deltaTime);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
