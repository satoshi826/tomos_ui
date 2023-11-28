export const user = () => ({

  id: 'user',

  uniformTypes: {
    resolution    : 'vec2',
    cameraPosition: 'vec3'
  },

  instancedAttributes: [
    'a_instance_userPosition'
  ],


  vert: /* glsl */`#version 300 es
  layout(location = 0) in vec3 a_position;
  layout(location = 4) in vec2 a_instance_userPosition;
  uniform   vec2  resolution;
  uniform   vec3  cameraPosition;
  void main(void){
    float zoom = cameraPosition.z/2.;
    float aspect = resolution.y / resolution.x;
    float scale = .25;
    float cZoom = clamp(zoom, 2., 6.);
    vec2 a = (1.0 < aspect) ? vec2(1.0, 1.0 / aspect) : vec2(aspect, 1.0);
    gl_Position =  vec4(a*(2.*scale*a_position.xy * (zoom/cZoom) - cameraPosition.xy + a_instance_userPosition)/zoom, 1.0, 1.0);
  }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;
    out vec4 outColor;
    void main(void){
      outColor = vec4(vec3(.5,.5,1.), 1.);
    }`

})