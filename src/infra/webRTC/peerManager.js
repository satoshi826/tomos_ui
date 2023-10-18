import {Peer} from '../../../lib/webRTC'
import {partition} from '../../../lib/util'

export class PeerManager {
  constructor({myUserId}) {
    this.peerMap = {}
    this.myUserId = myUserId
  }

  async getUsers() {
    throw 'override me' // ここでupdateでフィルタ,自分も弾く
  }

  async getOffer() {
    throw 'override me'
  }

  async getAnswer() {
    throw 'override me'
  }

  async sendOffer() {
    throw 'override me'
  }

  async sendAnswer() {
    throw 'override me'
  }

  async dcSendForId() {
    throw 'override me'
  }

  async dcSendForAll() {
    throw 'override me'
  }

  getImOfferer(userId) {
    return userId && userId > this.myUserId
  }

  async signaling() {
    const users = this.getUsers()
    const [answererUsers, offererUsers] = partition(users, u => this.getImOfferer(u.id))

    answererUsers.forEach(async u => {
      const peer = new Peer()
      peer.createOfferSdp().then(() => this.sendOffer(peer)).then(peer => console.log('sendOffer', peer))
      this.peerMap[u.id] = {
        key: u.time,
        peer
      }
    })


  }

}
