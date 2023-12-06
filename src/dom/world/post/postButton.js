import {id} from '../../../../lib/dom'
import {oForEachK, oForEach, isEmptyO, easing} from '../../../../lib/util'
import {_qsA, beforeEnd} from '../../../../lib/dom'
import {style, icon} from '../../../../lib/theme'
import {snippets as _} from '../../../theme/snippets'
import {domContainerEl, getTranslate} from '../domContainer'
import {positionAdapter} from '../../canvas/util'
import {watchCamera, setCamera, getCamera} from '../../../core'
import {watchMouseTrunced} from '../../../core/mouse'
import {getPost} from '../../../core/post'
import {setEditPostMode} from '.'

const setPostButton = (x, y) => {
  if (getPost(x, y)) return
  const postHTML = /* html */`
      <div id="post-button_${x}_${y}" class="PostButton" style="transform:${getTranslate(x, y)}">
        ${icon('local_fire_department', {size: '60px'})}
      </div>`
  beforeEnd(domContainerEl, postHTML)
  // id(`post-button_${x}_${y}`).onclick = onClickPost(x, y)
}

// const onClickPost = (x, y) => () => {
//   setEditPostMode([x, y])
//   const cur = getCamera()
//   easing(0, 1, 800, (v) => setCamera([
//     cur[0] + (x - cur[0]) * v,
//     cur[1] + (y - 0.5 - cur[1]) * v,
//     cur[2] + (2 - cur[2]) * v
//   ]))
// }

export const delPostButton = (x, y) => {
  const el = id(`post-button_${x}_${y}`)
  if(el) {
    el.onclick = null
    el.remove()
  }
}

export function postButton() {

  queueMicrotask(() => {
    let buttonEl = null
    watchMouseTrunced(([x, y]) => {
      if (!buttonEl) {
        const postHTML = /* html */`
            <div id="post-button" class="PostButton" style="transform:${getTranslate(x, y)}">
              ${icon('local_fire_department', {size: '60px'})}
            </div>`
        beforeEnd(domContainerEl, postHTML)
        buttonEl = id('post-button')
      }
      buttonEl.style = `transform:${getTranslate(x, y)}`
    })
    // const viewZ = 10
    // x &&= y &&= null
    // if(buttonEl) {
    //   buttonEl.remove()
    //   buttonEl = null
    // }
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


