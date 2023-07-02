export const values = (object) => Object.values(object)

export const keys = (object) => Object.keys(object)

export const oLength = (object) => Object.keys(object).length

export const oForEach = (object, f) => Object.entries(object).forEach(f)

export const oMap = (object, f) => Object.entries(object).map(f)

export const oReduce = (object, f, int) => Object.entries(object).reduce(f, int)

export const oMapO = (object, f) => Object.entries(object).reduce((obj, [k, v]) => {
  const [newK, newV] = f([k, v])
  obj[newK] = newV
  return obj
}, {})

export const shake = (object) => Object?.keys(object).reduce((obj, cur) => {
  if(!(this[cur] === undefined || this[cur] === null)) obj[cur] = this[cur]
  return obj
}, {})

export const range = (num) => [...Array(num).keys()]

export const fill = (num, val) => [...Array(num).fill(val)]

export const unique = (array) => [...new Set(array)]

export const random = (min = 0, max = 1) => Math.random() * (max - min) + min

export const sleep = async(ms) => await new Promise(_ => setTimeout(_, ms))

export const throttle = (f, delay) => {
  let timer = 0
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => f.apply(this, args), delay)
  }
}