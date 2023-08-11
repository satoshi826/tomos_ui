import {oForEach, keys} from '../util/index'

export class Core {

  program = {} // {<id> : <program>}
  vao = {} // {<id> : <vao>}
  uniLoc = {} // {<programId> : {<uniformName> : <location>}}
  texture = {} // {<name> : {data, number}}

  currentProgram = null
  currentVao = null
  currentRenderer = null

  constructor({canvas, pixelRatio}) {

    this.gl = canvas.getContext('webgl2')

    this.canvasWidth = this.gl.canvas.width
    this.canvasHeight = this.gl.canvas.height
    this.pixelRatio = pixelRatio

    this.gl.enable(this.gl.CULL_FACE)

    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE)

    // this.gl.enable(this.gl.DEPTH_TEST)
    // this.gl.depthFunc(this.gl.LEQUAL)
  }

  _compile(txt, type) {
    let shader = this.gl.createShader(this.gl[`${type}_SHADER`])
    this.gl.shaderSource(shader, txt)
    this.gl.compileShader(shader)
    if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) return shader
    const log = this.gl.getShaderInfoLog(shader)
    console.error('compile error')
    console.error(log)
  }

  _link(v, f) {
    let program = this.gl.createProgram()
    this.gl.attachShader(program, v)
    this.gl.attachShader(program, f)
    this.gl.linkProgram(program)
    if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) return program
    const log = this.gl.getShaderInfoLog(program)
    console.error(log)
  }

  setProgram(id, vText, fText) {
    const shaderV = this._compile(vText, 'VERTEX')
    const shaderF = this._compile(fText, 'FRAGMENT')
    const prg = this._link(shaderV, shaderF)
    this.program[id] = prg
  }

  useProgram(id) {
    if (id !== this.currentProgram) {
      this.gl.useProgram(this.program[id])
      this.currentProgram = id
    }
  }

  setVao({id, index, attributes}) {
    let vao = this.gl.createVertexArray()
    this.gl.bindVertexArray(vao)
    oForEach(attributes, ([k, v]) => {
      if (v === undefined) return
      let vbo = this.gl.createBuffer()
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(v), this.gl.STATIC_DRAW)
      this.enableAttribute(k)
    })
    if(index) {
      let ibo = this.gl.createBuffer()
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo)
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), this.gl.STATIC_DRAW)
    }
    this.gl.bindVertexArray(null)
    this.vao[id] = vao
    this.vao[id].count = index.length
  }

  enableAttribute(att) {
    const isUnitAtt = typeof strideMap[att] === 'number'
    if (isUnitAtt) {
      this.gl.enableVertexAttribArray(attLocMap[att])
      this.gl.vertexAttribPointer(attLocMap[att], strideMap[att], this.gl.FLOAT, 0, 0, 0)
    }else{
      const row = strideMap[att][0]
      const col = strideMap[att][1]
      for (let i = 0; i < row; i++) {
        this.gl.enableVertexAttribArray(attLocMap[att] + i)
        this.gl.vertexAttribPointer(attLocMap[att] + i, col, this.gl.FLOAT, 0, row * col * 4, i * col * 4)
      }
    }
  }

  useVao(id) {
    if (id !== this.currentVao) {
      this.gl.bindVertexArray(this.vao[id])
      this.currentVao = id
    }
  }

  setUniLoc(id, uniforms) {
    this.uniLoc[id] = {}
    uniforms.forEach(uni => this.uniLoc[id][uni] = this.gl.getUniformLocation(this.program[id], uni))
  }

  setUniforms(uniforms) {
    oForEach(uniforms, ([k, {type, value}]) => {
      if(value === undefined || value === null) return
      const [method, isMat] = uniMethodMap[type]
      const params = isMat ? [false, value] : [value]
      this.gl[method](this.uniLoc[this.currentProgram][k], ...params)
    })
  }

  render() {
    this.gl.drawElements(this.gl.TRIANGLES, this.vao[this.currentVao].count, this.gl.UNSIGNED_SHORT, 0)
  }

  useRenderer({id, pixelRatio, width, height, frameBuffer, drawBuffers}) {
    if (id !== this.currentRenderer) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer)
      this.gl.drawBuffers(drawBuffers)
      this.gl.viewport(0, 0, width * pixelRatio, height * pixelRatio)
      this.currentRenderer = id
    }
  }

  createTexture(width, height, internalFormat, format, type, filter) {
    const texture = this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl[internalFormat], width / 2, height / 2, 0, this.gl[format], this.gl[type], null)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl[filter])
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl[filter])
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
    this.gl.bindTexture(this.gl.TEXTURE_2D, null)
    return texture
  }

  setTexture(key, data) {
    if(this.texture[key]) {
      this.texture[key] = {...this.texture[key], data}
      return this.texture[key].textureNum
    }
    const textureNum = keys(this.texture).length
    this.texture[key] = {data, number: textureNum}
    return new Number(textureNum)
  }

  useTexture(key) {
    const {data, number} = this.texture[key]
    if (data) {
      this.gl.activeTexture(this.gl[`TEXTURE${number}`])
      this.gl.bindTexture(this.gl.TEXTURE_2D, data)
    }
  }
}

//------------------------------------------------------------------------------

export const strideMap = {
  a_position: 3
}

const attLocMap = {
  a_position: 0
}

const uniMethodMap = {
  float: ['uniform1f', false],
  int  : ['uniform1i', false],
  vec2 : ['uniform2fv', false],
  vec3 : ['uniform3fv', false],
  vec4 : ['uniform4fv', false],
  mat4 : ['uniformMatrix4fv', true]
}

//------------------------------------------------------------------------------
