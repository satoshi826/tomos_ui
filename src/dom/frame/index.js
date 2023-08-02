import {frame} from './frame'
import {side} from './side'
import {tool} from './tool'
import {nav} from './nav'

import {cameraPosView} from '../common/cameraPosView'
import {viewState} from '../common/viewState'

export default function({content = ''}) {
  return `
  ${frame({
    top : tool(cameraPosView()),
    side: side(
      ` ${viewState({key: 'fps'})}
        ${viewState({key: 'drawTime'})}`
    ),
    content,
    bottom: nav()
  })}`
}
