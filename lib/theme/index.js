import {oMap, oForEach, oReduce} from '../util'
import {id, qs} from '../dom'

//----------------------------------------------------------------

const kebabToCamel = (k) => k.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)

const rgbFromHEX = (hex) => `${parseInt(hex[1] + hex[2], 16)},${parseInt(hex[3] + hex[4], 16)},${parseInt(hex[5] + hex[6], 16)}`

export const toCss = (obj) => oMap(obj, ([k, v]) => `${kebabToCamel(k)}:${v}`).join(';')

export const pxToInt = (px) => parseInt(px.replace('px', ''))

//----------------------------------------------------------------

export const style = {

  breakpoints: null,
  pallete    : null,
  shape      : null,
  head       : qs('head'),

  init({breakpoints, resetCSS, palette, shape}) {

    this.breakpoints = breakpoints
    this.palette = palette
    this.shape = shape

    resetCSS && this.head.insertAdjacentHTML('beforeEnd', `<style id='reset'>${resetCSS}</style>`)

    const paletteVal = oReduce(this.palette, (obj, [k, v]) => {
      oForEach(v, ([i, hex]) => {
        obj[`--${k}${i}`] = hex
        obj[`--${k}${i}-rgb`] = rgbFromHEX(hex)
      })
      return obj
    }, {})

    const shapeVal = oReduce(this.shape, (obj, [k, v]) => {
      oForEach(v, ([atr, val]) => {
        obj[`--${k}-${atr}`] = val
      })
      return obj
    }, {})

    this.set(':root', {...paletteVal, ...shapeVal})

  },

  set(selector, css) {
    const isRaw = (typeof css === 'string')
    const styleT = isRaw ? css : `${selector}{${toCss(css)}}`
    const styleId = `sytle_${selector}`
    const existStyle = id(styleId)
    if (existStyle) {
      existStyle.innerText = styleT
      return
    }
    this.head.insertAdjacentHTML('beforeEnd', `<style id=${styleId}>${styleT}</style>`)
  },

  hover(selector, obj) {
    this.set(`${selector}&hover`,
      `@media (hover: hover){${selector}:hover{${toCss(obj)}}}`
    + `@media (hover: none) {${selector}:active{${toCss(obj)}}}`)
  },

  responsive(device) {
    const that = this
    return function(selector, obj) {
      that.set(`${selector}&${device}`, `@media (max-width : ${that.breakpoints[device]}){${selector}{${toCss(obj)}}}`)
    }
  },

  isDevice(device) {
    return window.matchMedia(`(max-width: ${this.breakpoints[device]})`).matches
  }

}

//----------------------------------------------------------------

export const icon = (name, {size = '48px'} = {}) => /* html */`
<span class="material-symbols-outlined" style=${toCss({fontSize: size, userSelect: 'none'})}>
  ${name}
</span>
`
