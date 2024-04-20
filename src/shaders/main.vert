#version 300 es
precision highp float;

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;
layout(location = 2) in vec3 normal;

uniform mat4 mvpMatrix;
uniform float time;

#include './modules/cnoise.glsl'
#include './modules/hash.glsl'

out vec2 vUvs;
out vec3 vNormal;
out vec3 vPosition;

float offset = 1.0f;
float tangentFactor = 0.1f;

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0f) : vec3(0.0f, -v.z, v.y));
}

float fbm(vec3 p, int octaves, float persistence, float lacunarity, float exponentiation) {
  float amplitude = 0.5f;
  float frequency = 1.0f;
  float total = 0.0f;
  float normalization = 0.0f;

  for(int i = 0; i < octaves; ++i) {
    float noiseValue = cnoise(p * frequency);
    total += noiseValue * amplitude;
    normalization += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  total /= normalization;
  total = total * 0.5f + 0.5f;
  total = pow(total, exponentiation);

  return total;
}

vec3 fbmDistorted(vec3 p, float offset) {
  return p + 3.5f * vec3(fbm(p / 3.0f + offset, 3, 0.5f, 2.0f, 4.0f), fbm(p / 4.0f + offset + 1.0f, 6, 0.5f, 2.0f, 4.0f), fbm(p / 5.0f + offset + 2.0f, 5, 0.5f, 2.0f, 4.0f));
}
vec3 distorted(vec3 p, float offset) {
  return 0.01f * vec3(cnoise(p / 3.0f + offset), cnoise(p / 4.0f + offset + 1.0f), cnoise(p / 5.0f + offset + 2.0f));
}

void main() {
  vec3 distortedPosition = fbmDistorted(position, offset);
  // distortedPosition += distorted(position, offset);
  vec3 tangent1 = orthogonal(normal);
  vec3 tangent2 = normalize(cross(normal, tangent1));
  vec3 nearby1 = position + tangent1 * tangentFactor;
  vec3 nearby2 = position + tangent2 * tangentFactor;
  vec3 distorted1 = fbmDistorted(nearby1, offset);
  vec3 distorted2 = fbmDistorted(nearby2, offset);

  vUvs = uv;
  vNormal = normalize(cross(distorted1 - distortedPosition, distorted2 - distortedPosition));
  vPosition = distortedPosition;
  gl_Position = mvpMatrix * vec4(distortedPosition, 1.0f);
}
