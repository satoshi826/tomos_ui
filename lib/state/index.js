let _stateObj = {}

export function state({key, init = undefined}) {

  if(_stateObj[key] === undefined) {
    _stateObj[key] = {value: init, func: new Set()}
  }

  if(_stateObj[key] && _stateObj[key].value === undefined) {
    _stateObj[key].value = init
    _stateObj[key].func.forEach((f) => f(_stateObj[key].value))
  }

  return [
    (f) => { // watcher
      f(_stateObj[key].value)
      _stateObj[key].func.add(f)
      return () => _stateObj[key].func.delete(f) // omitter
    },
    (v) => { // setter
      // if(v === undefined) v = null
      _stateObj[key].value = (typeof v === 'function') ? v(_stateObj[key].value) : v
      _stateObj[key].func.forEach((f) => f(_stateObj[key].value))
    },
    () => _stateObj[key].value // getter
  ]
}