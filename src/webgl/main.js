import {values} from '../../lib/util'
import {Program} from '../../lib/glFrag/Program'
import {Renderer} from '../../lib/glFrag/Renderer'
import {Animation} from '../../lib/glFrag/Animation'
import {setHandler, sendState} from '../../lib/glFrag/state'

import {grid} from './shader/grid'
import {posts} from './shader/posts'
import {post} from './shader/post'
import {plane} from './shape'

export async function main(core) {

  const gridP = new Program(core, grid())
  const postsP = new Program(core, posts())
  const postP = new Program(core, post())

  const renderer = new Renderer(core, {pixelRatio: 0.5})

  const planeA = plane()

  core.setVao({
    id        : 'plane',
    index     : planeA.index,
    attributes: {a_position: planeA.position}
  })

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

    postPos.forEach((pos) => {
      postP.set({postPos: pos})
      renderer.render('plane', postP)
    })

    renderer.render('plane', gridP)
  }, interval: 0})

  animation.start()
  setInterval(() => sendState({drawTime: Number(animation.drawTime).toFixed(2) + ' ms', fps: Number(1000 / animation.delta).toFixed(2)}), 200)
}


// setHandler('mouse', (mouse) => {
//   const x = mouse?.x ?? 0
//   const y = mouse?.y ?? 0
//   testF.set({mouse: [x, y]})
// })