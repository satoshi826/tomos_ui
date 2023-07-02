export const test = () => ({

  uniformTypes: {
    color         : 'vec4',
    resolution    : 'vec2',
    mouse         : 'vec2',
    time          : 'float',
    cameraPosition: 'vec3',
  },

  frag: /* glsl */`#version 300 es
    precision highp float;

    uniform   float time;
    uniform   vec4  color;
    uniform   vec2  resolution;
    uniform   vec2  mouse;
    uniform   vec3  cameraPosition;

    out vec4 outColor;

    void main(void){

      float pi = acos(-1.);
      vec3 base = vec3(0.1, 0.1, 0.12);

      float aspect = resolution.x / resolution.y;
      vec2 a = (1.0 < aspect) ? vec2(aspect, 1.0) : vec2(1.0, 1.0 / aspect);

      float baseScale = cameraPosition.z;

      vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
      vec2 currentP = (baseScale * .5 * p) + cameraPosition.xy;

      vec2 m = vec2(a.x * mouse.x, a.y * mouse.y);
      vec2 movedP = p + vec2(cameraPosition.x, cameraPosition.y);


      float scale =   baseScale * .5;
      float scaleLog = log2(scale);

      // float gridV = smoothstep(1. - 0.1 * scaleLog , 1.0, pow(cos(scale * currentP.x / pi), 8.0));
      // float gridH = smoothstep(1. - 0.1 * scaleLog , 1.0, pow(cos(scale * currentP.y / pi), 8.0));
      // float grid = 0.25 * ( gridV + gridH );

      float gridV = smoothstep(0.9, .95, abs(2.*fract(currentP.x)-1.));
      float gridH = smoothstep(0.9, .95, abs(2.*fract(currentP.y)-1.));
      float grid = 0.25 *(gridV+gridH);

      // float scale2 = baseScale  * 10.;
      // float scaleLog2 = log2(scale);

      // float gridV2 = smoothstep(1. - 0.1 * scaleLog2 , 1.0, pow(cos(scale2 * (5.0 * movedP.x / pi)), 8.0));
      // float gridH2 = smoothstep(1. - 0.1 * scaleLog2 , 1.0, pow(cos(scale2 * (5.0 * movedP.y / pi)), 8.0));
      // float grid2 = 0.25 * ( gridV2 + gridH2 );


      float point = 10. / (pow(baseScale, 2.) * length(m - p));
      // float point2 = .2 / (baseScale * length(m + p));


      // float sum = point + grid + grid2;
      float sum = grid+point;

      outColor = vec4(vec3(sum), 0.5);
    }`,

})