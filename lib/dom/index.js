
export const qs = (selector) => customEl(document.querySelector(selector))

export const qsA = (selector) => customEl(document.querySelectorAll(selector))

export const id = (id) => customEl(document.getElementById(id))

export const name = (name) => customEl(document.getElementsByName(name))

const customEl = (el) => {

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
      el.addEventListener(prop, f)
      return true
    }
  })
  el._rm = new Proxy({}, {
    get: function(_, prop) {
      return (f) => el.removeEventListener(prop, f)
    }
  })
}