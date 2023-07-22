import {toCss} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'

export function divider() {
  return /* html */`
      <div style="${toCss({
    borderBottom: `1px solid ${_.getColor('text', 3, 0.3)}`,
    ..._.h('0px'),
    ..._.w('100%')
  })}"></div>
  `
}
