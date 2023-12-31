import {state} from '../../lib/state'
import {sendState} from '../dom/canvas'
import {aToO, range, random} from '../../lib/util'
import {infra4, mutation} from '../infra'
import {PeerManager} from '../infra/webRTC/peerManager'
import {addPost, post} from './post'
import {user, getId} from './user'
import {mouse} from './mouse'

const initCamera = [0, 0, 5]
export const [watchCamera, setCamera, getCamera] = state({key: 'cameraPosition', init: initCamera})
export const [watchCurrentTopic, setCurrentTopic, getCurrentTopic] = state({key: 'currentTopic', init: [0, 0]})
export const [watchCurrentArea, setCurrentArea, getCurrentArea] = state({key: 'currentArea', init: [0, 0]})

export let peerManager

export function core() {
  post()
  user()
  mouse()
  getId().then(id => {
    peerManager = new PeerManager({myUserId: id})
    peerManager.signalingLoop()
  })

  watchCamera((cameraPosition) => {
    sendState({cameraPosition})
    peerManager?.dcSendForAll({type: 'userPos', value: [cameraPosition[0], cameraPosition[1]]})

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
      const [, x, y] = post.t_x_y.split('_')
      return [
        `post${x}_${y}`,
        {
          'x.y': [x, y],
          m    : post.m,
          l    : post.l ?? Math.pow(10, random(-1, 2))
        }
      ]
    })
    addPost(postsObj)
  })

  watchCurrentArea(async() => {
    const [x, y] = getCamera()
    getId() && infra4(mutation).user.setLocate({
      id: getId(),
      x : x.toFixed(3),
      y : y.toFixed(3)
    })
  })

}

//----------------------------------------------------------------

