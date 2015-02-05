precision mediump float;

uniform sampler2D heightmap;
uniform float scale;
uniform vec2 offset;
uniform vec2 midPos;
uniform vec2 terrainDims;
uniform float tileRes;
uniform vec2 morph;
// uniform float morphFactor;

varying vec3 pos;
varying vec2 uVu;

void main() {
  // Position tiles in xy-plane
  pos = position*scale;
  pos.xy += midPos + offset;

  // Snap tiles to grid
  float gridSpacing = scale/tileRes;
  pos = floor(pos/gridSpacing)*gridSpacing;


  // Morph verts
  vec2 pShifted = position.xy - vec2(0.5, 0.5);
  vec2 pMorphed = pShifted*morph*2.0;

  float xMorph = step(0.0, pMorphed.x)*pMorphed.x;
  float yMorph = step(0.0, pMorphed.y)*pMorphed.y;
  // float morphFactor = (xMorph + yMorph)/2.0;

  gridSpacing = 2.0*gridSpacing;
  vec3 posNext = floor(pos/gridSpacing)*gridSpacing;

  pos = mix(pos, posNext, max(xMorph, yMorph));

  // float noise  = 0.5*snoise(vec4(pos*2.0, 0.0003));
  //       noise += 0.25*snoise(vec4(pos*4.0, 0.0003));
  //       noise += 0.125*snoise(vec4(pos*8.0, 0.0003));
  //       noise += 0.0625*snoise(vec4(pos*16.0, 0.0003));

  // Calculate uvs (static uvs in final version + re-render texture instead?)
  uVu = (pos.xy/terrainDims + 1.0)*0.5;

  // Fetch height
  pos.z += texture2D(heightmap, uVu).x*terrainDims.x*0.1;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos, 1.0);
}
