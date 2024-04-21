float smoothMax(float a, float b, float k) {
  k = min(0.0, -k);
  float h = max(0.0, min(1.0, (b - a + k) / (2.0 * k)));
  return a * h + b * (1.0 - h) - k * h * (1.0 - h);
}

float Blend(float startHeight, float blendDst, float height) {
  return smoothstep(startHeight - blendDst / 2.0, startHeight + blendDst / 2.0, height);
}
