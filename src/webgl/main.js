import {Vao} from '../../lib/glFrag/Vao'
import {Program} from '../../lib/glFrag/Program'
import {Renderer, rgba8} from '../../lib/glFrag/Renderer'
import {Animation} from '../../lib/glFrag/Animation'
import {setHandler, sendState} from '../../lib/glFrag/state'

import {grid} from './shader/grid'
import {post} from './shader/post'
import {compose} from './shader/compose'
import {plane} from './shape'

export async function main(core) {

  initGl(core.gl)

  const planeVAO = new Vao(core, {...plane()})
  const postVAO = new Vao(core, {
    ...plane(),
    id                 : 'post',
    instancedAttributes: post().instancedAttributes,
    maxInstance        : 100000
  })


  const gridP = new Program(core, grid())
  const postP = new Program(core, post())

  const gridRenderer = new Renderer(core, {frameBuffer: [rgba8]})
  const postsRenderer = new Renderer(core, {frameBuffer: [rgba8], pixelRatio: core.pixelRatio * 0.25})
  const renderer = new Renderer(core)

  const composeP = new Program(core, {...compose(),
    texture: {
      u_gridTexture : gridRenderer.renderTexture[0],
      u_postsTexture: postsRenderer.renderTexture[0]
    }})

  setHandler('cameraPosition', (cameraPosition) => {
    [gridP, postP].forEach(async(program) => program.set({cameraPosition}))
  })

  setHandler('posts', (posts) => {
    postVAO.setInstancedValues({
      a_instance_postPos: posts
    })
  })

  const animation = new Animation({callback: () => {
    gridRenderer.clear()
    gridRenderer.render(planeVAO, gridP)
    postsRenderer.clear()
    postsRenderer.render(postVAO, postP)
    renderer.render(planeVAO, composeP)
  }, interval: 0})

  animation.start()
  setInterval(() => sendState({drawTime: Number(animation.drawTime).toFixed(2) + ' ms', fps: Number(1000 / animation.delta).toFixed(2)}), 200)
}


// setHandler('mouse', (mouse) => {
//   const x = mouse?.x ?? 0
//   const y = mouse?.y ?? 0
//   testF.set({mouse: [x, y]})
// })

const initGl = (gl) => {
  gl.disable(gl.DEPTH_TEST)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE)
  gl.depthMask(false)
  gl.colorMask(true, true, true, false)
}