import {state} from '../../../../lib/state'

import {postItem} from './postItem'
import {postButton} from './postButton'
import {postEditor} from './postEditor'

export const [watchEditPostMode, setEditPostMode, getEditPostMode] = state({key: 'isEditPostMode', init: false})

export function init() {
  postItem()
  postButton()
  postEditor()
}