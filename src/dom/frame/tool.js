import {id} from '../../../lib/dom'
import {style, icon} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'
import {setIsOpenSidebar} from './frame'

export function tool(content = '') {

  queueMicrotask(() => {
    const menuButtonE = id('menu-button')
    menuButtonE._on.click = () => setIsOpenSidebar((v) => !v)
  })

  style.set('#toolbar', toolBarC)
  style.set('.menu-button', menuButtonC)
  style.hover('.menu-button', menuButtonHoverC)

  return /* html */`
    <div id="toolbar">
      <label id="menu-button" class="menu-button">
        ${icon('menu', {size: '50px'})}
      </label>
      ${content}
      <label class="menu-button">
        ${icon('account_circle', {size: '40px'})}
      </label>
    </div>
  `
}

const toolBarC = {
  ..._.bgC({i: 3}),
  ..._.px('8px'),
  ..._.flex({align: 'center', justify: 'space-between'}),
  ..._.minH('var(--topbar-height)'),
  contain: 'strict',
  zIndex : 1100,
  // borderBottom: `3px solid ${_.getColor('background', 3, 0.8)}`,
}

const menuButtonC = {
  ..._.flex({align: 'center', justify: 'center'}),
  ..._.txC({type: 'text', i: 1}),
  ..._.dur('0.4s'),
  ..._.wh('64px'),
  ..._.bRd('50%'),
  cursor: 'pointer',
  ..._.rlt,
}


const menuButtonHoverC = {
  ..._.txC({type: 'primary', i: 0}),
  ..._.txGrow(10),
}

