export const grid = () => ({

  id: 'grid',

  uniformTypes: {
    resolution    : 'vec2',
    cameraPosition: 'vec3',
    mouse         : 'vec2'
  },

  vert: /* glsl */`#version 300 es
  layout(location = 0) in vec3 a_position;
  void main(void){
    gl_Position = vec4(a_position, 1.0);
  }
  `,

  frag: /* glsl */`#version 300 es
    precision highp float;

    uniform   vec2  resolution;
    uniform   vec3  cameraPosition;
    uniform   vec2  mouse;
    out vec4 outColor;

    const float GRID_POWER = 2.0;
    const float GRID_WIDTH = .004;

    float log10(float x){
      return log2(x) / log2(10.0);
    }

    float grid(vec2 p, float unit, float scale){
      float unitLog = log10(unit);
      float scaleLog = log10(scale);
      float gridPower = max((GRID_POWER+unitLog-scaleLog)*.75, .0);
      float gridV = smoothstep(1.-(scale*GRID_WIDTH/unit), 1., abs(2./unit*mod(p.x,unit)-1.));
      float gridH = smoothstep(1.-(scale*GRID_WIDTH/unit), 1., abs(2./unit*mod(p.y,unit)-1.));
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

    float getRect(vec2 currentP, vec2 mousePosSteped, float scale){
      float margin = scale*.5;
      float rect =
      2.*step(1.5, smoothstep(.47, 1.-abs(mousePosSteped.x+margin-currentP.x), 1.)+smoothstep(.47, 1.-abs(mousePosSteped.y+margin-currentP.y), 1.)
                -0.5*(smoothstep(.52, 1.-abs(mousePosSteped.x+margin-currentP.x), 1.)+smoothstep(.52, 1.-abs(mousePosSteped.y+margin-currentP.y), 1.)) );
      return rect;
    }

    void main(void){

      float aspect = resolution.x / resolution.y;
      vec2 a = (1.0 < aspect) ? vec2(aspect, 1.0) : vec2(1.0, 1.0 / aspect);
      float scale = cameraPosition.z;
      vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
      vec2 currentP = (scale * .5 * p) + cameraPosition.xy;
      float grids = getGrids(currentP, scale);

      vec2 aspectedMouse = a*mouse;
      vec2 mousePos = (aspectedMouse * scale * .5) + cameraPosition.xy;
      vec2 mousePosSteped = floor(mousePos);
      float rect = getRect(currentP, mousePosSteped, 1.);
      float rect2 = getRect(currentP, mousePosSteped, 10.);

      outColor = vec4(vec3(grids+rect+rect2), 1.);
    }`

})