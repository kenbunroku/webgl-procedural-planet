#version 300 es
precision highp float;

uniform float time;
uniform mat4 mvpMatrix;

in vec3 vNormal;
in vec3 vPosition;
out vec4 fragColor;

#include './modules/math.glsl'

void main() {
  float d = length(vPosition);
  vec3 DARK_BLUE = vec3(0.01f, 0.09f, 0.75f);
  vec3 LIGHT_BLUE = vec3(0.25f, 0.42f, 1.f);
  vec3 LAND_COLOR = vec3(0.f, 0.3f, 0.f);
  vec3 SAND_COLOR = vec3(0.9f, 0.8f, 0.64f);
  vec3 MOUNTAIN_COLOR = vec3(0.5f, 0.5f, 0.5f);
  vec3 SNOW_COLOR = vec3(1.f, 1.f, 1.f);
  vec3 color = mix(DARK_BLUE, LIGHT_BLUE, smoothstep(8.5f, 8.7f, d));
  color = mix(color, SAND_COLOR, smoothstep(8.7f, 8.9f, d));
  color = mix(color, LAND_COLOR, smoothstep(8.7f, 9.3f, d));
  color = mix(color, MOUNTAIN_COLOR, smoothstep(9.0f, 9.6f, d));
  color = mix(color, SNOW_COLOR, smoothstep(9.4f, 10.f, d));

  vec3 rayDir = normalize(vec3(0.f, 0.1f, 0.57f));
  float lightStrength = max(dot(normalize(vNormal), rayDir), 0.0f);
  vec3 ambient = 0.02f * color; // Ambient light component
  vec3 diffuse = lightStrength * color; // Diffuse light component
  vec3 finalColor = ambient + diffuse;

  fragColor = vec4(finalColor, 1.0f);
}
