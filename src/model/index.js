import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'

export function model() {

  const [watch] = state({key: 'cameraPosition', init: [0, 0, 10]})
  watch((pos) => sendState({cameraPosition: pos}))

}
