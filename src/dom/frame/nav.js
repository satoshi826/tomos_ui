import {id} from '../../../lib/dom'
import {style, icon} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'

import {toggleLog} from '../../debug/logger'

export function nav() {

  style.set('#navbar', navBarC)

  return /* html */`
    <div id="navbar">
      ${icon('chat', {size: '32px'})}
      ${icon('home', {size: '32px'})}
      ${iconButton({name: 'settings', handler: toggleLog})}
    </div>
  `
}

const navBarC = {
  ..._.bgC({i: 1}),
  ..._.px('12px'),
  ..._.flex({align: 'center', justify: 'space-around'}),
  ..._.minH('var(--navbar-height)'),
  borderTop: '1px solid var(--backgorund0)',
}

const iconButton = ({name, handler}) => {

  queueMicrotask(() => {
    if(handler) {
      const iconbutton = id(`${name}iconbutton`)
      iconbutton._on.click = handler
    }
  })

  return /* html */`
    <div id="${name}iconbutton">
      ${icon(name, {size: '32px'})}
    </div>
`
}