import {id} from '../../../lib/dom'
import {style, pxToInt} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'
import {shape} from '../../theme/shape'
import {state} from '../../../lib/state'

import CanvasWorker from '../../webgl/worker?worker'
const canvasWorker = new CanvasWorker()
export const sendState = (object) => canvasWorker.postMessage({state: object})

export function canvas() {

  queueMicrotask(() => {
    const {canvasE, canvasWrapperE} = init()
    watchResize(canvasE)
    sendResize()
    sendMouse(canvasWrapperE)
    setPosition(canvasWrapperE)
  })

  style.set('#canvasWrapper', wrapperC)
  style.set('#canvas', canvasC)
  style.set('#canvasCover', coverC)

  return /* html */`
    <div id="canvasWrapper">
      <canvas id="canvas"></canvas>
      <div id="canvasCover"></div>
    </div>
  `
}

//----------------------------------------------------------------

const wrapperC = {
  ..._.bgC({type: 'gray', i: 0}),
  ..._.rlt,
  ..._.wh100,
}

const canvasC = {
  ..._.abs,
  ..._.wh100,
}

const coverC = {
  ..._.abs,
  ..._.wh100,
  boxShadow: `
  inset 0 0 100px rgba(0, 0, 0, 0.6),
  inset 0 0 200px rgba(0, 0, 0, 0.4);`,
}

//----------------------------------------------------------------

const init = () => {
  const canvasE = id('canvas')
  const canvasWrapperE = id('canvasWrapper')
  canvasE.width = canvasE.clientWidth
  canvasE.height = canvasE.clientHeight

  const offscreenCanvas = canvasE.transferControlToOffscreen()
  // canvasWorker.postMessage({init: {
  //   canvas    : offscreenCanvas,
  //   pixelRatio: window.devicePixelRatio
  // }}, [offscreenCanvas])

  state({key: 'canvasSize', init: [canvasE.clientWidth, canvasE.clientHeight]})
  return {canvasE, canvasWrapperE}
}

const watchResize = (canvasE) => {
  const set = state({key: 'canvasSize'})[1]
  const resizeObserver = new ResizeObserver((entries) => {
    const {width, height} = entries[0].contentRect
    set([width, height])
  })
  resizeObserver.observe(canvasE)
}

const sendResize = () => {
  const watch = state({key: 'canvasSize'})[0]
  watch(([width, height]) => sendState({resize: {width, height}}))
}

const sendMouse = (canvasWrapperE) => {

  canvasWrapperE._on.mousemove = (e) => {
    const x = 2 * (e.offsetX / canvasWrapperE.offsetWidth) - 1
    const y = - (2 * (e.offsetY / canvasWrapperE.offsetHeight) - 1)
    sendState({mouse: {x, y}})
  }

  canvasWrapperE.onmouseleave = () => {
    sendState({mouse: {x: null, y: null}})
  }

}

const setPosition = (canvasWrapperE) => {
  const [, set, get] = state({key: 'cameraPosition', init: [0, 0, 10]})
  const [watchCanvasSize,, getCanvasSize] = state({key: 'canvasSize'})

  let start = null
  let startCamera = null
  let baseDistance = null

  const reset = () => start = startCamera = baseDistance = null

  let [width, height] = getCanvasSize()
  let canvasAspect = width / height
  let coffX = (canvasAspect > 1) ? canvasAspect : 1.0
  let coffY = (canvasAspect > 1) ? 1.0 : 1 / canvasAspect

  watchCanvasSize(([w, h]) => {
    width = w
    height = h
    canvasAspect = width / height
    coffX = (canvasAspect > 1) ? canvasAspect : 1.0
    coffY = (canvasAspect > 1) ? 1.0 : 1 / canvasAspect
  })

  canvasWrapperE._on.mousedown = ({clientX, clientY}) => {
    start ??= [clientX, clientY]
  }

  canvasWrapperE._on.mousemove = ({clientX, clientY}) => {
    if (start) {
      startCamera ??= get()
      const diffX = - coffX * (clientX - start[0]) / width
      const diffY = coffY * (clientY - start[1]) / height
      set(([, , z]) => [(startCamera[0] + z * diffX), (startCamera[1] + z * diffY), z])
    }
  }

  canvasWrapperE._on.wheel = ({offsetX, offsetY, deltaY}) => {
    set(([x, y, z]) => {
      const newZ = Math.max(z + (z * deltaY / 1500), 10)
      if (z === 10 && newZ === 10) return [x, y, z]
      const zoomIn = deltaY < 0 ? 1 : -1
      const wx = 2 * (offsetX / canvasWrapperE.offsetWidth) - 1
      const wy = - (2 * (offsetY / canvasWrapperE.offsetHeight) - 1)
      const diffX = z * coffX * wx * 0.045 * zoomIn
      const diffY = z * coffX * wy * 0.045 * zoomIn
      return [x + diffX, y + diffY, newZ]
    })
  }

  canvasWrapperE._on.mouseup = () => reset()
  canvasWrapperE._on.mouseleave = () => reset()

  //----------------------------------------------------------------

  // const topBarHeight = pxToInt(shape.topbar.height)

  canvasWrapperE._on.touchstart = ({changedTouches}) => {
    const [{clientX, clientY}] = changedTouches
    start ??= [clientX, clientY]
  }

  canvasWrapperE._on.touchmove = ({changedTouches}) => {

    const isPinch = changedTouches.length > 1

    if (start && !isPinch) {
      const [{clientX, clientY}] = changedTouches
      startCamera ??= get()
      const diffX = - coffX * (clientX - start[0]) / width
      const diffY = coffY * (clientY - start[1]) / height
      set(([, , z]) => [(startCamera[0] + z * diffX), (startCamera[1] + z * diffY), z])
    }

    if (start && isPinch) {
      const {0: {clientX:x1, clientY:y1}, 1: {clientX:x2, clientY:y2}} = changedTouches
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      baseDistance ??= distance
      const zoom = 0.2 * ((distance / baseDistance) - 1)
      set(([x, y, z]) => {
        const newZ = Math.max(z + (z * -zoom), 10)
        if (z === 10 && newZ === 10) return [x, y, z]
        const zoomIn = zoom > 0 ? 1 : -1
        const wx = ((x1 + x2) / canvasWrapperE.offsetWidth) - 1
        const wy = - ((y1 + y2) / canvasWrapperE.offsetHeight) - 1
        const diffX = z * coffX * wx * 0.005 * zoomIn
        const diffY = z * coffX * wy * 0.005 * zoomIn
        console.log(`_$0 x1 ${x1}`)
        console.log(`_$1 x2 ${x2}`)
        console.log(`_$2 y1 ${y1}`)
        console.log(`_$3 y2 ${y2}`)
        return [x + diffX, y + diffY, newZ]
      })
    }
  }

  canvasWrapperE._on.touchend = () => reset()

}

//----------------------------------------------------------------

// const sendKeydown = () => {
//   let keyDownList = {}
//   const send = (keyDownList) => canvasWorker.postMessage({keyDown: keyDownList})
//   document.addEventListener('keydown', ({code}) => {
//     if(!keyDownList[code]) {
//       keyDownList[code] = true
//       send(keyDownList)
//     }
//   })
//   document.addEventListener('keyup', ({code}) => {
//     if(keyDownList[code]) {
//       keyDownList[code] = false
//       send(keyDownList)
//       delete keyDownList[code]
//     }
//   })
// }

// const recieveState = () => {
//   const setterMap = {}
//   canvasWorker.onmessage = ({data}) => {
//     oForEach(data, ([k, v]) => {
//       setterMap[k] ??= state({key: k, init: v})[1]
//       setterMap[k](v)
//     })
//   }
// }

