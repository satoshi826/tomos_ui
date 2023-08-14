
export class Vao {

  constructor(core, {id, position, normal, textureCoord, index} = {}) {
    this.core = core
    this.id = id
    this.position = position
    this.normal = normal
    this.textureCoord = textureCoord
    this.index = index

    this.core.setVao({
      id        : this.id,
      index     : this.index,
      attributes: {a_position: this.position}
    })
  }
}

