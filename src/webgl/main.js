import {Vao} from '../../lib/glFrag/Vao'
import {Program} from '../../lib/glFrag/Program'
import {Renderer, rgba16f} from '../../lib/glFrag/Renderer'
import {Animation} from '../../lib/glFrag/Animation'
import {setHandler, sendState} from '../../lib/glFrag/state'

import {grid} from './shader/grid'
import {post} from './shader/post'
import {postLight} from './shader/postLight'
import {user} from './shader/user'
import {compose} from './shader/compose'
import {plane, arrow} from './shape'

export async function main(core) {

  initGl(core.gl)

  const planeVAO = new Vao(core, plane())
  const postVAO = new Vao(core, {
    ...plane(),
    id                 : 'post',
    instancedAttributes: post().instancedAttributes,
    maxInstance        : 50000
  })

  const userVAO = new Vao(core, {
    ...arrow(),
    id                 : 'user',
    instancedAttributes: user().instancedAttributes,
    maxInstance        : 500
  })

  const gridP = new Program(core, grid())
  const postP = new Program(core, post())
  const postLightP = new Program(core, postLight())
  const userP = new Program(core, user())

  const basePixelRatio = ((core.pixelRatio > 1) ? 0.5 : 1) * core.pixelRatio

  const gridRenderer = new Renderer(core, {frameBuffer: [rgba16f], pixelRatio: basePixelRatio})
  const postsRenderer = new Renderer(core, {frameBuffer: [rgba16f], pixelRatio: basePixelRatio * 0.5})
  const postLightsRenderer = new Renderer(core, {frameBuffer: [rgba16f], pixelRatio: basePixelRatio * 0.06125})

  const renderer = new Renderer(core)

  const composeP = new Program(core, {...compose(),
    texture: {
      u_gridTexture      : gridRenderer.renderTexture[0],
      u_postsTexture     : postsRenderer.renderTexture[0],
      u_postLightsTexture: postLightsRenderer.renderTexture[0]
    }})

  setHandler('cameraPosition', (cameraPosition) => {
    [gridP, postP, postLightP, userP].forEach((program) => program.set({cameraPosition}))
  })

  setHandler('mouse', (mouse) => {
    gridP.set({mouse})
  })

  setHandler('posts', (posts) => {
    postVAO.setInstancedValues({
      a_instance_postPosition: posts
    })
  })

  setHandler('lums', (lums) => {
    postVAO.setInstancedValues({
      a_instance_postLuminance: lums
    })
  })

  setHandler('users', (users) => {
    userVAO.setInstancedValues({
      a_instance_userPosition: users
    })
  })

  const animation = new Animation({callback: () => {

    gridRenderer.clear()
    gridRenderer.render(planeVAO, gridP)
    gridRenderer.renderInstanced(userVAO, userP)

    postsRenderer.clear()
    postsRenderer.renderInstanced(postVAO, postP)

    postLightsRenderer.clear()
    postLightsRenderer.renderInstanced(postVAO, postLightP)

    renderer.render(planeVAO, composeP)
  }, interval: 0})

  animation.start()
  setInterval(() => sendState({drawTime: Number(animation.drawTime).toFixed(2) + ' ms', fps: Number(1000 / animation.delta).toFixed(2)}), 200)
}


const initGl = (gl) => {
  gl.disable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE)
  gl.depthMask(false)
  gl.getExtension('EXT_color_buffer_float')
  gl.getExtension('EXT_float_blend')
  gl.getExtension('OES_texture_half_float')
  gl.getExtension('OES_texture_half_float_linear')
  gl.getExtension('OES_texture_float')
  gl.getExtension('OES_texture_float_linear')
  gl.getExtension('WEBGL_color_buffer_float')
}