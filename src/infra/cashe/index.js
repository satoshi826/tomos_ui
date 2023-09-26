import {IndexDB} from '../../../lib/indexDB'

const indexDB = new IndexDB({
  dbName   : 'tomosDB',
  storeName: 'cache'
})
await indexDB.open()

export const cache = {
  cacheMap: {},
  async get({type, method, args, ttl}) {
    let cache = this.cacheMap?.[type]?.[method]?.[JSON.stringify(args)]
    console.log(`${type}.${method}.${JSON.stringify(args)}`)
    cache ??= await indexDB.get(`${type}.${method}.${JSON.stringify(args)}`)
    if (cache && ((cache.timestamp + ttl * 1000 > Date.now()))) {
      console.debug('cache hit!', type, method, args, cache.value)
      return cache.value
    }
    return null
  },
  async set({type, method, args, value, timestamp}) {
    this.cacheMap[type] ??= {}
    this.cacheMap[type][method] ??= {}
    this.cacheMap[type][method][JSON.stringify(args)] = {value, timestamp}
    console.log(this.cacheMap)
    await indexDB.set(`${type}.${method}.${JSON.stringify(args)}`, {value, timestamp})
    return true
  }
}