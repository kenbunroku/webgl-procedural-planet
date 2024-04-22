float smoothMax(float a, float b, float k) {
  k = min(0.0, -k);
  float h = max(0.0, min(1.0, (b - a + k) / (2.0 * k)));
  return a * h + b * (1.0 - h) - k * h * (1.0 - h);
}

float Blend(float startHeight, float blendDst, float height) {
  return smoothstep(startHeight - blendDst / 2.0, startHeight + blendDst / 2.0, height);
}

	// Returns vector (dstToSphere, dstThroughSphere)
	// If ray origin is inside sphere, dstToSphere = 0
	// If ray misses sphere, dstToSphere = maxValue; dstThroughSphere = 0
const float maxFloat = 3.402823466e+38;

vec2 raySphere(vec3 sphereCentre, float sphereRadius, vec3 rayOrigin, vec3 rayDir) {
  vec3 offset = rayOrigin - sphereCentre;
  float a = 1.0; // Set to dot(rayDir, rayDir) if rayDir might not be normalized
  float b = 2.0 * dot(offset, rayDir);
  float c = dot(offset, offset) - sphereRadius * sphereRadius;
  float d = b * b - 4.0 * a * c; // Discriminant from quadratic formula

		// Number of intersections: 0 when d < 0; 1 when d = 0; 2 when d > 0
  if(d > 0.0) {
    float s = sqrt(d);
    float dstToSphereNear = max(0.0, (-b - s) / (2.0 * a));
    float dstToSphereFar = (-b + s) / (2.0 * a);

			// Ignore intersections that occur behind the ray
    if(dstToSphereFar >= 0.0) {
      return vec2(dstToSphereNear, dstToSphereFar - dstToSphereNear);
    }
  }
		// Ray did not intersect sphere
  return vec2(maxFloat, 0.0);
}
