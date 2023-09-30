import {isNil, oMapO, oForEach, oForEachV, oForEachK} from '../../lib/util'
import {cache} from './cashe'
// import {fetch} from './fetch'
import {Fetcher} from '../../lib/fetch'
import {API_ENDPOINT} from '../../constants'

const fetcher = new Fetcher(API_ENDPOINT)

export const query = {ttl: 120}
export const mutation = {throttle: 10}

//----------------------------------------------------------------

let fetchQueue
const resetQueue = () => fetchQueue = {}
resetQueue()

//----------------------------------------------------------------

let timerId = null
const setFetchTimer = () => {
  timerId = !isNil(timerId) ? timerId : setTimeout(async() => {
    try {
      const fetchBody = oMapO(fetchQueue, ([type, methods]) => [type,
        oMapO(methods,
          ([method, {args}]) => {
            return [method, args ?? null]
          })
      ])
      const result = await fetchQL(fetchBody)
      const timestamp = Date.now()
      oForEach(fetchBody, ([type, methods]) =>
        oForEachK(methods,
          (method) => fetchQueue[type][method].resolve({
            result: result[type][method],
            timestamp
          }))
      )
      console.debug('result', result)
    } catch (err) {
      oForEachV(fetchQueue, (methods) =>
        oForEachV(methods, ({reject}) => reject(err))
      )
    } finally {
      resetQueue()
      timerId = null
    }
  }, 500)
}

//----------------------------------------------------------------

const enqueue = ({type, method, args}) => {
  console.debug('enqueue', type, method, args)
  fetchQueue[type] ??= {}
  setFetchTimer()
  return new Promise((resolve, reject) => {
    if (fetchQueue[type][method]) {
      reject(`already enqueued method "${type}-${method}"`)
      console.debug(fetchQueue)
    }
    fetchQueue[type][method] = {
      args,
      resolve,
      reject
    }
  })
}

//----------------------------------------------------------------

// swrも仕込む
export const infra4 = ({ttl, throttle, setLocal, getLocal} = query) => new Proxy({}, {
  get: (_, type) => new Proxy({}, {
    get: (_, method) => async(args = null) => {
      if (getLocal || ttl || throttle) {
        const cacheVal = await cache.get({type, method, args: throttle ? null : args, ttl: throttle ?? ttl ?? 0})
        if (!isNil(cacheVal) || getLocal) return cacheVal
      }
      const {result, timestamp} = isNil(setLocal) ? await enqueue({type, method, args}) : {result: setLocal, timestamp: Infinity}
      if (setLocal || ttl || throttle) {
        cache.set({type, method, args: throttle ? null : args, value: throttle ? true : result, timestamp})
      }
      return result
    }
  })
})

//----------------------------------------------------------------

const fetchQL = async(fetchBody) => {
  const result = fetcher.post({
    path: '/ql',
    body: fetchBody
  })
  return result
}

