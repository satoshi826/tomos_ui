import {state} from '../../../lib/state'
import {id} from '../../../lib/dom'
import {style} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'

export function cameraPosView() {

  queueMicrotask(() => {
    const [watch] = state({key: 'cameraPosition'})
    const posXE = id('cameraPosX')
    const posYE = id('cameraPosY')
    const posZE = id('cameraPosZ')
    watch(([x, y, z]) => {
      posXE.innerText = 'x: ' + Math.trunc(x)
      posYE.innerText = 'y: ' + Math.trunc(y)
      posZE.innerText = 'z: ' + Math.trunc(z)
    })
  })

  return /* html */`
      <div>
        <div id="cameraPosX" className="cameraPos">
        </div>
        <div id="cameraPosY" className="cameraPos">
        </div>
        <div id="cameraPosZ" className="cameraPos">
        </div>
      </div>
  `
}

const cameraPosC = {
  ..._.flex({col: true}),
  ..._.wh('100%'),
  ..._.maxH('100%'),
  overflow: 'hidden',
}
