export const post = () => ({

  id: 'post2',

  uniformTypes: {
    resolution    : 'vec2',
    cameraPosition: 'vec3',
    postPos       : 'vec2'
  },

  vert: /* glsl */`#version 300 es

    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_textureCoord;
    uniform   vec2  resolution;
    uniform   vec3  cameraPosition;
    uniform   vec2  postPos;
    out vec2 u_position;
    out vec2 u_textureCoord;

    const float SCALE = 16.;

    void main(void){
      float zoom = cameraPosition.z/2.;
      float aspect = resolution.y / resolution.x;
      vec2 a = (1.0 < aspect) ? vec2(1.0, 1.0 / aspect) : vec2(aspect, 1.0);
      u_textureCoord = a_textureCoord;
      u_position = resolution;
      gl_Position = vec4(a*(SCALE*a_position.xy - cameraPosition.xy + postPos)/zoom, 1.0, 1.0);
    }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;

    in vec2 u_textureCoord;
    out vec4 outColor;

    void main(void){
      vec2 center = vec2(0.5, 0.5);
      vec2 p = u_textureCoord;
      float point = .00000005 / pow((length(center - p)),4.);
      outColor = vec4(vec3(point), 1.);
    }`

})