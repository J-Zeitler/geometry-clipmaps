precision mediump float;

uniform sampler2D heightmap;
uniform float scale;
uniform vec2 offset;
uniform vec2 midPos;
uniform vec2 terrainDims;
uniform float tileRes;
uniform float morphFactor;

varying vec3 pos;
varying vec2 uVu;

void main() {

  // Position tiles in x,y-plane
  pos = position*scale;
  pos.xy += midPos + offset;

  // snap tiles to grid
  float gridSpacing = scale/tileRes;
  pos = floor(pos/gridSpacing)*gridSpacing;

  // Calculate uvs
  uVu = (pos.xy/terrainDims + 1.0)*0.5;

  // float noise  = 0.5*snoise(vec4(pos*2.0, 0.0003));
  //       noise += 0.25*snoise(vec4(pos*4.0, 0.0003));
  //       noise += 0.125*snoise(vec4(pos*8.0, 0.0003));
  //       noise += 0.0625*snoise(vec4(pos*16.0, 0.0003));

  // Fetch height
  pos.z += texture2D(heightmap, uVu).x*terrainDims.x*0.1;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos, 1.0);
}
