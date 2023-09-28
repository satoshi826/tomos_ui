export const values = (object) => Object.values(object)

export const keys = (object) => Object.keys(object)

export const oLength = (object) => Object.keys(object).length

export const oForEach = (object, f) => Object.entries(object).forEach(f)

export const oForEachK = (object, f) => Object.keys(object).forEach(f)

export const oForEachV = (object, f) => Object.values(object).forEach(f)

export const oMap = (object, f) => Object.entries(object).map(f)

export const oReduce = (object, f, int) => Object.entries(object).reduce(f, int)

export const oMapO = (object, f) => Object.entries(object).reduce((obj, [k, v]) => {
  const [newK, newV] = f([k, v])
  obj[newK] = newV
  return obj
}, {})

export const aToO = (array, f) => array.reduce((obj, cur) => {
  const [k, v] = f(cur)
  obj[k] = v
  return obj
}, {})

export const shake = (object) => Object?.keys(object).reduce((obj, cur) => {
  if(!(this[cur] === undefined || this[cur] === null)) obj[cur] = this[cur]
  return obj
}, {})

export const keyValueMono = (object) => Object.entries(object)[0]

export const isEmptyO = (object) => !Object.keys(object).length

export const isNil = (v) => v === null || v === undefined

export const range = (num) => [...Array(num).keys()]

export const fill = (num, val) => [...Array(num).fill(val)]

export const unique = (array) => [...new Set(array)]

export const random = (min = 0, max = 1) => Math.random() * (max - min) + min

export const clamp = (x, min, max) => Math.min(Math.max(x, min), max)

export const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(a) {
  let r = (new Date().getTime() + Math.random() * 16) % 16 | 0, v = a === 'x' ? r : (r & 0x3 | 0x8)
  return v.toString(16)
})

export const sleep = async(ms) => await new Promise(_ => setTimeout(_, ms))

export const arrayed = (v) => Array.isArray(v) ? v : [v]

export const debounce = (f, timeout) => {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      f.apply(this, args)
    }, timeout)
  }
}

export const easing = async(before, target, dur, func, easingFunc) => new Promise(
  (resolve) => {
    let val = before
    let start = performance.now()
    let currnet = start
    let elapsed = 0
    let progressLate = 0

    const diff = (target - before)
    easingFunc ??= (x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

    const run = () => {
      if (elapsed < dur) {
        currnet = performance.now()
        elapsed = currnet - start
        progressLate = elapsed / dur
        val = before + easingFunc(progressLate) * diff
        if(val < target) func(val)
        requestAnimationFrame(run)
      }else {
        func(target)
        resolve()
      }
    }
    requestAnimationFrame(run)
  })
