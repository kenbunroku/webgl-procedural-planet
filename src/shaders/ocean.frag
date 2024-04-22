#version 300 es
precision highp float;

uniform sampler2D uTexture;

in vec2 vUv;
out vec4 fragColor;

float sdfSphere(vec3 p, float r) {
  return length(p) - r;
}

float map(vec3 pos) {
  float dist = sdfSphere(pos, 1.76f);

  return dist;
}

const int NUM_STEPS = 256;
const float MAX_DIST = 1000.0f;

vec3 RayMarch(vec3 cameraOrigin, vec3 cameraDir, vec3 originalCol) {

  vec3 pos;
  float dist = 0.0f;

  for(int i = 0; i < NUM_STEPS; ++i) {
    pos = cameraOrigin + dist * cameraDir;

    float distToScene = map(pos);

    // Case 1: distToScene < 0, intersected scene
    // BREAK
    if(distToScene < 0.001f) {
      break;
    }
    dist += distToScene;

    // Case 2: dist > MAX_DIST, out of the scene entirely
    // RETURN
    if(dist > MAX_DIST) {
      return vec3(0.0f);
    }

    // Case 3: Loop around, in reality, do nothing.
  }

  // Finished loop
  return vec3(1.0f);
}

void main() {
  // vec4 tex = texture(uTexture, vUv);
  // vec3 rayOrigin = vec3(0.f, 0.1f, 1.57f);
  // vec3 rayDir = normalize(vec3(0.f, 0.1f, 0.57f));
  // vec3 color = RayMarch(rayOrigin, rayDir, tex.rgb);
  fragColor = vec4(vec3(0.25f, 0.42f, 1.f), 0.2f);
}
