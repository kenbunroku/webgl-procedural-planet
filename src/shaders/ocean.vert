#version 300 es

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;
layout(location = 2) in vec3 normal;

uniform mat4 mvpMatrix;
uniform float waterHight;

out vec2 vUv;
out vec3 vNormal;

void main() {
  vUv = uv;
  vec3 pos = position;
  vec3 dir = normalize(pos);
  float height = waterHight;
  vNormal = normal;
  gl_Position = mvpMatrix * vec4(dir * height, 1.0f);
}
