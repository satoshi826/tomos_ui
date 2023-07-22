import {id} from '../../../../lib/dom'
import {oForEachK, oForEach, isEmptyO, easing} from '../../../../lib/util'
import {_qsA, beforeend} from '../../../../lib/dom'
import {style, icon} from '../../../../lib/theme'
import {snippets as _} from '../../../theme/snippets'
import {domContainerEl, getTranslate} from '../domContainer'
import {postionAdapter} from '../../canvas/util'
import {getPost, watchCamera, setCamera, getCamera} from '../../../core'
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
    cur[2] + (2 - cur[2]) * v,
  ]))
}

export const delPostButton = (x, y) => {
  const el = id(`post-button_${x}_${y}`)
  if(el) {
    el.onclick = null
    el.className = 'PostButton PostButtonFaseOut'
    setTimeout(() => el.remove(), 400)
  }
}

export function postButton() {

  queueMicrotask(() => {

    let settedPoints = {}

    watchCamera((camera) => {
      if (camera[2] < 3) {
        let visiblePoints = postionAdapter.calcVisiblePoints(camera, 0.9)
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
      }else{
        if (!isEmptyO(settedPoints)) {
          _qsA(domContainerEl, '.PostButton').forEach(el => {
            el.className = 'PostButton PostButtonFaseOut'
            setTimeout(() => el.remove(), 400)
          })
          settedPoints = {}
        }
      }
    })
  })

  style.set('.PostButton', PostButtonC)
  style.hover('.PostButton', PostButtonHoverC)
  style.set('.PostButtonFaseOut', postButtonFadeOut)
  style.keyframe('postButtonFadein', postButtonFadein)

}

//-------------------------------------------

const PostButtonC = {
  ..._.abs,
  ..._.wh('80px'),
  ..._.txC({type: 'text', i: 0, alpha: 0.25}),
  ..._.bgC({type: 'gray', i: 0, alpha: 0.25}),
  ..._.flex({align: 'center', justify: 'center'}),
  ..._.bRd('50%'),
  ..._.bgBlur(4),
  ..._.dur('0.4s'),
  ..._.breakWord,
  animationName       : 'postButtonFadein',
  animationDuration   : '.6s ',
  cursor              : 'pointer',
  contain             : 'strict',
  contentVisibility   : 'auto',
  containIntrinsicSize: '0px',
}

const postButtonFadein = {
  from: {
    ..._.txC({type: 'text', i: 0, alpha: 0.01}),
    ..._.bgC({type: 'gray', i: 0, alpha: 0.01}),
    boxShadow: ''
  },
  to: {
    ..._.txC({type: 'text', i: 0, alpha: 0.25}),
    ..._.bgC({type: 'gray', i: 0, alpha: 0.25}),
  }
}

const postButtonFadeOut = {
  ..._.txC({type: 'text', i: 0, alpha: 0.001}),
  ..._.bgC({type: 'gray', i: 0, alpha: 0.001}),
}

const PostButtonHoverC = {
  ..._.txC({type: 'primary', i: 0}),
  ..._.bgC({type: 'gray', i: 0, alpha: 0.7}),
  ..._.txGrow(10),
  ..._.bgGrow(6),
}


