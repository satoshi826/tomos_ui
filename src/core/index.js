import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'
import {range, aToO} from '../../lib/util'

const initCamera = [0, 0, 5]
export const [watchCamera, setCamera, getCamera] = state({key: 'cameraPosition', init: initCamera})
export const [watchCurrentTopic, setCurrentTopic, getCurrentTopic] = state({key: 'currentTopic', init: [0, 0]})

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

export const getPost = (x, y) => getPosts()[`post${x}_${y}`]
export const setPost = (v) => setPosts((pre) => ({...pre, ...v}))
export const fetchPost = (x, y) => console.log('fetchPost', x, y)

export function core() {

  watchCamera((cameraPosition) => {
    sendState({cameraPosition})

    const [curX, curY] = getCurrentTopic() ?? [null, null]
    const [x, y, z] = cameraPosition

    if (z > 10) {
      if(curX !== null) setCurrentTopic(null)
      return
    }

    const X = 10 * (Math.trunc(x / 10) + Math.sign(x))
    const Y = 10 * (Math.trunc(y / 10) + Math.sign(y))
    if(X !== curX || Y !== curY) {
      setCurrentTopic([X, Y])
    }
  })

  watchCurrentTopic(([x, y]) => {
    fetchPost(x, y)
  })

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

