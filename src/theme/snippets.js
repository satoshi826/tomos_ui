export const snippets = {
  grid: {display: 'grid'},
  flex: ({align, justify, gap, col} = {}) => ({
    display: 'flex',
    ...col && {flexDirection: 'column'},
    ...align && {alignItems: align},
    ...justify && {justifyContent: justify},
    ...gap && {gap},
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
  dur   : (t, type = 'all') => ({transition: `${type} ${t}`,}),
  w     : (w) => ({width: w}),
  minW  : (w) => ({minWidth: w}),
  maxW  : (w) => ({maxWidth: w}),
  h     : (h) => ({height: h}),
  minH  : (h) => ({minHeight: h}),
  maxH  : (h) => ({maxHeight: h}),
  wh    : (wh) => ({height: wh, width: wh}),
  bRd   : (br) => ({borderRadius: br}),
  transX: (x) => ({transform: `translateX(${x})`}),
  transY: (y) => ({transform: `translateY(${y})`}),
  trans : ({x, y}) => ({transform: `translate(${x}, ${y})`}),
  h100  : {height: '100%'},
  w100  : {width: '100%'},
  wh100 : {
    height: '100%',
    width : '100%',
  },
  abs: {
    position: 'absolute',
  },
  rlt: {
    position: 'relative',
  },
  nonSel: {
    userSelect: 'none',
  },
  nonEve: {
    pointerEvents: 'none'
  },
  nowrap: {
    whiteSpace: 'nowrap'
  },
  bgC: ({type = 'background', i = 0, val, alpha} = {}) => {
    if(val) return {backgroundColor: val}
    if(alpha) return {backgroundColor: `rgba(var(--${type}${i}-rgb),${alpha})`}
    return {backgroundColor: `var(--${type}${i})`}
  },
  txC: ({type = 'text', i = 0, val, alpha} = {}) => {
    if(val) return {color: val}
    if(alpha) return {color: `rgba(var(--${type}${i}-rgb),${alpha})`}
    return {color: `var(--${type}${i})`}
  }
}