import {keys, oMapO, oForEach} from '../util/index'

export class Program {

  constructor(core, {id, uniformTypes, frag, vert, texture} = {}) {
    this.core = core
    this.id = id
    this.vert = vert
    this.frag = frag
    this.uniforms = oMapO(uniformTypes, ([key, type]) => [key, {type, value: null}])
    this.texture = []

    if (!core.program[id]) {
      this.core.setProgram(id, this.vert, this.frag)
      this.core.setUniLoc(id, keys(uniformTypes))
    }

    if(texture) {
      oForEach(texture, (([uniform, data], i) => {
        const textureNum = core.setTexture(uniform, data)
        this.uniforms[uniform] = {type: 'int', value: textureNum}
        this.texture[i] = uniform
      }))
    }

  }

  set(uniformValues) {
    oForEach(uniformValues, ([k, v]) => {
      this.uniforms[k].value = v
    })
  }
}
