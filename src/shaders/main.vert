#version 300 es
precision highp float;

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;
layout(location = 2) in vec3 normal;

uniform mat4 mvpMatrix;
uniform float time;
uniform float continentShapeFrequency;
uniform float continentShapeStrength;
uniform float oceanFloorDepth;
uniform float oceanFloorSmoothing;
uniform float oceanDepthMultiplier;
uniform float mountainShapeFrequency;
uniform float mountainShapeStrength;
uniform float maskFrequency;

#include './modules/snoise.glsl'
#include './modules/hash.glsl'
#include './modules/math.glsl'

out vec2 vUvs;
out vec3 vNormal;
out vec3 vPosition;

float offset = 3.0f;
float tangentFactor = 0.1f;
const vec3 AIXS_X = vec3(1.0f, 0.0f, 0.0f);
const vec3 AIXS_Y = vec3(0.0f, 1.0f, 0.0f);
const vec3 AIXS_Z = vec3(0.0f, 1.0f, 1.0f);

vec3 rotateVec3(vec3 p, float angle, vec3 axis) {
  vec3 a = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float r = 1.0f - c;
  mat3 m = mat3(a.x * a.x * r + c, a.y * a.x * r + a.z * s, a.z * a.x * r - a.y * s, a.x * a.y * r - a.z * s, a.y * a.y * r + c, a.z * a.y * r + a.x * s, a.x * a.z * r + a.y * s, a.y * a.z * r - a.x * s, a.z * a.z * r + c);
  return m * p;
}

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0f) : vec3(0.0f, -v.z, v.y));
}

float fbm(vec3 p, int octaves, float persistence, float lacunarity) {
  float amplitude = 0.5f;
  float total = 0.0f;

  for(int i = 0; i < octaves; ++i) {
    float noiseValue = snoise(p);
    total += noiseValue * amplitude;
    amplitude *= persistence;
    p = p * lacunarity;
  }

  return total;
}

float ridgedFBM(vec3 p, int octaves, float persistence, float lacunarity) {
  float amplitude = 0.5f;
  float frequency = 1.0f;
  float total = 0.0f;
  float normalization = 0.0f;

  for(int i = 0; i < octaves; ++i) {
    float noiseValue = snoise(p * frequency);
    noiseValue = abs(noiseValue);
    noiseValue = 1.0f - noiseValue;

    total += noiseValue * amplitude;
    normalization += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  total /= normalization;
  total *= total;

  return total;
}

vec3 distorted(vec3 pos, vec3 normal) {
  float continentShape = fbm(pos * continentShapeFrequency + offset, 1, 0.5f, 2.0f);
  // continentShape = abs(continentShape);
  continentShape *= continentShapeStrength;
  continentShape += fbm(pos * continentShapeFrequency + offset, 8, 0.5f, 2.0f);

  float oceanFloorShape = -oceanFloorDepth + continentShape * 0.15f;
  continentShape = smoothMax(continentShape, oceanFloorShape, oceanFloorSmoothing);
  continentShape *= (continentShape < 0.f) ? 1.f + oceanDepthMultiplier : 1.f;

  float mountainShape = ridgedFBM(pos * mountainShapeFrequency, 1, 0.5f, 2.0f);
  mountainShape *= mountainShapeStrength;

  float mask = Blend(0.0f, 1.2f, fbm(pos * maskFrequency + offset, 1, 0.5f, 2.0f));

  float finalHeight = 1.f + (continentShape + mountainShape * mask) * .15f;

  pos += normal * finalHeight;
  pos = rotateVec3(pos, time * 0.1f, AIXS_Y);
  // pos = rotateVec3(pos, time * 0.4f, AIXS_X);
  return pos;
}

void main() {
  vec3 pos = position;
  pos = distorted(pos, normal);

  vec3 tangent = orthogonal(normal);
  vec3 bitangent = normalize(cross(normal, tangent));
  vec3 nearby1 = position + tangent * tangentFactor;
  vec3 nearby2 = position + bitangent * tangentFactor;
  vec3 distortedNearby1 = distorted(nearby1, normal);
  vec3 distortedNearby2 = distorted(nearby2, normal);

  vUvs = uv;
  vNormal = normalize(cross(distortedNearby1 - pos, distortedNearby2 - pos));

  gl_Position = mvpMatrix * vec4(pos, 1.0f);

  // Varyings
  vPosition = pos;
}
