import {state} from '../../../../lib/state'
import {oForEach} from '../../../../lib/util'
import {style} from '../../../../lib/theme'
import {snippets as _} from '../../../theme/snippets'

import {domContainerEl, getTranslate, BASE_SCALE} from '../domContainer'

const [watchPosts, set] = state({key: 'worldPosts', init: {}})

export const setPost = (posts) => {
  set((pre) => {
    return {...pre, ...posts}
  })
}
export function showPosts() {

  queueMicrotask(() => {
    watchPosts(posts => {
      oForEach(posts, ([k, {p: [x, y], v}]) => {
        //ToDo: 既存のpostsかチェック +  templates使用
        const postHTML = /* html */`
          <div id="post-${k}" class="worldPost" data-x="${x}" data-y="${y}" style="transform:${getTranslate(x, y)}">
            ${v}
          </div>`
        domContainerEl.insertAdjacentHTML('beforeend', postHTML)
      })
    })
  })

  //-------------------------------------------

  style.set('.worldPost', {
    ..._.abs,
    ..._.wh(`${BASE_SCALE}px`),
    ..._.f('16px'),
    ..._.flex({align: 'center', justify: 'center'}),
    ..._.breakWord,
    textAlign           : 'center',
    contain             : 'strict',
    contentVisibility   : 'auto',
    containIntrinsicSize: '0px',
  })

}

