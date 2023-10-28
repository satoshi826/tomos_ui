import {isNil, oMapO, oForEach, oForEachV, oForEachK, arrayed, deepEquals} from '../../lib/util'
import {cache} from './cashe'
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
      const fetchBody =
      oMapO(fetchQueue, ([type, methods]) =>
        [type, oMapO(methods, ([method, v]) => {
          if (!Array.isArray(v)) return [method, v.args ?? null]
          return [method, v.map(({args}) => args ?? null)]
        })
        ])
      const result = await fetchQL(fetchBody)
      const timestamp = result._time
      oForEach(fetchBody, ([type, methods]) =>
        oForEachK(methods, (method) => {
          if (Array.isArray(fetchQueue[type][method])) {
            fetchQueue[type][method].forEach(({resolve}, i) => {
              resolve({
                result: result[type][method][i],
                timestamp
              })
            })
          }else {
            fetchQueue[type][method].resolve({
              result: result[type][method],
              timestamp
            })
          }
        })
      )
      console.debug('fetch result', result)
    } catch (err) {
      oForEachV(fetchQueue, (methods) =>
        oForEachV(methods, (v) => arrayed(v).forEach(({reject}) => reject()))
      )
    } finally {
      resetQueue()
      timerId = null
    }
  }, 500)
}

//----------------------------------------------------------------

const enqueue = ({type, method, args, parallel, series}) => {
  console.debug('enqueue', type, method, args)
  fetchQueue[type] ??= {}
  setFetchTimer()
  return new Promise((resolve, reject) => {
    if (fetchQueue[type][method]) {
      if(parallel) {
        fetchQueue[type][method] = [...arrayed(fetchQueue[type][method]), {args, resolve, reject}]
        return
      }
      if(series) {
        if (!deepEquals(fetchQueue[type][method].args, args)) {
          reject(`invaild series args "${type}-${method}"`, args, fetchQueue[type][method].arg)
        }else{
          const prevResolve = fetchQueue[type][method].resolve
          fetchQueue[type][method].resolve = (e) => {
            prevResolve(e)
            resolve(e)
          }
          const prevReject = fetchQueue[type][method].reject
          fetchQueue[type][method].reject = (e) => {
            prevReject(e)
            reject(e)
          }
        }
        return
      }
      reject(`already enqueued method "${type}-${method}"`)
    }
    fetchQueue[type][method] = {args, resolve, reject}
  })
}

//----------------------------------------------------------------

// swrも仕込む
// mergeオプションも付ける
export const infra4 = ({ttl, throttle, setLocal, getLocal, parallel, series, diff} = query) => new Proxy({}, {
  get: (_, type) => new Proxy({}, {
    get: (_, method) => async(args = null) => {
      let cacheObject
      if (getLocal || ttl || throttle) {
        cacheObject = await cache.get({type, method, args: throttle ? null : args})
        if (!isNil(cacheObject)) {
          if (cacheObject.timestamp + (throttle ?? ttl ?? 0) * 1000 > Date.now()) {
            console.debug('cache hit!', type, method, args, cacheObject)
            return cacheObject.value
          }
          console.debug('cache expired', type, method, args)
        }else if (getLocal) return null
      }
      const {result, timestamp} = isNil(setLocal)
        ? await enqueue({
          type,
          method,
          args: (diff && cacheObject) ? {...args, _cached: cacheObject.timestamp} : args,
          parallel,
          series
        })
        : {result: setLocal, timestamp: Infinity}
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

