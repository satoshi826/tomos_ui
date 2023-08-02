import {values} from '../../lib/util'
import {Frag} from '../../lib/glFrag/Frag'
import {Renderer} from '../../lib/glFrag/Renderer'
import {Animation} from '../../lib/glFrag/Animation'
import {setHandler} from '../../lib/glFrag/state'

import {test} from './shader/test'

export async function main(core) {

  const testF = new Frag(core, test())
  const renderer = new Renderer(core)

  renderer.render([testF])

  setHandler('cameraPosition', (cameraPosition) => testF.set({cameraPosition}))
  // setHandler('mouse', (mouse) => {
  //   const x = mouse?.x ?? 0
  //   const y = mouse?.y ?? 0
  //   testF.set({mouse: [x, y]})
  // })

  setHandler('posts', (posts) => {
    const postPos = values(posts).flatMap(v => v['x.y'])
    testF.set({postPos, postNum: postPos.length / 2})
  })

  testF.set({postPos: [2, 2, 4, 4]})

  const animation = new Animation({callback: () => {
    renderer.render([testF])
  }, interval: 0})

  animation.start()

}