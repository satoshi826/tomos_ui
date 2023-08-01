import {setHandler} from './state'

let id = 0

export class Renderer {

  constructor(core, {height, width, backgroundColor, frameBuffer, pixelRatio, isScreen = true} = {}) {

    this.id = id++
    this.core = core
    this.pixelRatio = pixelRatio ?? this.core.pixelRatio
    this.width = width ?? core.canvasWidth
    this.height = height ?? core.canvasHeight
    this.backgroundColor = backgroundColor ?? [0, 0, 0, 1]

    this.isCanvas = !frameBuffer
    this.frameBuffer = null
    this.renderTexture = []
    this.drawBuffers = [this.core.gl.BACK]

    if (!this.core.vao.plane) this.setPlane()
    if (frameBuffer) this.setFrameBuffer(frameBuffer)
    if (isScreen) setHandler('resize', this.resize.bind(this))
  }

  resize({width = this.width, height = this.height, pixelRatio = this.pixelRatio} = {}) {
    const gl = this.core.gl
    this.width = width
    this.height = height
    gl.viewport(0, 0, width * pixelRatio, height * pixelRatio)
    if(this.isCanvas) {
      gl.canvas.width = width * pixelRatio
      gl.canvas.height = height * pixelRatio
    }else {
      this.renderTexture.forEach((renderTexture) => {
        const {internalFormat, format, type} = renderTexture
        gl.bindTexture(gl.TEXTURE_2D, renderTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl[internalFormat], width * pixelRatio, height * pixelRatio, 0, gl[format], gl[type], null)
        gl.bindTexture(gl.TEXTURE_2D, null)
      })
      gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    }
  }

  clear() {
    this.core.gl.clearColor(...this.backgroundColor)
    this.core.gl.clearDepth(1.0)
    this.core.gl.clear(this.core.gl.COLOR_BUFFER_BIT | this.core.gl.DEPTH_BUFFER_BIT)
  }

  render(frags) {
    this.core.useRenderer(this)
    this.clear()
    frags.forEach((frag) => {
      this.core.useProgram(frag.id)
      this.core.setUniforms(frag.uniforms)
      if (frag.uniforms.resolution) {
        frag.set({resolution: [this.width * this.pixelRatio, this.height * this.pixelRatio]})
      }
    })
    this.core.render()
  }

  setFrameBuffer({texture}) {
    const gl = this.core.gl

    this.frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)

    this.renderTexture = []
    texture.forEach(([internalFormat, format, type, filter], i) => {
      const attachment = gl.COLOR_ATTACHMENT0 + i
      this.renderTexture[i] = this.core.createTexture(this.width, this.height, internalFormat, format, type, filter)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, this.renderTexture[i], 0)
      this.renderTexture[i].internalFormat = internalFormat
      this.renderTexture[i].format = format
      this.renderTexture[i].type = type
      this.drawBuffers[i] = attachment
    })

    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  setPlane() {
    const a_position = [
      -1.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
      -1.0, -1.0, 0.0,
      1.0, -1.0, 0.0
    ]

    const index = [
      2, 1, 0,
      1, 2, 3
    ]

    this.core.setVao({
      id        : 'plane',
      index,
      attributes: {a_position}
    })

    this.core.useVao('plane')
  }
}