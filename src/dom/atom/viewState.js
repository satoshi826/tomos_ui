import {state} from '../../../lib/state'
import {id} from '../../../lib/dom'

export function viewState({key}) {

  queueMicrotask(() => {
    const watch = state({key})[0]
    const viewE = id(`view-${key}`)
    watch((v) => viewE.innerText = key + ' : ' + v)
  })

  return /* html */`
      <div id="view-${key}">
        ${key} : wait...
      </div>
  `
}
