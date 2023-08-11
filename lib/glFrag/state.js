import {oForEach} from '../util'

let state = {}

export const getState = (key) => {
  return state?.[key]?.value
}

export const setState = async(object) => {
  oForEach(object, ([k, v]) => {
    state[k] ??= {}
    state[k].value = v
    state[k].handler?.forEach(async(f) => f(v))
  })
}

export const setHandler = (key, f) => {
  state[key] ??= {}
  state[key].handler ??= new Set()
  state[key].handler.add(f)
  f(state[key].value)
}

export const sendState = (obj) => {
  self.postMessage(obj)
}