export const post = () => ({

  id: 'post',

  uniformTypes: {
    resolution    : 'vec2',
    cameraPosition: 'vec3'
  },

  instancedAttributes: [
    'a_instance_postPosition',
    'a_instance_postLuminance'
  ],

  vert: /* glsl */`#version 300 es

    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec2 a_textureCoord;
    layout(location = 2) in vec2 a_instance_postPosition;
    layout(location = 3) in float a_instance_postLuminance;
    uniform   vec2  resolution;
    uniform   vec3  cameraPosition;
    out vec2 o_textureCoord;
    out float o_postLuminance;

    void main(void){
      float zoom = cameraPosition.z/2.;
      float aspect = resolution.y / resolution.x;
      float scale = .25;
      vec2 a = (1.0 < aspect) ? vec2(1.0, 1.0 / aspect) : vec2(aspect, 1.0);
      o_textureCoord = a_textureCoord;
      o_postLuminance = a_instance_postLuminance;
      vec2 postPosition = a_instance_postPosition - .5*sign(a_instance_postPosition);
      gl_Position = vec4(a*(2.*scale*a_position.xy - cameraPosition.xy + postPosition)/zoom, 1.0, 1.0);
    }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;

    in vec2 o_textureCoord;
    in float o_postLuminance;
    out vec4 outColor;

    const vec2 CENTER = vec2(.5);

    float logY(float y, float x){
      return log2(x) / log2(y);
    }

    void main(void){
      float len = length(CENTER - o_textureCoord);
      float point = (0.1+logY(10.,o_postLuminance+1.))*(1.-smoothstep(.4, .5, len));
      outColor = vec4(vec3(point),1.);
    }`

})