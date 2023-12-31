import {beforeEnd, id} from '../../../../lib/dom'
import {oForEachV} from '../../../../lib/util'
import {style} from '../../../../lib/theme'
import {snippets as _} from '../../../theme/snippets'
import {domContainerEl, getTranslate, BASE_SCALE} from '../domContainer'

import {watchAddPosts} from '../../../core/post'

export function postItem() {

  queueMicrotask(() => {
    watchAddPosts(posts => {
      oForEachV(posts, ({'x.y': [x, y], m}) => {

        if (id(`post_${x}_${y}`)) {
          id(`post_${x}_${y}`).innerText = m
          return
        }

        const postHTML = /* html */`
          <div id="post_${x}_${y}" class="worldPost" data-x="${x}" data-y="${y}" style="transform:${getTranslate(x, y)}">
            ${m}
          </div>`
        beforeEnd(domContainerEl, postHTML)
      })
    })
  })

  //-------------------------------------------

  style.set('.worldPost', {
    ..._.abs,
    ..._.wh(`${BASE_SCALE * 0.8}px`),
    ..._.f('12px'),
    // ..._.txC({type: 'background'}),
    // ..._.bgC({i: 2, alpha: 0.5}),
    // ..._.bgBlur(4),
    // ..._.bRd('50%'),
    ..._.flex({align: 'center', justify: 'center'}),
    ..._.breakWord,
    textAlign           : 'center',
    contain             : 'strict',
    contentVisibility   : 'auto',
    containIntrinsicSize: '16px'
  })

  // style.set('.postVisible', {
  //   contentVisibility: 'auto',
  // })

}

