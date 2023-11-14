import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'

const initCamera = [0, 0, 5]
export const [watchCamera, setCamera, getCamera] = state({key: 'cameraPosition', init: initCamera})
export const [watchCurrentTopic, setCurrentTopic, getCurrentTopic] = state({key: 'currentTopic', init: [0, 0]})
export const [watchCurrentArea, setCurrentArea, getCurrentArea] = state({key: 'currentArea', init: [0, 0]})

export function camera() {

  watchCamera((cameraPosition) => {
    sendState({cameraPosition})

    const [curXX, curYY] = getCurrentTopic() ?? [null, null]
    const [curXXX, curYYY] = getCurrentArea() ?? [null, null]

    const [x, y, z] = cameraPosition

    const xx = 10 * (Math.trunc(x / 10) + Math.sign(x))
    const yy = 10 * (Math.trunc(y / 10) + Math.sign(y))

    const xxx = 100 * (Math.trunc(x / 100) + Math.sign(x))
    const yyy = 100 * (Math.trunc(y / 100) + Math.sign(y))

    if(xxx !== curXXX || yyy !== curYYY) {
      console.log(xxx, yyy)
      setCurrentArea([xxx, yyy])
    }

    if (z > 500) {
      if(curXX !== null) setCurrentTopic(null)
      return
    }

    if(z < 15 && xx !== curXX || yy !== curYY) {
      setCurrentTopic([xx, yy])
    }
  })

}

//----------------------------------------------------------------

