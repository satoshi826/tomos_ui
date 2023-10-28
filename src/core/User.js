import {infra4} from '../infra'
import {state} from '../../lib/state'
import {getCurrentArea} from '.'
import {aToO} from '../../lib/util'

export const [watchUsers, setUsers, getUsers] = state({key: 'worldUsers', init: {}})
export const [watchAddUsers, setAddUsers, getAddUsers] = state({key: 'worldUsersAdd', init: {}})
export const [watchDelUsers, setDelUsers, getDelUsers] = state({key: 'worldUsersDel', init: {}})

export const addUser = (posts) => {
  setUsers(pre => ({...posts, ...pre}))
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

  setInterval(async() => {
    const [xxx, yyy] = getCurrentArea()
    const users = await infra4({ttl: 5, diff: true}).user.getByLocate({xxx, yyy})
    const usersObj = aToO(users, ({id, ...v}) => [id, v])
    addUser(usersObj)
  }, 1000)

  watchUsers(users => {
    console.log(users)
  })

}

//----------------------------------------------------------------

