import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'
import {setPost} from '../dom/world/post'

import {range, aToO} from '../../lib/util'

export function core() {

  sendCameraPosition({init: [0, 0, 5]})

  const size = 20
  let testMessage = aToO(range(size * size), (i) => {
    const x = (i % size)
    const y = Math.floor(i / size)
    return [
      `post${x}-${y}`,
      {
        v: 'テストポスト' + i,
        p: [x, y]
      },
    ]
  })

  console.log(testMessage)
  setPost(testMessage)
}

//----------------------------------------------------------------


function sendCameraPosition({init}) {
  const [watch] = state({key: 'cameraPosition', init})
  watch((pos) => sendState({cameraPosition: pos}))
}