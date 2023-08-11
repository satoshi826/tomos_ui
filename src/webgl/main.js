import {values} from '../../lib/util'
import {Program} from '../../lib/glFrag/Program'
import {Renderer} from '../../lib/glFrag/Renderer2'
import {Animation} from '../../lib/glFrag/Animation'
import {setHandler, sendState} from '../../lib/glFrag/state'

import {sample} from './shader/sample'
import {grid} from './shader/grid'
import {posts} from './shader/posts'
import {plane} from './shape'

export async function main(core) {

  const sampleP = new Program(core, sample())
  const gridP = new Program(core, grid())
  const postsP = new Program(core, posts())

  const renderer = new Renderer(core)

  const planeA = plane()

  core.setVao({
    id        : 'plane',
    index     : planeA.index,
    attributes: {a_position: planeA.position}
  })

  setHandler('cameraPosition', (cameraPosition) => {
    [gridP, postsP].forEach(program => program.set({cameraPosition}))
  })

  setHandler('posts', (posts) => {
    const postPos = values(posts).flatMap(v => v['x.y'])
    postsP.set({postPos, postNum: postPos.length / 2})
  })

  const animation = new Animation({callback: () => {
    renderer.clear()
    renderer.render('plane', gridP)
    renderer.render('plane', postsP)
  }, interval: 0})

  animation.start()
  setInterval(() => sendState({drawTime: Number(animation.drawTime).toFixed(2) + ' ms', fps: Number(1000 / animation.delta).toFixed(2)}), 200)
}


// setHandler('mouse', (mouse) => {
//   const x = mouse?.x ?? 0
//   const y = mouse?.y ?? 0
//   testF.set({mouse: [x, y]})
// })