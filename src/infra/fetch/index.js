import {fetcher} from '../../../lib/fetch'
import {API_ENDPOINT} from '../../../constants'
fetcher.init(API_ENDPOINT)
export const fetch = {
  async get({method, key}) {
    const result = await fetcher.post({
      path: '/ql',
      body: {
        query: {
          [method]: key
        }
      }
    })
    return result.query[method]
  },
  set({method, key, value}) {
    return fetcher.post({
      path: '/ql',
      body: {
        mutation: {
          [method]: {[key]: value}
        }
      }
    })
  }
}