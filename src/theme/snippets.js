export const snippets = {
  grid: {display: 'grid'},
  flex: ({align, justify, gap, col} = {}) => ({
    display: 'flex',
    ...col && {flexDirection: 'column'},
    ...align && {alignItems: align},
    ...justify && {justifyContent: justify},
    ...gap && {gap}
  }),
  p     : (v) => ({padding: v}),
  pxy   : (x, y) => ({padding: `${y} ${x}`}),
  px    : (x) => ({padding: `0px ${x}`}),
  py    : (y) => ({padding: `${y} 0px`}),
  pt    : (t) => ({paddingTop: t}),
  pb    : (b) => ({paddingBottom: b}),
  pr    : (r) => ({paddingRight: r}),
  pl    : (l) => ({paddingLeft: l}),
  f     : (v) => ({fontSize: v}),
  dur   : (t, type = 'all') => ({transition: `${type} ${t}`}),
  w     : (w) => ({width: w}),
  minW  : (w) => ({minWidth: w}),
  maxW  : (w) => ({maxWidth: w}),
  h     : (h) => ({height: h}),
  minH  : (h) => ({minHeight: h}),
  maxH  : (h) => ({maxHeight: h}),
  wh    : (wh) => ({height: wh, width: wh}),
  bRd   : (br) => ({borderRadius: br}),
  transX: (x) => ({transform: `translate3D(${x}, 0px, 0px)`}),
  transY: (y) => ({transform: `translate3D(0px, ${y}, 0px)`}),
  trans : ({x, y}) => ({transform: `translate(${x}, ${y})`}),
  h100  : {height: '100%'},
  w100  : {width: '100%'},
  wh100 : {
    height: '100%',
    width : '100%'
  },
  abs: {
    position: 'absolute'
  },
  rlt: {
    position: 'relative'
  },
  nonSel: {
    userSelect: 'none'
  },
  nonEve: {
    pointerEvents: 'none'
  },
  nowrap: {
    whiteSpace: 'nowrap'
  },
  breakWord: {
    wordWrap: 'break-word'
  },
  bgC({type = 'background', i = 0, val, alpha} = {}) {
    if(val) return {backgroundColor: val}
    return {backgroundColor: this.getColor(type, i, alpha)}
  },
  txC({type = 'text', i = 0, val, alpha} = {}) {
    if(val) return {color: val}
    return {color: this.getColor(type, i, alpha)}
  },
  txGrow(size) {
    return{textShadow: `
      0 0 ${size / 2}px ${this.getColor('primary', -1, 0.8)},
      0 0 ${size * 2}px ${this.getColor('primary', 0, 0.8)},
      0 0 ${size * 4}px ${this.getColor('primary', 1, 0.8)},
      0 0 ${size * 6}px ${this.getColor('primary', 2, 0.8)}
    `
    }
  },
  bgGrow(size = 2) {
    return{boxShadow: `
      0 0 ${size / 2}px 0px  ${this.getColor('primary', -1, 0.8)},
      0 0 ${size * 2}px 0px  ${this.getColor('primary', 0, 0.8)},
      0 0 ${size * 4}px 0px  ${this.getColor('primary', 1, 0.8)},
      0 0 ${size * 8}px 0px  ${this.getColor('primary', 2, 0.8)}
  `}
  },
  bgBlur(size = 2) {
    return{boxShadow: `
      0 0 ${size / 2}px 0px  ${this.getColor('background', 0, 0.8)},
      0 0 ${size}px 0px  ${this.getColor('background', 0, 0.8)},
      0 0 ${size * 2}px 0px  ${this.getColor('background', 1, 0.8)}
  `}
  },
  getColor: (type, i, alpha) => alpha ? `rgba(var(--${type}${i}-rgb),${alpha})` : `var(--${type}${i})`
}