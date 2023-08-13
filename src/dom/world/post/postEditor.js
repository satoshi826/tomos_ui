import {id} from '../../../../lib/dom'
import {beforeend, addMultiEL, rmMultiEL} from '../../../../lib/dom'
import {style} from '../../../../lib/theme'
import {snippets as _} from '../../../theme/snippets'
import {addPost} from '../../../core'
import {infra} from '../../../infra'
import {divider} from '../../common/divider'
import {button} from '../../common/button'

import {watchEditPostMode, setEditPostMode, getEditPostMode} from '.'

export function postEditor() {

  requestAnimationFrame(() => {
    const navbarEl = id('navbar')
    const postEditor = /* html */`
    <div id="post-editor-wrapper">
      <div id="post-editor-flex">
        <span id="tomos-button">トモす</span>
        ${divider()}
        <textarea id="post-editor-input"></textarea>
      </div>
    </div>`

    const closeEditor = (e) => {
      if ((!navbarEl.contains(e.target))) setEditPostMode(false)
    }

    const clickPost = () => {
      const input = id('post-editor-input')
      const [x, y] = getEditPostMode()
      addPost({
        [`post${x}_${y}`]: {
          'x.y': [x, y],
          m    : input.value
        }})
      infra.post[`${x}.${y}`] = input.value
      // infra.post[`${x}.${y}`]('yoyoyo')
      id(`post-button_${x}_${y}`).remove()
      setEditPostMode(false)
    }

    watchEditPostMode((v) => {
      if (v) {
        addMultiEL(document, ['mousedown', 'touchstart'], closeEditor)
        style.set('#post-editor-wrapper', wrapperC)
        if (!id('post-editor-wrapper')) beforeend(navbarEl, postEditor)
        id('tomos-button').onclick = clickPost
      }
      if (!v) {
        rmMultiEL(document, ['mousedown', 'touchstart'], closeEditor)
        const postEditor = id('post-editor-wrapper')
        if(postEditor) {
          style.set('#post-editor-wrapper', {...wrapperC, ...editorFadeout})
          setTimeout(() => postEditor.remove(), 400)
        }

      }
    })


  })

  style.keyframe('editorFadein', editorFadein)
  style.set('#post-editor-flex', flexC)
  style.set('#post-editor-input', inputC)
  style.set('#post-editor-input:focus', inputFocusC)

  style.set('#tomos-button', buttonC)
  style.hover('#tomos-button', buttonHoverC)


}

//-------------------------------------------

const editorSize = 280

const wrapperC = {
  ..._.abs,
  ..._.transY(`${-editorSize}px`),
  ..._.flex({align: 'center', justify: 'center'}),
  ..._.w('100%'),
  ..._.h(`${editorSize}px`),
  ..._.bgC({i: 0, alpha: 0.2}),
  animationName          : 'editorFadein',
  animationDuration      : '0.4s ',
  top                    : '100%',
  animationIterationCount: '1',
  backdropFilter         : 'blur(16px) saturate(120%)',
  borderTop              : `1px solid ${_.getColor('background', 3, 0.8)}`
}

const editorFadein = {
  from: {
    ..._.transY('0px')
  },
  to: {
    ..._.transY(`${-editorSize}px`)

  }
}

const editorFadeout = {
  ..._.dur('0.4s'),
  ..._.transY('0px')
}

const flexC = {
  ..._.w('500px'),
  ..._.h('80%'),
  ..._.px('24px'),
  ..._.flex({align: 'center', justify: 'center', gap: '16px', col: true}),
  borderRight: `0.2px solid ${_.getColor('text', 3, 0.3)}`,
  borderLeft : `0.2px solid ${_.getColor('text', 3, 0.3)}`
}

const inputC = {
  border      : `1px solid ${_.getColor('background', 3, 0.4)}`,
  ..._.f('16px'),
  ..._.bgC({i: 2}),
  ..._.txC(),
  ..._.w('100%'),
  borderBottom: `1px solid ${_.getColor('text', 1)}`,
  boxShadow   : 'none',
  transition  : 'all .3s',
  flexGrow    : 1,
  resize      : 'none'
}

const inputFocusC = {
  outline     : 'none',
  borderBottom: `1px solid ${_.getColor('primary', 0)}`,
  ..._.bgGrow(2)
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
