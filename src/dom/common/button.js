import {id as getEl} from '../../../lib/dom'
import {style} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'

export function button({id = crypto.randomUUID(), css, onClick, onSuccess, onError, text}) {

  queueMicrotask(() => {
    getEl(id).onclick = onClick
    style.set('.button', buttonC, {once: true})
    style.hover('.button', buttonHoverC, {once: true})
  })

  return /* html */`
    <span class="button" id="${id}">${text}</span>
  `
}


const buttonC = {
  ..._.dur('0.25s'),
  ..._.txC({type: 'text', i: 0}),
  ..._.bgC({type: 'primary', i: 1}),
  ..._.bRd('8px'),
  ..._.px('16px'),
  fontWeight: 600,
  cursor    : 'pointer'
}

const buttonHoverC = {
  ..._.bgC({type: 'primary', i: 0}),
  ..._.bgGrow(3)
}
