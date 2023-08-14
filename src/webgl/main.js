import {values} from '../../lib/util'
import {Vao} from '../../lib/glFrag/Vao'
import {Program} from '../../lib/glFrag/Program'
import {Renderer} from '../../lib/glFrag/Renderer'
import {Animation} from '../../lib/glFrag/Animation'
import {setHandler, sendState} from '../../lib/glFrag/state'

import {grid} from './shader/grid'
import {posts} from './shader/posts'
import {post} from './shader/post2'
import {plane} from './shape'

export async function main(core) {

  core.gl.disable(core.gl.DEPTH_TEST)
  core.gl.enable(core.gl.BLEND)
  core.gl.blendFunc(core.gl.ONE, core.gl.ONE)
  core.gl.depthMask(false)
  core.gl.colorMask(true, true, true, false)

  const planeVAO = new Vao(core, plane())
  const gridP = new Program(core, grid())
  const postsP = new Program(core, posts())
  const postP = new Program(core, post())

  const renderer = new Renderer(core, {pixelRatio: 1})

  setHandler('cameraPosition', (cameraPosition) => {
    [gridP, postsP, postP].forEach(async(program) => program.set({cameraPosition}))
  })

  let postPos

  setHandler('posts', (posts) => {
    postPos = values(posts).map(v => v['x.y'])
    postsP.set({postPos: postPos.flat(), postNum: postPos.length / 2})
  })

  const animation = new Animation({callback: () => {
    renderer.clear()
    renderer.render(planeVAO, gridP)
    postPos.forEach((pos) => {
      postP.set({postPos: pos})
      renderer.render(planeVAO, postP)
    })
  }, interval: 0})

  animation.start()
  setInterval(() => sendState({drawTime: Number(animation.drawTime).toFixed(2) + ' ms', fps: Number(1000 / animation.delta).toFixed(2)}), 200)
}


// setHandler('mouse', (mouse) => {
//   const x = mouse?.x ?? 0
//   const y = mouse?.y ?? 0
//   testF.set({mouse: [x, y]})
// })