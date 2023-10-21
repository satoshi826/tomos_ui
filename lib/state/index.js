let _stateObj = {}

export function state({key, init = undefined}) {

  if(_stateObj[key] === undefined) {
    _stateObj[key] = {value: init, func: new Set()}
  }

  if(_stateObj[key].value === undefined) {
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
      const value = (typeof v === 'function') ? v(_stateObj[key].value) : v
      if (value === undefined) throw new Error('can\'t set undefined value')
      _stateObj[key].value = value
      _stateObj[key].func.forEach(async(f) => f(_stateObj[key].value))
    },
    () => _stateObj[key].value // getter
  ]
}

//TODO：watcherの数監視する