
import {id, customEl} from '../../lib/dom'
import {style} from '../../lib/theme'
import {snippets as _} from '../theme/snippets'
import {fill} from '../../lib/util'

let loggerEl = null
let isViewLog = false
let logList = fill(8, '')

export function toggleLog() {
  if(!loggerEl) init()
  isViewLog = !isViewLog
  style.set('#logger', isViewLog ? loggerC : {display: 'none'})
}

const loggerC = {
  ..._.w('240px'),
  ..._.h('220px'),
  ..._.abs,
  zIndex: 1000,
  ..._.bgC({type: 'gray', i: 0, alpha: 0.5}),
  ..._.bRd('16px')
}

const loggerTextC = {
  ..._.p('10px'),
  ..._.w('200px'),
  whiteSpace: 'nowrap'
}

//----------------------------------------------------------------

const init = () => {
  const app = id('app')
  loggerEl = customEl(document.createElement('div'))
  loggerEl.id = 'logger'
  loggerEl.innerHTML = /* html */`
    <div id="loggerText">
      start log
    </div>
  `
  app.appendChild(loggerEl)
  style.set('#logger', loggerC)
  style.set('#loggerText', loggerTextC)
  draggable(loggerEl)
  interceptLog(id('loggerText'))
}

const interceptLog = (el) => {
  const log = console.log.bind(console)
  console.log = (...args) => {
    if(isViewLog) {
      if(args[0].startsWith('_$')) {
        const index = args[0][2]
        logList[index] = args[0].substr(3)
      }else{
        logList.pop()
        logList.unshift(args[0])
      }
      el.innerHTML = logList.reduce((res, log) => {
        res += `<div>${log}</div>`
        return res
      }, '')
    }else{
      log(...args)
    }
  }
}

const draggable = (el) => {
  let isDrag = false
  let diffX = null
  let diffY = null

  const reset = () => {
    isDrag = false
  }

  el._on.mousedown = () => {
    isDrag = true
  }

  el._on.mousemove = ({clientX, clientY}) => {
    if (isDrag) {
      diffX = (clientX - 100)
      diffY = (clientY - 100)
      el.setAttribute('style',
        `transform: translate(${diffX}px, ${diffY}px); transition: all 0s;`
      )
    }
  }
  el._on.mouseup = () => reset()
  el._on.mouseleave = () => reset()
}