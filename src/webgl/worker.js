self.window ??= self
import {main} from './main'
import {Core} from '../../lib/glFrag/Core'
import {setState} from '../../lib/glFrag/state'

onmessage = ({data}) => {
  data.init && init(data.init)
  data.state && state(data.state)
}

function init(init) {
  const core = new Core(init)
  main(core)
}

function state(state) {
  setState(state)
}