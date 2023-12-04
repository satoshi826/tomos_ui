import {state} from '../../lib/state'
import {getCamera} from '.'
import {getCanvasAspect} from '../dom/canvas'
import {sendState} from '../dom/canvas'

export const [watchMouse, setMouse, getMouse] = state({key: 'mouse', init: [null, null]})
export const [watchMousePos, setMousePos, getMousePos] = state({key: 'mousePos', init: [null, null]})

export function mouse() {

  let x = null
  let y = null
  watchMouse((mouse) => {
    sendState({mouse})
    const [ax, ay] = getCanvasAspect()
    const [cx, cy, cz] = getCamera()
    const nextX = Math.trunc(cx + (mouse[0] * cz / ax))
    const nextY = Math.trunc(cy + (mouse[1] * cz / ay))
    if (x !== nextX || y !== nextY) {
      x = nextX
      y = nextY
      setMousePos([x, y])
    }
  })

}

//----------------------------------------------------------------

