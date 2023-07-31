import {state} from '../../../lib/state'
import {id} from '../../../lib/dom'
import {style} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'

export function cameraPosView() {

  requestAnimationFrame(() => {
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

  style.set('#cameraPos', cameraPosC)

  return /* html */`
      <div id="cameraPos">
        <div id="cameraPosX" >
        </div>
        <div id="cameraPosY" >
        </div>
        <div id="cameraPosZ" >
        </div>
      </div>
  `
}

const cameraPosC = {
  ..._.flex({col: false, gap: '10px'}),
  ..._.h('36px'),
  ..._.w('256px'),
  ..._.f('16px'),
  // ..._.maxH('100%'),
  overflow: 'hidden',
  contain : 'strict'
}
