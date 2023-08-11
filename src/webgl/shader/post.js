export const post = () => ({

  id: 'post',

  uniformTypes: {
    resolution    : 'vec2',
    cameraPosition: 'vec3',
    postPos       : 'vec2'
  },

  frag: /* glsl */`#version 300 es
    precision highp float;

    uniform   vec2  resolution;
    uniform   vec3  cameraPosition;
    uniform   vec2  postPos;

    out vec4 outColor;

    void main(void){
      float scale = cameraPosition.z;
      vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
      vec2 currentP = (scale * .5 * p) + cameraPosition.xy;
      float point = .1 / (length(postPos - currentP));
      point = (point < 0.002) ? 0. : point;
      outColor = vec4(vec3(point), 1.);
    }`

})