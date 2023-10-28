import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'
import {aToO, values} from '../../lib/util'
import {infra4, mutation} from '../infra'
import {getCurrentTopic, getCamera} from '.'

export const [watchPosts, setPosts, getPosts] = state({key: 'worldPosts', init: {}}) // 描画対象のみ
export const [watchAddPosts, setAddPosts, getAddPosts] = state({key: 'worldPostsAdd', init: {}})
export const [watchDelPosts, setDelPosts, getDelPosts] = state({key: 'worldPostsDel', init: {}})

export const addPost = (posts) => {
  setPosts(pre => ({...pre, ...posts}))
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

export const post = () => {

  watchPosts(async(posts) => {
    sendState({
      posts: values(posts).flatMap(v => v['x.y'].map(v => Number(v))),
      lums : values(posts).flatMap(v => v.l)
    })
  })

  setInterval(async() => {
    const topic = getCurrentTopic()
    if (!topic) return
    const [xx, yy] = topic
    const posts = infra4().post.get({xx, yy})
    const [x, y] = getCamera()
    const id = await infra4({getLocal: true}).user.uid()
    id && infra4(mutation).user.setLocate({
      id,
      x,
      y
    })
    const postsObj = aToO(await posts, (post) => {
      const [, x, y] = post.t_x_y.split('_')
      return [
        `post${x}_${y}`,
        {
          'x.y': [x, y],
          m    : post.m
        }
      ]
    })
    addPost(postsObj)
  }, 8000)// 人多い程更新頻度増やす？ tも有効に使う

}

//----------------------------------------------------------------

