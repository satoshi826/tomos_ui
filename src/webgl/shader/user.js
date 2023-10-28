export const user = () => ({

  id  : 'user',

  uniformTypes: {
    resolution    : 'vec2',
    cameraPosition: 'vec3'
  },

  vert: /* glsl */`#version 300 es
  layout(location = 0) in vec3 a_position;
  uniform   vec2  resolution;
  uniform   vec3  cameraPosition;
  void main(void){

    vec2 pos = vec2(0.,0.);

    float zoom = cameraPosition.z/2.;
    float aspect = resolution.y / resolution.x;
    float scale = .25;
    float cZoom = clamp(zoom, 2., 6.);
    vec2 a = (1.0 < aspect) ? vec2(1.0, 1.0 / aspect) : vec2(aspect, 1.0);
    gl_Position =  vec4(a*(2.*scale*a_position.xy * (zoom/cZoom) - cameraPosition.xy + pos)/zoom, 1.0, 1.0);
  }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;
    out vec4 outColor;
    void main(void){
      outColor = vec4(vec3(.5,.5,1.), 1.);
    }`

})