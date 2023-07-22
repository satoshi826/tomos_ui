export const test = () => ({

  uniformTypes: {
    resolution    : 'vec2',
    mouse         : 'vec2',
    cameraPosition: 'vec3',
    lightPos      : 'vec2',
  },

  frag: /* glsl */`#version 300 es
    precision highp float;

    uniform   vec2  resolution;
    uniform   vec2  mouse;
    uniform   vec3  cameraPosition;
    uniform   vec2  lightPos;

    out vec4 outColor;

    float log10(float x){
      return log2(x) / log2(10.0);
    }

    float grid(vec2 p, float unit, float scale){
      float unitLog = log10(unit);
      float scaleLog = log10(scale);
      float gridPower = max((2.+unitLog-scaleLog)*.5, .0);
      float gridV = smoothstep(1.-(scale*.004/unit), 1., abs(2./unit*mod(p.x,unit)-1.));
      float gridH = smoothstep(1.-(scale*.004/unit), 1., abs(2./unit*mod(p.y,unit)-1.));
      return .25*gridPower*(gridV+gridH);
    }

    void main(void){

      float pi = acos(-1.);

      float aspect = resolution.x / resolution.y;
      vec2 a = (1.0 < aspect) ? vec2(aspect, 1.0) : vec2(1.0, 1.0 / aspect);

      float baseScale = cameraPosition.z;

      float baseLog = log10(baseScale);
      float light = (.1-.01*baseLog);

      vec3 base = vec3(light);

      vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
      vec2 currentP = (baseScale * .5 * p) + cameraPosition.xy;

      vec2 m = vec2(a.x * mouse.x, a.y * mouse.y);
      vec2 movedP = p + vec2(cameraPosition.x, cameraPosition.y);

      float grid1 = grid(currentP,1.,baseScale);
      float grid2 = grid(currentP,10.,baseScale);
      float grid3 = grid(currentP,100.,baseScale);
      float grid4 = grid(currentP,1000.,baseScale);

      float point2 = baseScale * 01. / (pow(baseScale, 2.) * length(lightPos - currentP));

      float sum = grid4+grid3+grid2+grid1+point2;
      outColor = vec4(vec3(sum+base), 0.5);
    }`,

})