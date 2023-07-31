export const cache = {
  cacheMap: {},
  get({method, key}) {
    return this.cacheMap?.[method]?.[key]?.value
  },
  set({method, key, value, timestamp}) {
    this.cacheMap[method] ??= {}
    this.cacheMap[method][key] = {value, timestamp}
    return true
  }
}