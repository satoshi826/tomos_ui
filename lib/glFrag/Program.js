import {keys, oMapO, oForEach} from '../util/index'

export class Program {

  constructor(core, {id, uniformTypes, frag} = {}) {
    this.core = core
    this.id = id
    this.frag = frag
    this.uniforms = oMapO(uniformTypes, ([key, type]) => [key, {type, value: null}])

    if (!core.program[id]) {
      this.core.setProgram(id, VERT, this.frag)
      this.core.setUniLoc(id, keys(uniformTypes))
    }
  }

  set(uniformValues) {
    oForEach(uniformValues, ([k, v]) => {
      this.uniforms[k].value = v
    })
  }
}

//----------------------------------------------------------------

const VERT = /* glsl */`#version 300 es
layout(location = 0) in vec3 a_position;
void main(void){
  gl_Position = vec4(a_position, 1.0);
}
`