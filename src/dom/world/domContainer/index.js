import {state} from '../../../../lib/state'
import {id} from '../../../../lib/dom'
import {style} from '../../../../lib/theme'
import {debounce} from '../../../../lib/util'
import {snippets as _} from '../../../theme/snippets'
import {postionAdapter} from '../../canvas/util'

const [watchResize] = state({key: 'canvasSize'})
const [watchCamera,, getCamera] = state({key: 'cameraPosition'})

export const BASE_SCALE = 160
export const domContainerEl = document.createElement('div')
export const getTranslate = (x, y) => `translateX(calc(${x * BASE_SCALE}px - 50%)) translateY(calc(${-y * BASE_SCALE}px - 50%))`

export function domContainer() {

  const canvasWrapper = id('canvasWrapper')
  domContainerEl.id = 'domContainer'
  domContainerEl.className = 'willChangeTransform'
  canvasWrapper.appendChild(domContainerEl)

  queueMicrotask(() => {

    watchCamera((camera) => {
      setContainer(domContainerEl, camera)
    })

    watchResize(() => {
      const camera = getCamera()
      setContainer(domContainerEl, camera)
    })

  })

  style.set('#domContainer', {
    ..._.abs,
    ..._.wh('0px'),
    ..._.bgC({type: 'text', i: 2}),
    zIndex : 1000,
    contain: 'size layout',
  })

  style.set('.willChangeTransform', {
    willChange: 'transform'
  })


  const toggleWillChange = debounce(() => {
    domContainerEl.className = ''
    setTimeout(() => {
      domContainerEl.className = 'willChangeTransform'
    }, 100)
  }, 400)


  let currentZ = Infinity
  const setContainer = (node, camera) => {
    const [tx, ty] = postionAdapter.worldToPx([0, 0], camera)
    if(currentZ !== camera[2]) {
      currentZ = camera[2]
      toggleWillChange()
    }
    node.style.transform = `translate(${tx}px, ${ty}px) scale(${(postionAdapter.canvasShortSide) / (camera[2] * BASE_SCALE)})`
  }

}

//-------------------------------------------