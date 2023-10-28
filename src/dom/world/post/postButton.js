import {id} from '../../../../lib/dom'
import {oForEachK, oForEach, isEmptyO, easing} from '../../../../lib/util'
import {_qsA, beforeend} from '../../../../lib/dom'
import {style, icon} from '../../../../lib/theme'
import {snippets as _} from '../../../theme/snippets'
import {domContainerEl, getTranslate} from '../domContainer'
import {postionAdapter} from '../../canvas/util'
import {watchCamera, setCamera, getCamera} from '../../../core'
import {getPost} from '../../../core/post'
import {setEditPostMode} from '.'

const setPostButton = (x, y) => {
  if (getPost(x, y)) return
  const postHTML = /* html */`
      <div id="post-button_${x}_${y}" class="PostButton" style="transform:${getTranslate(x, y)}">
        ${icon('local_fire_department', {size: '60px'})}
      </div>`
  beforeend(domContainerEl, postHTML)
  id(`post-button_${x}_${y}`).onclick = onClickPost(x, y)
}

const onClickPost = (x, y) => () => {
  setEditPostMode([x, y])
  const cur = getCamera()
  easing(0, 1, 800, (v) => setCamera([
    cur[0] + (x - cur[0]) * v,
    cur[1] + (y - 0.5 - cur[1]) * v,
    cur[2] + (2 - cur[2]) * v
  ]))
}

export const delPostButton = (x, y) => {
  const el = id(`post-button_${x}_${y}`)
  if(el) {
    el.onclick = null
    el.remove()
  }
}

export function postButton() {

  requestAnimationFrame(() => {

    let settedPoints = {}

    const viewZ = 10

    watchCamera((camera) => {
      if (camera[2] < viewZ) {

        let visiblePoints = postionAdapter.calcVisiblePoints(camera, 1.1)
        oForEachK(settedPoints, key => {
          settedPoints[key] = false
        })

        visiblePoints.forEach(point => {
          if (settedPoints[point] === undefined) {
            const [x, y] = point.split('_')
            setPostButton(x, y)
          }
          settedPoints[point] = true
        })

        oForEach(settedPoints, ([k, v]) => {
          if (!v) {
            const [x, y] = k.split('_')
            delPostButton(x, y)
            delete settedPoints[k]
          }
        })
        style.set('.PostButton', {...postButtonC, opacity: 1 * (1 - (camera[2] / viewZ))})
      }else{
        if (!isEmptyO(settedPoints)) {
          _qsA(domContainerEl, '.PostButton').forEach(el => {
            el.className = 'PostButton fadeOut'
            el.remove()
          })
          style.set('.PostButton', {...postButtonC, opacity: 0})
          settedPoints = {}
        }
      }
    })
  })

  style.set('.PostButton', postButtonC)
  style.hover('.PostButton', postButtonHoverC)

}

//-------------------------------------------

const postButtonC = {
  ..._.abs,
  ..._.wh('80px'),
  ..._.txC({type: 'text', i: 0, alpha: 0.5}),
  ..._.bgC({type: 'gray', i: 1, alpha: 0.5}),
  ..._.flex({align: 'center', justify: 'center'}),
  ..._.bRd('50%'),
  ..._.bgBlur(4),
  ..._.dur('0.2s'),
  ..._.breakWord,
  cursor              : 'pointer',
  contain             : 'strict',
  contentVisibility   : 'auto',
  containIntrinsicSize: '0px'
}

const postButtonHoverC = {
  ..._.txC({type: 'primary', i: 0}),
  ..._.bgC({type: 'gray', i: 1, alpha: 0.2}),
  ..._.txGrow(10),
  ..._.bgGrow(6)
}


