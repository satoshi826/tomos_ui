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
    out vec2 o_textureCoord;

    const float SCALE = .5;

    void main(void){
      float zoom = cameraPosition.z/2.;
      float aspect = resolution.y / resolution.x;
      vec2 a = (1.0 < aspect) ? vec2(1.0, 1.0 / aspect) : vec2(aspect, 1.0);
      o_textureCoord = a_textureCoord;
      gl_Position = vec4(a*(SCALE*a_position.xy - cameraPosition.xy + postPos)/zoom, 1.0, 1.0);
    }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;

    in vec2 o_textureCoord;
    out vec4 outColor;

    void main(void){
      vec2 center = vec2(0.5, 0.5);
      vec2 p = o_textureCoord;
      float point = .0005 / pow((length(center - p)),4.);
      outColor = vec4(vec3(point), 1.);
    }`

})