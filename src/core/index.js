import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'
import {aToO, range, values, random} from '../../lib/util'
import {infra, getFetch} from '../infra'

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

export function core() {

  watchCamera((cameraPosition) => {
    sendState({cameraPosition})

    const [curX, curY] = getCurrentTopic() ?? [null, null]
    const [x, y, z] = cameraPosition


    if (z > 500) {
      if(curX !== null) setCurrentTopic(null)
      return
    }

    const X = 10 * (Math.trunc(x / 10) + Math.sign(x))
    const Y = 10 * (Math.trunc(y / 10) + Math.sign(y))

    if (z > 200) {
      const size = 8
      let testMessage = aToO(range(size * size), (i) => {
        const x = (i % size)
        const y = Math.floor(i / size)
        const l = Math.pow(10, random(-1, 2))
        return [
          `post${x + X}_${y + Y}`,
          {
            'x.y': [x + X, y + Y],
            m    : l.toFixed(1),
            l
          }
        ]
      })
      addPost(testMessage)
      return
    }

    if(X !== curX || Y !== curY) {
      setCurrentTopic([X, Y])
    }
  })

  watchCurrentTopic(async(topic) => {
    if (!topic) return
    const [x, y] = topic
    const posts = await infra.posts[`${x}.${y}`]
    const postsObj = aToO(posts, (post) => {
      const [, x, y] = post['t.x.y'].split('.')
      return [
        `post${x}_${y}`,
        {
          'x.y': [x, y],
          m    : post.m,
          l    : Math.pow(10, random(-1, 2))
        }
      ]
    })
    addPost(postsObj)
  })

  watchPosts(async(posts) => {
    sendState({
      posts: values(posts).flatMap(v => v['x.y'].map(v => Number(v))),
      lums : values(posts).flatMap(v => v.l)
    })
  })

  setInterval(() => {
    requestIdleCallback(async() => {
      const topic = getCurrentTopic()
      if (!topic) return
      const [x, y] = topic
      const posts = await getFetch({method: 'posts', key: `${x}.${y}`})
      const postsObj = aToO(posts, (post) => {
        const [, x, y] = post['t.x.y'].split('.')
        return [
          `post${x}_${y}`,
          {
            'x.y': [x, y],
            m    : post.m
          }
        ]
      })
      addPost(postsObj)
    })
  }, 10000)// 人多い程更新頻度増やす？ tも有効に使う

  // const size = 2
  // let testMessage = aToO(range(size * size), (i) => {
  //   const x = (i % size)
  //   const y = Math.floor(i / size)
  //   return [
  //     `post${x}_${y}`,
  //     {
  //       'x.y': [x, y],
  //       m    : 'テストポスト' + i
  //     }
  //   ]
  // })
  // console.log(testMessage)
  // addPost(testMessage)
}

//----------------------------------------------------------------

