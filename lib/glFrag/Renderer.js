import {setHandler} from './state'

export const rgba8 = ['RGBA', 'RGBA', 'UNSIGNED_BYTE', 'LINEAR']
export const rgba16f = ['RGBA16F', 'RGBA', 'HALF_FLOAT', 'LINEAR']
export const rgba32f = ['RGBA32F', 'RGBA', 'FLOAT', 'LINEAR']
export const depth = ['DEPTH_COMPONENT16', 'DEPTH_COMPONENT', 'UNSIGNED_SHORT', 'NEAREST']

let id = 0

export class Renderer {

  constructor(core, {height, width, backgroundColor, frameBuffer, pixelRatio, isScreen = true} = {}) {
    this.id = id++
    this.core = core
    this.pixelRatio = this.core.pixelRatio * (pixelRatio ?? 1)
    this.width = width ?? core.canvasWidth
    this.height = height ?? core.canvasHeight
    this.resizeQueue = null
    this.backgroundColor = backgroundColor ?? [0, 0, 0, 1]
    this.preRenderQueue = {}
    this.drawCalls = 0

    this.isCanvas = !frameBuffer
    this.frameBuffer = null
    this.renderTexture = []
    this.drawBuffers = [this.core.gl.BACK]

    if (frameBuffer) this.setFrameBuffer(frameBuffer)
    if (isScreen) setHandler('resize', (v) => this.resizeQueue = v)
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
    this.resizeQueue = null
  }

  clear() {
    this.core.useRenderer(this)
    this.core.gl.clearColor(...this.backgroundColor)
    this.core.gl.clearDepth(1.0)
    this.core.gl.clear(this.core.gl.COLOR_BUFFER_BIT | this.core.gl.DEPTH_BUFFER_BIT)
  }

  render(vao, program) {
    if (this.resizeQueue) this.resize(this.resizeQueue)
    this.core.useVao(vao.id)
    this.core.useRenderer(this)
    this.core.useProgram(program.id)
    this.core.setUniforms(program.uniforms)
    if (program.texture.length) {
      program.texture.forEach((tex) => {
        this.core.useTexture(tex)
      })
    }
    if (program.uniforms.resolution) program.set({resolution: [this.width * this.pixelRatio, this.height * this.pixelRatio]})
    if (vao.instancedCount) {
      this.core.renderInstanced(vao.instancedCount)
    }else{
      this.core.render()
    }
    this.drawCalls += 1
  }

  setFrameBuffer(textures) {
    const gl = this.core.gl

    this.frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)

    this.renderTexture = []
    textures.forEach(([internalFormat, format, type, filter], i) => {
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

}