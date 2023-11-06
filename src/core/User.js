import {infra4} from '../infra'
import {state} from '../../lib/state'
import {getCurrentArea, getCamera, peerManager} from '.'
import {aToO, isEmptyO, isExpiration, values, uuid} from '../../lib/util'
import {sendState} from '../dom/canvas'

export const [watchUsers, setUsers, getUsers] = state({key: 'worldUsers', init: {}})
export const [watchAddUsers, setAddUsers, getAddUsers] = state({key: 'worldUsersAdd', init: {}})
export const [watchDelUsers, setDelUsers, getDelUsers] = state({key: 'worldUsersDel', init: {}})

export let id
infra4({getLocal: true}).user.uid().then(uid => {
  if(uid) id = uid
  else{
    id = uuid()
    infra4({setLocal: id}).user.uid()
  }
})


export const getId = () => new Promise((resolve) => {
  if (id) resolve(id)
  else {
    const timer = setInterval(() => {
      if (id) {
        resolve(id)
        clearInterval(timer)
      }
    }, 200)
  }
})

export const addUser = (posts) => {
  setUsers(pre => ({...pre, ...posts}))
  setAddUsers(posts)
}

export const delUser = (keys) => {
  setUsers(pre => {
    keys.forEach(key => {
      if(pre[key]) delete pre[key]
    })
    return pre
  })
  setDelUsers(keys)
}

export const user = () => {

  setTimeout(() => {
    peerManager.addMessageHandler('userPos', ({from, value}) => {
      addUser({
        [from]: {
          x_y: `${value[0]}_${value[1]}`
        }
      })
    })
  }, 500)

  setInterval(async() => {
    const [xxx, yyy] = getCurrentArea()
    infra4({ttl: 2, diff: true}).user.getByLocate({xxx, yyy}).then(users => {
      const filtered = users.filter(user => isExpiration(user.update, 30))
      const usersObj = aToO(filtered, ({id, ...v}) => [id, v])
      !isEmptyO(usersObj) && addUser(usersObj)// RTCは除く
    })

    const [x, y] = getCamera()
    id && infra4({throttle: 1}).user.setLocate({id, x, y})
    //定期的に古いの削除する
  }, 5000)

  watchUsers(users => {
    sendState({users: values(users).flatMap(({x_y}) => x_y.split('_').map(v => Number(v)))})
  })

}

//----------------------------------------------------------------

