import {cache} from './cashe'
import {fetch} from './fetch'

export const getFetch = async({method, key}) => {
  const result = await fetch.get({method, key})
  const now = Date.now()
  cache.set({method, key, value: result, timestamp: now})
  return result
}

export const infra = {
  get: new Proxy({}, {
    get: function(_, method) {
      return async(key) => {
        let result = await cache.get({method, key})
        result ??= await getFetch({method, key})
        return result
      }
    }
  }),
  set: new Proxy({}, {
    get: function(_, method) {
      return new Proxy({}, {
        get: function(_, key) {
          return async(value) => {
            const result = await fetch.set({method, key, value})
            cache.set({method, key, value})
            return result
          }
        }
      })
    }
  })
}