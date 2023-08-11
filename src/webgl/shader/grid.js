export const grid = () => ({

  id: 'grid',

  uniformTypes: {
    resolution    : 'vec2',
    cameraPosition: 'vec3'
  },

  frag: /* glsl */`#version 300 es
    precision highp float;

    uniform   vec2  resolution;
    uniform   vec3  cameraPosition;

    out vec4 outColor;

    float log10(float x){
      return log2(x) / log2(10.0);
    }

    float grid(vec2 p, float unit, float scale){
      float unitLog = log10(unit);
      float scaleLog = log10(scale);
      float gridPower = max((2.+unitLog-scaleLog)*.25, .0);
      float gridV = smoothstep(1.-(scale*.01/unit), 1., abs(2./unit*mod(p.x,unit)-1.));
      float gridH = smoothstep(1.-(scale*.01/unit), 1., abs(2./unit*mod(p.y,unit)-1.));
      return .25*gridPower*(gridV+gridH);
    }

    float getGrids(vec2 currentP, float scale){
      float grid1 = grid(currentP,1.,scale);
      float grid2 = grid(currentP,10.,scale);
      float grid3 = grid(currentP,100.,scale);
      float grid4 = grid(currentP,1000.,scale);
      float grids = grid4+grid3+grid2+grid1;
      return grids;
    }

    void main(void){

      float aspect = resolution.x / resolution.y;
      vec2 a = (1.0 < aspect) ? vec2(aspect, 1.0) : vec2(1.0, 1.0 / aspect);

      float scale = cameraPosition.z;
      vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
      vec2 currentP = (scale * .5 * p) + cameraPosition.xy;

      float grids = getGrids(currentP, scale);

      outColor = vec4(vec3(grids), 1.);
    }`

})