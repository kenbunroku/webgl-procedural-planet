export const loadFile = async (path) => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText);
      } else {
        reject(new Error("Failed to load file."));
      }
    };
    request.onerror = () => {
      reject(new Error("Failed to load file."));
    };
    request.send();
  });
};

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  } else {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
};

export const createProgram = (
  gl,
  vertexShaderSource,
  fragmentShaderSource,
  varyings
) => {
  // Create vertex shader
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  // Create fragment shader
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  if (varyings) {
    gl.transformFeedbackVaryings(program, varyings, gl.SEPARATE_ATTRIBS);
  }

  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(program);
    return program;
  } else {
    alert(gl.getProgramInfoLog(program));
  }
};

export const createVbo = (gl, data, usage) => {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
};

export const createIbo = (gl, data) => {
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return ibo;
};

export const createFramebufferFloat2 = (gl, width, height) => {
  const depthRenderBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  const frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  const fTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, fTexture);
  // RGBA32F かつ FLOAT
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA32F,
    width,
    height,
    0,
    gl.RGBA,
    gl.FLOAT,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    fTexture,
    0
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return {
    framebuffer: frameBuffer,
    renderbuffer: depthRenderBuffer,
    texture: fTexture,
    width: width,
    height: height,
  };
};
