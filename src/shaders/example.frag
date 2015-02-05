precision mediump float;

uniform sampler2D heightmap;
uniform sampler2D normalmap;
uniform float scale;

varying vec3 pos;
varying vec2 uVu;

void main() {
  vec3 lightPos = normalize(vec3(1.0, 1.0, 1.0));
  vec3 normal = normalize(texture2D(normalmap, uVu).xyz);

  float illumination = dot(lightPos, normal);

  // gl_FragColor = vec4(illumination*0.5, illumination*0.4, illumination*0.3, 1.0);
  // gl_FragColor = texture2D(heightmap, uVu);
  gl_FragColor = vec4(sin(scale), cos(1.0 - scale*2.0), sin(scale*999999.0) + 0.5, 1.0);
}
