import {id} from '../../../lib/dom'
import {style, pxToInt} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'
import {shape} from '../../theme/shape'
import {state} from '../../../lib/state'
import {postionAdapter} from './util'
import {getCamera, setCamera} from '../../core'

import CanvasWorker from '../../webgl/worker?worker'
const canvasWorker = new CanvasWorker()

export const sendState = (object) => canvasWorker.postMessage({state: object})
export const [watchCanvasSize, setCanvasSize, getCanvasSize] = state({key: 'canvasSize', init: [100, 100]})

export function canvas() {

  queueMicrotask(() => {
    const {canvasE, canvasWrapperE} = init()
    watchResize(canvasE)
    sendResize()
    sendMouse(canvasWrapperE)
    setPosition(canvasWrapperE)
  })

  style.set('#canvasWrapper', wrapperC)
  style.set('#canvasWrapper:active', wrapperActiveC)
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
  ..._.wh100
}

const wrapperActiveC = {
  cursor: 'move'
}

const canvasC = {
  ..._.abs,
  ..._.wh100
}

const coverC = {
  ..._.abs,
  ..._.wh100,
  overflow : 'hidden',
  boxShadow: `
  inset 0 0 100px rgba(0, 0, 0, 0.6),
  inset 0 0 200px rgba(0, 0, 0, 0.4);`
}

//----------------------------------------------------------------

const init = () => {
  const canvasE = id('canvas')
  const canvasWrapperE = id('canvasWrapper')
  canvasE.width = canvasE.clientWidth
  canvasE.height = canvasE.clientHeight

  const offscreenCanvas = canvasE.transferControlToOffscreen()
  canvasWorker.postMessage({init: {
    canvas    : offscreenCanvas,
    pixelRatio: window.devicePixelRatio
  }}, [offscreenCanvas])

  state({key: 'canvasSize', init: [canvasE.clientWidth, canvasE.clientHeight]})
  return {canvasE, canvasWrapperE}
}

const watchResize = (canvasE) => {
  const resizeObserver = new ResizeObserver((entries) => {
    const {width, height} = entries[0].contentRect
    setCanvasSize([width, height])
  })
  resizeObserver.observe(canvasE)
}

const sendResize = () => {
  watchCanvasSize(([width, height]) => sendState({resize: {width, height}}))
}

const sendMouse = (canvasWrapperE) => {

  canvasWrapperE._on.mousemove = (event) => {
    const x = 2 * (event.offsetX / canvasWrapperE.offsetWidth) - 1
    const y = - (2 * (event.offsetY / canvasWrapperE.offsetHeight) - 1)
    sendState({mouse: {x, y}})
  }

  canvasWrapperE.onmouseleave = () => {
    sendState({mouse: {x: null, y: null}})
  }

}

const setPosition = (canvasWrapperE) => {

  let start = null
  let startCamera = null
  let baseDistance = null

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

  canvasWrapperE._on.mousedown = (event) => {
    const {clientX, clientY} = event
    start ??= [clientX, clientY]
  }

  canvasWrapperE._on.mousemove = (event) => {
    const {clientX, clientY} = event
    if (start) {
      startCamera ??= getCamera()
      const diffX = - coffX * (clientX - start[0]) / width
      const diffY = coffY * (clientY - start[1]) / height
      setCamera(([, , z]) => [(startCamera[0] + z * diffX), (startCamera[1] + z * diffY), z])
    }
  }

  canvasWrapperE._on.wheel = (event) => {
    const {offsetX, offsetY, deltaY} = event // ToDo: postと重なっているときの対応
    setCamera(([x, y, z]) => {
      const newZ = Math.max(z + (z * deltaY / 1500), 1)
      if (z === 1 && newZ === 1) return [x, y, z]
      const zoomIn = deltaY < 0 ? 1 : -1
      const [wx, wy] = postionAdapter.pxToNormal(offsetX, offsetY)
      const diffX = z * coffX * wx * 0.025 * zoomIn
      const diffY = z * coffY * wy * 0.025 * zoomIn
      return [x + diffX, y + diffY, newZ]
    })
  }

  canvasWrapperE._on.mouseup = () => start = startCamera = baseDistance = null
  canvasWrapperE._on.mouseleave = () => start = startCamera = baseDistance = null

  //----------------------------------------------------------------

  const topBarHeight = pxToInt(shape.topbar.height)

  let isPinch = null

  canvasWrapperE._on.touchstart = (event) => {
    const {changedTouches} = event
    const [{clientX, clientY}] = changedTouches
    start ??= [clientX, clientY]
  }

  canvasWrapperE._on.touchmove = (event) => {
    const {changedTouches, touches} = event
    isPinch = isPinch || touches.length > 1

    if (start && !isPinch) {
      const [{clientX, clientY}] = changedTouches
      startCamera ??= getCamera()
      const diffX = - coffX * (clientX - start[0]) / width
      const diffY = coffY * (clientY - start[1]) / height
      setCamera(([, , z]) => [(startCamera[0] + z * diffX), (startCamera[1] + z * diffY), z])
    }

    if (start && isPinch) {
      let {0: {clientX:x1, clientY:y1}, 1: {clientX:x2, clientY:y2}} = changedTouches
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      baseDistance ??= distance
      const zoom = 0.15 * ((distance / baseDistance) - 1)
      setCamera(([x, y, z]) => {
        const newZ = Math.max(z + (z * -zoom), 1)
        if (z === 1 && newZ === 1) return [x, y, z]
        const zoomIn = zoom > 0 ? 1 : -1
        const [wx, wy] = postionAdapter.pxToNormal((x1 + x2) / 2, ((y1 + y2) / 2) - topBarHeight)
        const diffX = z * coffX * wx * 0.01 * zoomIn
        const diffY = z * coffY * wy * 0.01 * zoomIn
        return [x + diffX, y + diffY, newZ]
      })
    }
  }

  canvasWrapperE._on.touchend = () => {
    start = startCamera = baseDistance = isPinch = null
  }

}

//----------------------------------------------------------------

// const sendKeydown = () => {
//   let keyDownList = {}
//   const send = (keyDownList) => sendState({keyDownList})
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

