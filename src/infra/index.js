import {cache} from './cashe'
import {fetch} from './fetch'

const getFetch = async({method, key}) => {
  const result = await fetch.get({method, key})
  cache.set({method, key, value: result, timestamp: Date.now()})
  return result
}

export let infra = new Proxy({}, {
  get: function(_, method) {
    return new Proxy({}, {
      get: async function(_, key) {
        let result = await cache.get({method, key})
        // result ??= await indexDB.get({method, key})
        result ??= await getFetch({method, key})
        return result
      }
    })
  }
})



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

