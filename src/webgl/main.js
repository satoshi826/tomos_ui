import {Frag} from '../../lib/glFrag/Frag'
import {Renderer} from '../../lib/glFrag/Renderer'
import {Animation} from '../../lib/glFrag/Animation'
import {setHandler} from '../../lib/glFrag/state'

import {test} from './shader/test'

export async function main(core) {

  const testF = new Frag(core, test())
  const renderer = new Renderer(core)

  renderer.render([testF])
  setHandler('cameraPosition', (e) => testF.set({cameraPosition: e}))

  const animation = new Animation({callback: () => {
    renderer.render([testF])
  }, interval: 0})

  animation.start()

}