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

    float log10(float x){
      return log2(x) / log2(10.0);
    }

    void main(void){

      float aspect = resolution.x / resolution.y;
      vec2 a = (1.0 < aspect) ? vec2(aspect, 1.0) : vec2(1.0, 1.0 / aspect);

      float scale = cameraPosition.z;

      vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
      vec2 currentP = (scale * .5 * p) + cameraPosition.xy;

      float scaleLog = log10(scale);
      float point = .1 / (scaleLog * length(postPos - currentP));
      outColor = vec4(vec3(point), 1.);
    }`

})