import {id} from '../../../lib/dom'
import {state} from '../../../lib/state'
import {style} from '../../../lib/theme'
import {snippets as _} from '../../theme/snippets'

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
  ..._.dur('0.35s'),
  ..._.minW('var(--sidebar-width)'),
  ..._.maxW('var(--sidebar-width)'),
  ..._.h100,
  ..._.rlt,
  zIndex     : 1100,
  borderRight: '1.5px solid var(--background2)',
}

const closeC = _.transX('calc(-1 *var(--sidebar-width))')

const closedSideBarC = {...sideBarC, ...closeC}

const sideBarMobileC = {
  ..._.bgC({i: 3, alpha: 0.1}),
  backdropFilter: 'blur(4px) saturate(150%)',
}

//----------------------------------------------------------------

const toggleSideber = () => {
  const sideBarE = id('sidebar')
  const menuButtonE = id('menu-button')
  const [watchIsOpen, setIsOpen] = state({key: 'isOpenSidebar'})
  const [watchIsMobile,, getIsMobile] = state({key: 'ismobile'})

  const closeSidebar = (e) => {
    if ((!sideBarE.contains(e.target)) && (!menuButtonE.contains(e.target))) setIsOpen(false)
  }

  watchIsOpen((isOpen) => {
    style.set('#sidebar', isOpen ? sideBarC : closedSideBarC)
    document.removeEventListener('mousedown', closeSidebar)
    document.removeEventListener('touchstart', closeSidebar)
    if (isOpen && getIsMobile()) {
      document.addEventListener('mousedown', closeSidebar)
      document.addEventListener('touchstart', closeSidebar)
    }
  })

  watchIsMobile((isMobile) => {
    if(isMobile) {
      document.addEventListener('mousedown', closeSidebar)
      document.addEventListener('touchstart', closeSidebar)
    } else{
      document.removeEventListener('mousedown', closeSidebar)
      document.removeEventListener('touchstart', closeSidebar)
    }
  })
}

const dragSideber = () => {
  const watch = state({key: 'ismobile'})[0]
  const set = state({key: 'isOpenSidebar'})[1]
  const sideBarE = id('sidebar')

  let width = sideBarE.offsetWidth
  let start = null
  let now = null
  watch((isMobile) => {
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
      if ((width / 2) < position) set(false)
    }
    sideBarE.ontouchend = () => {
      start = null
      now = null
      sideBarE.setAttribute('style', '')
    }
  })
}