import {oForEach} from '../../lib/util'
import {style} from '../../lib/theme'
import {resetCSS} from './resetCSS'
import {breakpoints} from './breakpoints'
import {palette} from './palette'
import {shape} from './shape'
import {state} from '../../lib/state'

export const init = () => {

  style.init({resetCSS, breakpoints, palette, shape})

  oForEach(breakpoints, ([k, v]) => {
    const mediaQuery = window.matchMedia(`(max-width: ${v})`)
    const setIs = state({key: `is${k}`, init: mediaQuery.matches})[1]
    mediaQuery.addEventListener('change', ({matches}) => setIs(matches))
  })

}

