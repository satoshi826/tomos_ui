export const sample = () => ({

  id: 'sample',

  uniformTypes: {
  },

  frag: /* glsl */`#version 300 es
    precision highp float;
    out vec4 outColor;
    void main(void){
      outColor = vec4(0.,0.,0.1,1.);
    }`

})