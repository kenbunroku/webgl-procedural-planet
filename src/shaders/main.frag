#version 300 es
precision highp float;

uniform float time;
uniform mat4 mvpMatrix;

in vec3 vNormal;
in vec3 vPosition;
out vec4 fragColor;

void main() {
  float d = length(vPosition);
  vec3 DARK_BLUE = vec3(0.01f, 0.09f, 0.55f);
  vec3 LIGHT_BLUE = vec3(0.25f, 0.42f, 1.f);
  vec3 LAND_COLOR = vec3(0.0f, 0.5f, 0.0f);
  vec3 MOUNTAIN_COLOR = vec3(0.5f, 0.5f, 0.5f);
  vec3 SNOW_COLOR = vec3(1.f, 1.f, 1.f);
  vec3 color = mix(DARK_BLUE, LIGHT_BLUE, smoothstep(10.f, 10.2f, d));
  color = mix(color, LAND_COLOR, smoothstep(10.1f, 10.3f, d));
  color = mix(color, MOUNTAIN_COLOR, smoothstep(10.2f, 10.7f, d));
  color = mix(color, SNOW_COLOR, smoothstep(10.6f, 11.7f, d));

  vec3 lightDirection = normalize(vec3(0.57f, -0.57f, 0.57f));
  float lightStrength = max(dot(normalize(vNormal), lightDirection), 0.0f);
  vec3 ambient = 0.01f * color; // Ambient light component
  vec3 diffuse = lightStrength * color; // Diffuse light component
  vec3 finalColor = ambient + diffuse;

  fragColor = vec4(finalColor, 1.0f);
}
