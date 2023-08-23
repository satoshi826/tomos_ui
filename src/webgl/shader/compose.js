export const compose = () => ({

  id: 'compose',

  uniformTypes: {
    u_gridTexture : 'int',
    u_postsTexture: 'int'
  },

  vert: /* glsl */`#version 300 es
  layout(location = 0) in vec3 a_position;
  layout(location = 1) in vec2 a_textureCoord;
  out vec2 o_textureCoord;

  void main(void){
    o_textureCoord = a_textureCoord;
    gl_Position = vec4(a_position, 1.0);
  }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;
    uniform sampler2D u_gridTexture;
    uniform sampler2D u_postsTexture;
    in vec2 o_textureCoord;
    out vec4 outColor;

    void main(void){
      vec3 gTex = texture(u_gridTexture, o_textureCoord).rgb;
      vec3 pTex = texture(u_postsTexture, o_textureCoord).rgb;
      vec3 mixed = gTex+pTex;
      vec3 toneMapped = vec3(
        mixed.r/(1.+mixed.r),
        mixed.g/(1.+mixed.g),
        mixed.b/(1.+mixed.b)
      );
      outColor = vec4(toneMapped, 1.);
    }`

})