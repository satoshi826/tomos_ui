import {state} from '../../../lib/state'
import {id} from '../../../lib/dom'

const [watch, set] = state({key: 'worldPosts', init: })

function posts({key}) {

  queueMicrotask(() => {
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

export const setPost = (posts) => {
  arrayed(posts).forEach()
  set
}
