import {cache} from './cashe'
import {fetch} from './fetch'

export const getFetch = async({method, key}) => {
  const result = await fetch.get({method, key})
  const nowUNIx = Date.now()
  cache.set({method, key, value: result, timestamp: nowUNIx})
  return result
}

const infraProxy = new Proxy({}, {
  get: function(_, method) {
    return new Proxy({}, {
      get: async function(_, key) {
        let result = await cache.get({method, key})
        // result ??= await indexDB.get({method, key})
        result ??= await getFetch({method, key})
        return result
      },
      set: async function(_, key, value) {
        const result = await fetch.set({method, key, value})
        cache.set({method, key, value})
        return true
      }
      // apply: function(target, thisArg, argumentsList) {
      //   console.log(target, thisArg, argumentsList)
      //   return true
      // }
    })
  }
})
export let infra = infraProxy

// export let infra = new Proxy({}, {
//   // set: function(_, prop, f) {
//   //   console.log(_, prop, f)
//   //   return true
//   // },
//   get: function(_, prop) {
//     console.log(_, prop)
//     return new Proxy({}, {
//       get: function(_, prop) {
//         console.log(_, prop)
//         return true
//       }
//     })
//   }
//   // apply: function(target, thisArg, argumentsList) {
//   //   console.log(target, thisArg, argumentsList)
//   //   return true
//   // }
// })

