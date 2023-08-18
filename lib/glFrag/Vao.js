import {aToO, oForEach} from '../util'
export class Vao {

  constructor(core, {id, position, normal, textureCoord, index, instancedAttributes, maxInstance} = {}) {
    this.core = core
    this.id = id
    this.position = position
    this.normal = normal
    this.textureCoord = textureCoord
    this.index = index

    this.maxInstance = maxInstance ?? 1000
    this.instancedAttributes = instancedAttributes
      ? aToO(instancedAttributes, (att) => [att, {array: null, vbo: null}])
      : null

    this.instancedCount = null

    this.core.setVao({
      id        : this.id,
      index     : this.index,
      attributes: {
        a_position    : this.position,
        a_textureCoord: this.textureCoord
      }
    })
  }

  setInstancedValues(instancedValue) {
    oForEach(instancedValue, (([att, value]) => {
      const strideSize = this.core.getStrideSize(att)
      this.instancedAttributes[att].array ??= new Float32Array(this.maxInstance * strideSize)
      this.instancedCount = value.length / strideSize
      for (let i = 0; i < value.length; i++) this.instancedAttributes[att].array[i] = value[i]
      this.instancedAttributes[att].vbo ??= this.core.createInstancedVbo(this.id, att, this.instancedAttributes[att].array)
      this.core.updateInstancedVbo(this.id, att, this.instancedAttributes[att].array, this.instancedAttributes[att].vbo)
    }))
  }
}

