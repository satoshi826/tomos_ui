import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'
import {setPost} from '../dom/world/post'

export function core() {

  sendCameraPosition({init: [0, 0, 10]})

  const testMessage = {
    testId1: {
      v: 'this is test message1',
      p: [-5, 5]
    },
    testId2: {
      v: 'this is test message2',
      p: [-5, -5]
    },
  }
  setPost(testMessage)
}

//----------------------------------------------------------------


function sendCameraPosition({init}) {
  const [watch] = state({key: 'cameraPosition', init})
  watch((pos) => sendState({cameraPosition: pos}))
}