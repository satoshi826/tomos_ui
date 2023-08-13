import {id} from '../../../../lib/dom'
import {style} from '../../../../lib/theme'
import {debounce} from '../../../../lib/util'
import {snippets as _} from '../../../theme/snippets'
import {postionAdapter} from '../../canvas/util'
import {watchCamera, getCamera} from '../../../core'
import {watchCanvasSize} from '../../canvas'

export const BASE_SCALE = 200
export const domContainerEl = document.createElement('div')
export const getTranslate = (x, y) => `translateX(calc(${x * BASE_SCALE}px - 50%)) translateY(calc(${-y * BASE_SCALE}px - 50%))`

domContainerEl.id = 'domContainer'
domContainerEl.className = 'willChangeTransform'

export function domContainer() {

  const canvasWrapper = id('canvasWrapper')
  canvasWrapper.appendChild(domContainerEl)

  requestAnimationFrame(() => {

    watchCamera((camera) => {
      setContainer(domContainerEl, camera)
    })

    watchCanvasSize(() => {
      setContainer(domContainerEl, getCamera())
    })

  })

  style.set('#domContainer', {
    ..._.abs,
    zIndex : 1000,
    contain: 'size layout'
  })

  style.set('.willChangeTransform', {
    willChange: 'transform'
  })


  const toggleWillChangeIN = debounce(() => {
    domContainerEl.className = ''
    setTimeout(() => {
      domContainerEl.className = 'willChangeTransform'
    }, 100)
  }, 500)

  const toggleWillChangeOUT = () => {
    domContainerEl.className = ''
    setTimeout(() => {
      domContainerEl.className = 'willChangeTransform'
    }, 100)
  }

  let currentZ = Infinity
  const setContainer = (node, camera) => {
    const [tx, ty] = postionAdapter.worldToPx([0, 0], camera)
    if(camera[2] < 8 && currentZ > camera[2]) {
      toggleWillChangeIN()
      currentZ = camera[2]
    }
    if(camera[2] > 8 && currentZ !== 8) {
      toggleWillChangeOUT()
      currentZ = 8
    }
    node.style.transform = `translate(${tx}px, ${ty}px) scale(${(postionAdapter.canvasShortSide) / (camera[2] * BASE_SCALE)})`
  }

}

//-------------------------------------------