import {id} from '../lib/dom'
import {init as initTheme} from './theme/init'
import {style} from '../lib/theme'
import {snippets as _} from './theme/snippets'

import frame from './dom/frame'
import {canvas} from './dom/canvas'
import {core} from './core'
import {domContainer} from './dom/world/domContainer'
import {init as initPost} from './dom/world/post'

core()
initTheme()

//----------------------------------------------------------------

id('app').innerHTML = /* html */`
  ${frame({
    content: canvas()
  })}
`
//----------------------------------------------------------------

domContainer()
initPost()

//----------------------------------------------------------------

const appC = {
  ..._.wh100,
  ..._.flex({col: true}),
  ..._.bgC(),
  ..._.txC(),
  WebkitTapHighlightColor  : 'rgba(0,0,0,0)',
  '-webkit-font-smoothing' : 'antialiased',
  '-moz-osx-font-smoothing': 'grayscale',
  touchAction              : 'none'
}

style.set('#app', appC)