import { WebGLMath } from "./math.js";

export const Icosahedron = (order = 0, uvMap = false, radius = 1) => {
  const vec3 = WebGLMath.Vec3;

  if (order > 10) throw new Error(`Max order is 10, but given ${order}.`);

  // set up a 20-triangle icosahedron
  const f = (1 + Math.sqrt(5)) / 2;
  const T = Math.pow(4, order);

  const numVertices = 10 * T + 2;

  let vertices = new Float32Array(numVertices * 3);
  let normals = new Float32Array(vertices.length);

  vertices.set(
    Float32Array.of(
      -1,
      f,
      0,
      1,
      f,
      0,
      -1,
      -f,
      0,
      1,
      -f,
      0,
      0,
      -1,
      f,
      0,
      1,
      f,
      0,
      -1,
      -f,
      0,
      1,
      -f,
      f,
      0,
      -1,
      f,
      0,
      1,
      -f,
      0,
      -1,
      -f,
      0,
      1
    )
  );
  let triangles = Uint32Array.of(
    0,
    11,
    5,
    0,
    5,
    1,
    0,
    1,
    7,
    0,
    7,
    10,
    0,
    10,
    11,
    11,
    10,
    2,
    5,
    11,
    4,
    1,
    5,
    9,
    7,
    1,
    8,
    10,
    7,
    6,
    3,
    9,
    4,
    3,
    4,
    2,
    3,
    2,
    6,
    3,
    6,
    8,
    3,
    8,
    9,
    9,
    8,
    1,
    4,
    9,
    5,
    2,
    4,
    11,
    6,
    2,
    10,
    8,
    6,
    7
  );

  let v = 12;
  const midCashe = order ? new Map() : null; // midpoint vertices cache to avoid duplicating shared vertices

  function addMidPoint(a, b) {
    const key = Math.floor(((a + b) * (a + b + 1)) / 2 + Math.min(a, b));
    let i = midCashe.get(key);
    if (i !== undefined) {
      midCashe.delete(key);
      return i;
    }
    midCashe.set(key, v);
    vertices[3 * v + 0] = (vertices[3 * a + 0] + vertices[3 * b + 0]) * 0.5;
    vertices[3 * v + 1] = (vertices[3 * a + 1] + vertices[3 * b + 1]) * 0.5;
    vertices[3 * v + 2] = (vertices[3 * a + 2] + vertices[3 * b + 2]) * 0.5;
    return v++;
  }

  let trianglesPrev = triangles;
  const IndexArray = order > 5 ? Uint32Array : Uint16Array;

  for (let i = 0; i < order; i++) {
    const prevLen = trianglesPrev.length;
    triangles = new IndexArray(prevLen * 4);

    for (let k = 0; k < prevLen; k += 3) {
      const v1 = trianglesPrev[k + 0];
      const v2 = trianglesPrev[k + 1];
      const v3 = trianglesPrev[k + 2];
      const a = addMidPoint(v1, v2);
      const b = addMidPoint(v2, v3);
      const c = addMidPoint(v3, v1);
      let t = k * 4;
      triangles[t++] = v1;
      triangles[t++] = a;
      triangles[t++] = c;
      triangles[t++] = v2;
      triangles[t++] = b;
      triangles[t++] = a;
      triangles[t++] = v3;
      triangles[t++] = c;
      triangles[t++] = b;
      triangles[t++] = a;
      triangles[t++] = b;
      triangles[t++] = c;
    }
    trianglesPrev = triangles;
  }

  // normalize vertices
  for (let i = 0; i < numVertices * 3; i += 3) {
    const x = vertices[i + 0];
    const y = vertices[i + 1];
    const z = vertices[i + 2];

    const m = radius / Math.hypot(x, y, z);
    vertices[i + 0] *= m;
    vertices[i + 1] *= m;
    vertices[i + 2] *= m;

    // Set normals
    normals[i + 0] = vertices[i + 0] / radius;
    normals[i + 1] = vertices[i + 1] / radius;
    normals[i + 2] = vertices[i + 2] / radius;
  }

  if (!uvMap)
    return {
      position: vertices,
      normal: normals,
      index: triangles,
    };

  // uv mapping
  let uv = new Float32Array(numVertices * 2);
  for (let i = 0; i < numVertices; i++) {
    uv[2 * i + 0] =
      Math.atan2(vertices[3 * i + 2], vertices[3 * i]) / (2 * Math.PI) + 0.5;
    uv[2 * i + 1] = Math.asin(vertices[3 * i + 1]) / Math.PI + 0.5;
  }

  // This is my original code to fix uv mapping
  const wrapped = [];
  const copiedUv = [...uv];
  const copiedPositions = [...vertices];
  const copiedNormals = [...normals];
  let vertexIndex = uv.length / 2 - 1; // Assuming uv is a flat array [u1, v1, u2, v2, ...]

  for (let i = 0; i < triangles.length / 3; i++) {
    const a = triangles[i * 3];
    const b = triangles[i * 3 + 1];
    const c = triangles[i * 3 + 2];

    const uA = uv[2 * a];
    const uB = uv[2 * b];
    const uC = uv[2 * c];

    const texA = vec3.create(uA, uv[2 * a + 1], 0);
    const texB = vec3.create(uB, uv[2 * b + 1], 0);
    const texC = vec3.create(uC, uv[2 * c + 1], 0);
    const texNormal = vec3.cross(
      vec3.subtract(texB, texA),
      vec3.subtract(texC, texA)
    );

    if (texNormal[2] > 0) {
      wrapped.push(i);

      if (uA < 0.05 || uB < 0.05 || uC < 0.05) {
        // Duplicate vertex positions and UVs for the entire triangle
        copiedPositions.push(
          vertices[3 * a],
          vertices[3 * a + 1],
          vertices[3 * a + 2]
        );
        copiedUv.push(uA + (uA < 0.05 ? 1 : 0), uv[2 * a + 1]);
        copiedNormals.push(
          normals[3 * a],
          normals[3 * a + 1],
          normals[3 * a + 2]
        );
        vertexIndex++;
        triangles[i * 3] = vertexIndex;

        copiedPositions.push(
          vertices[3 * b],
          vertices[3 * b + 1],
          vertices[3 * b + 2]
        );
        copiedNormals.push(
          normals[3 * b],
          normals[3 * b + 1],
          normals[3 * b + 2]
        );
        copiedUv.push(uB + (uB < 0.05 ? 1 : 0), uv[2 * b + 1]);
        vertexIndex++;
        triangles[i * 3 + 1] = vertexIndex;

        copiedPositions.push(
          vertices[3 * c],
          vertices[3 * c + 1],
          vertices[3 * c + 2]
        );
        copiedUv.push(uC + (uC < 0.05 ? 1 : 0), uv[2 * c + 1]);

        copiedNormals.push(
          normals[3 * c],
          normals[3 * c + 1],
          normals[3 * c + 2]
        );
        vertexIndex++;
        triangles[i * 3 + 2] = vertexIndex;
      }
    }
  }
  vertices = copiedPositions;
  uv = copiedUv;
  normals = copiedNormals;

  // flip v in uv
  for (let i = 0; i < uv.length; i += 2) uv[i + 1] = 1 - uv[i + 1];

  return {
    position: vertices,
    normal: normals,
    texCoord: uv,
    index: triangles,
    // colors: colors,
  };
};
