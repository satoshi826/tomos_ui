export const fetcher = {
  endpoint: null,
  init(endpoint) {
    this.endpoint = endpoint
  },
  async get({path = ''}) {
    try {
      const response = await fetch(this.endpoint + path)
      if (response.status !== 200) throw new Error(response)
      return response.json()
    } catch (error) {
      throw new Error(error)
    }
  },
  async post({body = {}, path = ''}) {
    try {
      const response = await fetch(this.endpoint + path, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      if (response.status !== 200) throw new Error(response)
      return response.json()
    } catch (error) {
      throw new Error(error)
    }
  }
}