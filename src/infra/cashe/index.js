import {IndexDB} from '../../../lib/indexDB'

const indexDB = new IndexDB({
  dbName   : 'tomosDB',
  storeName: 'cache'
})
await indexDB.open()

export const cache = {
  cacheMap: {},
  setInmemory(type, method, args, cache) {
    this.cacheMap[type] ??= {}
    this.cacheMap[type][method] ??= {}
    this.cacheMap[type][method][JSON.stringify(args)] = cache
  },
  async get({type, method, args}) {
    let cache = this.cacheMap?.[type]?.[method]?.[JSON.stringify(args)]
    if (!cache) {
      cache = await indexDB.get(`${type}.${method}.${JSON.stringify(args)}`)
      if (cache) this.setInmemory(type, method, args, cache)
    }
    if (cache) return cache
    return null
  },
  async set({type, method, args, value, timestamp}) {
    this.setInmemory(type, method, args, {value, timestamp})
    await indexDB.set(`${type}.${method}.${JSON.stringify(args)}`, {value, timestamp})
    return true
  }
}