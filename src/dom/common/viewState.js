import {state} from '../../../lib/state'
import {id} from '../../../lib/dom'

export function viewState({key, handler}) {

  requestAnimationFrame(() => {
    const watch = state({key})[0]
    const viewE = id(`view-${key}`)
    watch((v) => viewE.innerText = key + ' : ' + handler ? handler(v) : v)
  })

  return /* html */`
      <div id="view-${key}">
        ${key} : wait...
      </div>
  `
}
