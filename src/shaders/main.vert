#version 300 es

layout(location = 0) in vec3 position;
layout(location = 1) in vec2 uv;

uniform mat4 mvpMatrix;

#include './modules/snoise.glsl'

out vec2 vUvs;

void main() {
  float noise = snoise(vec3(position));
  vUvs = uv;
  gl_Position = mvpMatrix * vec4(position * noise, 1.0f);
}
