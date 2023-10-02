import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'
import {aToO, range, values, random, uuid} from '../../lib/util'
import {infra4, mutation} from '../infra'
import {Peer} from '../../lib/webRTC'


const initCamera = [0, 0, 5]
export const [watchCamera, setCamera, getCamera] = state({key: 'cameraPosition', init: initCamera})
export const [watchCurrentTopic, setCurrentTopic, getCurrentTopic] = state({key: 'currentTopic', init: [0, 0]})
export const [watchCurrentArea, setCurrentArea, getCurrentArea] = state({key: 'currentArea', init: [0, 0]})

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

  const peer = new Peer()

  setTimeout(async() => {

    let id = await infra4({getLocal: true}).user.uid()
    if (!id) {
      id = uuid()
      await infra4({setLocal: id}).user.uid()
    }

    const offerSDP = await peer.init()
    console.log('offer')
    console.log(offerSDP)

    infra4(mutation).user.add({
      id,
      offerSDP,
      name: 'hoge'
    }).then((v) => console.log(v))

  }, 1000)

  watchCamera((cameraPosition) => {
    sendState({cameraPosition})

    const [curXX, curYY] = getCurrentTopic() ?? [null, null]
    const [curXXX, curYYY] = getCurrentArea() ?? [null, null]

    const [x, y, z] = cameraPosition

    const xx = 10 * (Math.trunc(x / 10) + Math.sign(x))
    const yy = 10 * (Math.trunc(y / 10) + Math.sign(y))

    const xxx = 100 * (Math.trunc(x / 100) + Math.sign(x))
    const yyy = 100 * (Math.trunc(y / 100) + Math.sign(y))

    if(xxx !== curXXX || yyy !== curYYY) {
      console.log(xxx, yyy)
      setCurrentArea([xxx, yyy])
    }


    if (z > 500) {
      if(curXX !== null) setCurrentTopic(null)
      return
    }

    if (z > 200) {
      const size = 8
      let testMessage = aToO(range(size * size), (i) => {
        const x = (i % size)
        const y = Math.floor(i / size)
        const l = Math.pow(10, random(-1, 2))
        return [
          `post${x + xx}_${y + yy}`,
          {
            'x.y': [x + xx, y + yy],
            m    : l.toFixed(1),
            l
          }
        ]
      })
      addPost(testMessage)
      return
    }

    if(z < 15 && xx !== curXX || yy !== curYY) {
      setCurrentTopic([xx, yy])
    }
  })

  watchCurrentTopic(async(topic) => {
    if (!topic) return
    const [xx, yy] = topic
    const posts = await infra4().post.get({xx, yy})
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

  watchCurrentArea(async() => {
    let id = await infra4({getLocal: true}).user.uid()
    const [x, y] = getCamera()
    infra4(mutation).user.setLocate({
      id,
      x,
      y
    }).then((v) => console.log(v))
  })

  setInterval(async() => {
    let id = await infra4({getLocal: true}).user.uid()
    const topic = getCurrentTopic()
    if (!topic) return
    const [xx, yy] = topic
    const posts = infra4().post.get({xx, yy})

    const [x, y] = getCamera()
    infra4(mutation).user.setLocate({
      id,
      x,
      y
    })

    const [xxx, yyy] = getCurrentArea()
    infra4().user.getByLocate({xxx, yyy}).then(async(res) => {
      const p2p = res
        .filter(u => u.id > id && u.update + 5 * 60 * 1000 > Date.now())
        .map(({offerSDP, id}) => {
          offerSDP, id
        })
      const offer = p2p[0]
      console.log(peer)
      if (offer && !peer.remoteSDP) {
        console.log(peer)
        peer.setOfferSdp(offer.offerSDP).then((answer) => {
          console.log('answer')
          console.log(answer)
          infra4().user.signaling({id: offer.id, sdp: answer}).then(console.log)
        })
      }
      console.log(res)
    })

    const postsObj = aToO(await posts, (post) => {
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
  }, 8000)// 人多い程更新頻度増やす？ tも有効に使う
}

//----------------------------------------------------------------

