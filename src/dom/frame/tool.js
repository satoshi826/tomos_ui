import {id} from '../../../lib/dom'
import {state} from '../../../lib/state'
import {style, icon} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'


export function tool() {

  queueMicrotask(() => {
    const menuButtonE = id('menu-button')
    const set = state({key: 'isOpenSidebar'})[1]
    menuButtonE._on.click = () => set((v) => !v)
  })

  style.set('#toolbar', toolBarC)
  style.set('#menu-button', menuButtonC)
  style.hover('#menu-button', menuButtonHoverC)

  return /* html */`
    <div id="toolbar">
      <label id="menu-button">
        ${icon('menu', {size: '40px'})}
      </label>
      <label id="menu-button">
        ${icon('account_circle', {size: '40px'})}
      </label>
    </div>
  `
}

const toolBarC = {
  ..._.bgC({i: 3}),
  ..._.px('12px'),
  ..._.flex({align: 'center', justify: 'space-between'}),
  ..._.minH('var(--topbar-height)'),
  borderBottom: '1px solid var(--backgorund2)',
}

const menuButtonC = {
  ..._.flex({align: 'center', justify: 'center'}),
  ..._.txC({type: 'text', i: 1}),
  ..._.dur('0.4s'),
  ..._.wh('48px'),
  ..._.bRd('50%'),
  cursor: 'pointer',
  ..._.rlt,
}

const menuButtonHoverC = {
  ..._.txC({type: 'primary', i: 0}),
  ..._.bgC({type: 'gray', i: 0, alpha: 0.2}),
}

