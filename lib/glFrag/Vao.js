
export class Vao {

  constructor(core, {id, position, normal, textureCoord, index, instancedAttributes} = {}) {
    this.core = core
    this.id = id
    this.position = position
    this.normal = normal
    this.textureCoord = textureCoord
    this.index = index

    this.instancedAttributes = instancedAttributes ?? null

    this.core.setVao({
      id        : this.id,
      index     : this.index,
      attributes: {
        a_position    : this.position,
        a_textureCoord: this.textureCoord
      }
    })
  }
}

