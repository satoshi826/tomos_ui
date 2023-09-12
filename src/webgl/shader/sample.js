export const sample = () => ({
  id  : 'sample',
  vert: /* glsl */`#version 300 es
  layout(location = 0) in vec3 a_position;
  void main(void){
    gl_Position = vec4(a_position, 1.0);
  }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;
    out vec4 outColor;
    void main(void){
      outColor = vec4(vec3(.5), 1.);
    }`

})