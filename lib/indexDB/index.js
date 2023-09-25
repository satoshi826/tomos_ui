export class IndexDB {
  constructor({dbName, storeName}) {
    this.dbName = dbName
    this.storeName = storeName
    this.db = null
  }
  async open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1)
      req.onerror = () => reject('Failed to open database')
      req.onsuccess = ({target : {result}}) => {
        this.db = result
        resolve()
      }
      req.onupgradeneeded = ({target : {result}}) => {
        const db = result
        db.createObjectStore(this.storeName)
      }
    })
  }
  async set(key, data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readwrite')
      const store = tx.objectStore(this.storeName)
      const req = store.put(data, key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject('Failed to add data')
    })
  }
  async get(key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([this.storeName], 'readonly')
      const store = tx.objectStore(this.storeName)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject('Failed to get data')
    })
  }
}