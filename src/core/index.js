import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'
import {range, aToO} from '../../lib/util'

const initCamera = [0, 0, 5]
export const [watchCamera, setCamera, getCamera] = state({key: 'cameraPosition', init: initCamera})
export const [watchPosts, setPosts, getPosts] = state({key: 'worldPosts', init: {}})
export const [watchAddPosts, setAddPosts, getAddPosts] = state({key: 'worldPostsAdd', init: {}})
export const [watchDelPosts, setDelPosts, getDelPosts] = state({key: 'worldPostsDel', init: {}})

export const addPost = (posts) => {
  setPosts(pre => ({...posts, ...pre}))
  setAddPosts(posts)
}

export const delPost = (keys) => {
  setPosts(pre => {
    keys.forEach(key => {
      if(pre[key]) delete pre[key]
    })
    return pre
  })
  setDelPosts(keys)
}

export const fetchPost = (x, y) => {
  console.log('fetchPost', x, y)
}

export const getPost = (x, y) => getPosts()[`post${x}_${y}`]
export const setPost = (v) => setPosts((pre) => ({...pre, ...v}))

export function core() {
  watchCamera((cameraPosition) => sendState({cameraPosition}))

  const size = 2
  let testMessage = aToO(range(size * size), (i) => {
    const x = (i % size)
    const y = Math.floor(i / size)
    return [
      `post${x}_${y}`,
      {
        v: 'テストポスト' + i,
        p: [x, y]
      }
    ]
  })

  console.log(testMessage)
  addPost(testMessage)
}

//----------------------------------------------------------------

