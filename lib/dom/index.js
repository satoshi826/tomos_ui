
export const qs = (selector) => customEl(document.querySelector(selector))

export const qsA = (selector) => customEl(document.querySelectorAll(selector))

export const _qsA = (root, selector) => root.querySelectorAll(selector)

export const id = (id) => customEl(document.getElementById(id))

export const name = (name) => customEl(document.getElementsByName(name))

export const className = (name) => customEl(document.getElementsByName(name))

export const _className = (root, name) => root.getElementsByClassName(name)

export const customEl = (el) => {// prototypeで書き直したい

  if (!el) return el

  if(Array.isArray(el)) {
    el.forEach(setEListenerMethod)
  }else{
    setEListenerMethod(el)
  }
  return el
}

const setEListenerMethod = (el) => {
  el._on = new Proxy({}, {
    set: function(_, prop, f) {
      el.addEventListener(prop, f, {passive: true})
      return true
    }
  })
  el._rm = new Proxy({}, {
    get: function(_, prop) {
      return (f) => el.removeEventListener(prop, f)
    }
  })
}

export const beforeend = (el, dom) => el.insertAdjacentHTML('beforeend', dom)

export const addMultiEL = (el, e, f) => e.forEach(event => el.addEventListener(event, f))

export const rmMultiEL = (el, e, f) => e.forEach(event => el.removeEventListener(event, f))