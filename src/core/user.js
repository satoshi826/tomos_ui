import {infra4} from '../infra'
import {state} from '../../lib/state'
import {getCurrentArea, getCamera} from '.'
import {aToO, isEmptyO, isExpiration, values} from '../../lib/util'
import {sendState} from '../dom/canvas'

export const [watchUsers, setUsers, getUsers] = state({key: 'worldUsers', init: {}})
export const [watchAddUsers, setAddUsers, getAddUsers] = state({key: 'worldUsersAdd', init: {}})
export const [watchDelUsers, setDelUsers, getDelUsers] = state({key: 'worldUsersDel', init: {}})

export let id
export const getId = () => id

export const addUser = (posts) => {
  console.log()
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

  queueMicrotask(async() => {
    id = await infra4({getLocal: true}).user.uid()
  })

  setInterval(async() => {
    const [xxx, yyy] = getCurrentArea()
    infra4({ttl: 1, diff: true}).user.getByLocate({xxx, yyy}).then(users => {
      const filtered = users.filter(user => isExpiration(user.update, 60))
      const usersObj = aToO(filtered, ({id, ...v}) => [id, v])
      !isEmptyO(usersObj) && addUser(usersObj)
    })

    const [x, y] = getCamera()
    id && infra4({throttle: 1}).user.setLocate({
      id,
      x,
      y
    })


  }, 1000)

  watchUsers(users => {
    sendState({users: values(users).flatMap(v => v.x_y.split('_').map(v => Number(v)))})
  })

}

//----------------------------------------------------------------

