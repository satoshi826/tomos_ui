import {id} from '../lib/dom'
import {init as initTheme} from './theme/init'
import {style} from '../lib/theme'
import {snippets as _} from './theme/snippets'

import {frame} from './dom/frame/frame'
import {side} from './dom/frame/side'
import {tool} from './dom/frame/tool'
import {nav} from './dom/frame/nav'

import {canvas} from './dom/canvas'
import {core} from './core'
import {showPosts} from './dom/world/post'

core()
initTheme()

id('app').innerHTML = /* html */`
  ${frame({
    top    : tool(),
    side   : side(),
    content: canvas(),
    bottom : nav(),
  })}
`

//----------------------------------------------------------------

showPosts()

//----------------------------------------------------------------

const appC = {
  ..._.wh100,
  ..._.flex({col: true}),
  ..._.bgC(),
  ..._.txC(),
  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
}

style.set('#app', appC)