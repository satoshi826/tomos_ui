export const post = () => ({

  id: 'post',

  uniformTypes: {
    resolution    : 'vec2',
    cameraPosition: 'vec3',
    postPos       : 'vec2'
  },

  vert: /* glsl */`#version 300 es

    layout(location = 0) in vec3 a_position;
    uniform   vec2  resolution;
    uniform   vec3  cameraPosition;
    uniform   vec2  postPos;

    void main(void){
      float scale = cameraPosition.z;
      float aspect = resolution.x / resolution.y;
      vec2 a = (1.0 < aspect) ? vec2(aspect, 1.0) : vec2(1.0, 1.0 / aspect);
      gl_Position = vec4(((a_position.xy- (cameraPosition.xy + postPos))/a)/scale, 1.0, 1.0);
    }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;

    uniform   vec2  resolution;
    uniform   vec3  cameraPosition;
    uniform   vec2  postPos;

    out vec4 outColor;

    void main(void){
      // float scale = cameraPosition.z;
      // vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
      // vec2 currentP = (scale * .5 * p) + cameraPosition.xy;
      // float point = .05 / (length(postPos - currentP));
      // point = (point < 0.005) ? 0. : point;
      outColor = vec4(.1, .1, .1, 1.);
    }`

})