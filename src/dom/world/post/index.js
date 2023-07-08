import {state} from '../../../../lib/state'
import {id} from '../../../../lib/dom'
import {oForEach} from '../../../../lib/util'
import {style} from '../../../../lib/theme'
import {snippets as _} from '../../../theme/snippets'

const [watchPosts, set] = state({key: 'worldPosts', init: {}})
const [watchResize] = state({key: 'resize'})
const [watchCamera] = state({key: 'cameraPosition'})

export function showPosts() {

  const app = id('app')
  let postsContainer = document.createElement('div')
  postsContainer.id = 'postsContainer'
  app.appendChild(postsContainer)
  style.set('#postsContainer', {..._.nonSel, ..._.abs, zIndex: 1000, ..._.wh('0px')})
  style.set('.worldPost', {..._.abs})

  watchPosts(posts => {
    oForEach(posts, ([k, post]) => {
      console.log(`${k}:`, post)
      let postEl = document.createElement('div')
      postEl.id = `post-${k}`
      postEl.className = 'worldPost'
      postEl.innerText = post.v
      postEl.dataset.postionX = post.p[0]
      postEl.dataset.postionY = post.p[1]
      postsContainer.appendChild(postEl)
    })
  })


  watchCamera(([x, y, z]) => {
    requestAnimationFrame(() => {
      postsContainer.childNodes.forEach((node) => {
        const {postionX, postionY} = node.dataset
        node.setAttribute('style', `transform: translate(${x}px, ${y}px); transition: all 0s;`)
      })
    })
    // postsContainer = id('postsContainer')
    // let postsContainerFrag = document.createDocumentFragment()
    // postsContainerFrag = postsContainer.cloneNode(true)
    // postsContainerFrag.childNodes.forEach((node) => {
    //   const {postionX, postionY} = node.dataset
    //   node.setAttribute('style', `transform: translate(${x}px, ${y}px); transition: all 0s;`)
    // })
    // postsContainer.replaceWith(postsContainerFrag)
    // console.log([x, y, z])
    // console.log(postsContainer.children)
  })

}

const showPostHandler = (v) => {
  console.log(v)
}

export const setPost = (posts) => {
  set((pre) => {
    return {...pre, ...posts}
  })
}