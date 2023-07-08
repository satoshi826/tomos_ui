import {frame} from './frame'
import {side} from './side'
import {tool} from './tool'
import {nav} from './nav'
import {style} from '../../../lib/theme'

import {cameraPosView} from '../common/cameraPosView'

export default function({content = '',}) {
  return `
  ${frame({
    top   : tool(cameraPosView()),
    side  : side(),
    content,
    bottom: nav(),
  })}`
}
