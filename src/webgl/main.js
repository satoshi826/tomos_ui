import {Vao} from '../../lib/glFrag/Vao'
import {Program} from '../../lib/glFrag/Program'
import {Renderer} from '../../lib/glFrag/Renderer'
import {Animation} from '../../lib/glFrag/Animation'
import {setHandler, sendState} from '../../lib/glFrag/state'

import {grid} from './shader/grid'
import {post} from './shader/post2'
import {plane} from './shape'

export async function main(core) {

  core.gl.disable(core.gl.DEPTH_TEST)
  core.gl.enable(core.gl.BLEND)
  core.gl.blendFunc(core.gl.ONE, core.gl.ONE)
  core.gl.depthMask(false)
  core.gl.colorMask(true, true, true, false)

  const gridVAO = new Vao(core, {...plane(), id: 'grid'})
  const postVAO = new Vao(core, {
    ...plane(),
    id                 : 'post',
    instancedAttributes: post().instancedAttributes,
    maxInstance        : 100000
  })

  const gridP = new Program(core, grid())
  const postP = new Program(core, post())

  const renderer = new Renderer(core, {pixelRatio: 1})

  setHandler('cameraPosition', (cameraPosition) => {
    [gridP, postP].forEach(async(program) => program.set({cameraPosition}))
  })

  setHandler('posts', (posts) => {
    postVAO.setInstancedValues({
      a_instance_postPos: posts
    })
  })

  const animation = new Animation({callback: () => {
    renderer.clear()
    renderer.render(gridVAO, gridP)
    renderer.render(postVAO, postP)
  }, interval: 0})

  animation.start()
  setInterval(() => sendState({drawTime: Number(animation.drawTime).toFixed(2) + ' ms', fps: Number(1000 / animation.delta).toFixed(2)}), 200)
}


// setHandler('mouse', (mouse) => {
//   const x = mouse?.x ?? 0
//   const y = mouse?.y ?? 0
//   testF.set({mouse: [x, y]})
// })