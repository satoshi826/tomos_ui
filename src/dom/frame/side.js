import {id, addMultiEL, rmMultiEL} from '../../../lib/dom'
import {style} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'
import {watchIsOpenSidebar, setIsOpenSidebar} from './frame'
import {deviceState} from '../../theme/init'

export function side(content = 'sidebar') {

  queueMicrotask(toggleSideber)
  queueMicrotask(dragSideber)

  style.set('#sidebar', style.isDevice('mobile') ? closedSideBarC : sideBarC)
  style.responsive('mobile')('#sidebar', sideBarMobileC)

  return /* html */`
    <div id="sidebar">
      ${content}
    </div>
  `
}

//----------------------------------------------------------------

const sideBarC = {
  ..._.bgC({i: 2}),
  ..._.flex({col: true, align: 'center', gap: '20px'}),
  ..._.py('20px'),
  ..._.dur('0.5s cubic-bezier(0.65, 0, 0.35, 1)'),
  ..._.minW('var(--sidebar-width)'),
  ..._.maxW('var(--sidebar-width)'),
  ..._.h100,
  ..._.rlt,
  contain    : 'strict',
  zIndex     : 1100,
  borderRight: `1px solid ${_.getColor('background', 3, 0.4)}`,
}

const closeC = _.transX('calc(-1 *var(--sidebar-width))')

const closedSideBarC = {...sideBarC, ...closeC}

const sideBarMobileC = {
  ..._.bgC({i: 3, alpha: 0.2}),
  backdropFilter: 'blur(4px) saturate(150%)',
}

//----------------------------------------------------------------

const toggleSideber = () => {
  const sideBarE = id('sidebar')
  const menuButtonE = id('menu-button')
  const [watchIsMobile,, getIsMobile] = deviceState.mobile

  const closeSidebar = (e) => {
    if ((!sideBarE.contains(e.target)) && (!menuButtonE.contains(e.target))) setIsOpenSidebar(false)
  }

  watchIsOpenSidebar((isOpen) => {
    style.set('#sidebar', isOpen ? sideBarC : closedSideBarC)
    rmMultiEL(document, ['mousedown', 'touchstart'], closeSidebar)

    if (isOpen && getIsMobile()) addMultiEL(document, ['mousedown', 'touchstart'], closeSidebar)
  })

  watchIsMobile((isMobile) => {
    if(isMobile) addMultiEL(document, ['mousedown', 'touchstart'], closeSidebar)
    else rmMultiEL(document, ['mousedown', 'touchstart'], closeSidebar)

  })
}

const dragSideber = () => {
  const watchIsMobile = deviceState.mobile[0]
  const sideBarE = id('sidebar')

  let width = sideBarE.offsetWidth
  let start = null
  let now = null
  watchIsMobile((isMobile) => {
    if (!isMobile) {
      sideBarE.ontouchstart = null
      sideBarE.ontouchmove = null
      sideBarE.ontouchend = null
    }
    sideBarE.ontouchmove = ({changedTouches}) => {
      const {clientX} = changedTouches[0]
      start ??= clientX
      now = clientX
      const position = Math.max(0, (start - now))
      sideBarE.setAttribute('style', `transform: translate3D(-${position}px,0px,0px); transition: all 0s;`)
      if ((width / 2) < position) setIsOpenSidebar(false)
    }
    sideBarE.ontouchend = () => {
      start = null
      now = null
      sideBarE.setAttribute('style', '')
    }
  })
}