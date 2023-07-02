export const test = () => ({

  uniformTypes: {
    resolution    : 'vec2',
    mouse         : 'vec2',
    cameraPosition: 'vec3',
  },

  frag: /* glsl */`#version 300 es
    precision highp float;

    uniform   vec2  resolution;
    uniform   vec2  mouse;
    uniform   vec3  cameraPosition;

    out vec4 outColor;

    float log10(float x){
      return log2(x) / log2(10.0);
    }

    float grid(vec2 p, float unit, float scale){
      float unitLog = log10(unit);
      float gridPower = smoothstep(.01, .99, 1.+max(unitLog,1.) -1.*scale);
      float gridV = smoothstep(.9+.045*unitLog, 1., abs(2./unit*mod(p.x,unit)-1.));
      float gridH = smoothstep(.9+.045*unitLog, 1., abs(2./unit*mod(p.y,unit)-1.));
      return gridPower*(gridV+gridH);
    }

    void main(void){

      vec2 test = vec2(5.,5.);

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
      float scaleLog = log10(baseScale);

      float grid1 = grid(currentP,1.,scaleLog);
      float grid2 = grid(currentP,10.,scaleLog);
      float grid3 = grid(currentP,100.,scaleLog);

      float point = 10. / (pow(baseScale, 2.) * length(m - p));
      float point2 = baseScale * 5. / (pow(baseScale, 2.) * length(test - currentP));

      float sum = grid3+grid2+grid1+point+point2;
      outColor = vec4(vec3(sum), 0.5);
    }`,

})