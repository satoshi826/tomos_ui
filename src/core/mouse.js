import {state} from '../../lib/state'
import {getCamera} from '.'
import {sendState} from '../dom/canvas'
import {positionAdapter} from '../dom/canvas/util'

export const [watchMouse, setMouse, getMouse] = state({key: 'mouse', init: [null, null]})
export const [watchMouseTrunced, setMouseTrunced, getMouseTrunced] = state({key: 'mouseTrunced', init: [null, null]})

export function mouse() {

  let x = null
  let y = null
  watchMouse((mouse) => {
    sendState({mouse})
    const [ax, ay] = positionAdapter.canvasAspect
    const [cx, cy, cz] = getCamera()
    const nextX = Math.trunc(cx + (ax * mouse[0] * cz * 0.5))
    const nextY = Math.trunc(cy + (ay * mouse[1] * cz * 0.5))
    if (x !== nextX || y !== nextY) {
      x = nextX
      y = nextY
      setMouseTrunced([x, y])
    }
  })

}

//----------------------------------------------------------------

