precision mediump float;

uniform sampler2D heightmap;
uniform float scale;
uniform vec2 offset;
uniform vec2 midPos;
uniform vec2 terrainDims;
uniform float tileRes;

varying vec3 pos;
varying vec2 uVu;


void main() {
  // float noise  = 0.5*snoise(vec4(position*2.0, dt*0.0003));
  //       noise += 0.25*snoise(vec4(position*4.0, dt*0.0003));
  //       noise += 0.125*snoise(vec4(position*8.0, dt*0.0003));
  //       noise += 0.0625*snoise(vec4(position*16.0, dt*0.0003));

  // Position tiles in x,y-plane
  pos = position*scale;
  pos.xy += midPos + offset;

  // Calculate uvs
  uVu = (pos.xy/terrainDims + 1.0)*0.5;

  pos.z += texture2D(heightmap, uVu).x*terrainDims.x*0.1;

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(pos, 1.0);
}
