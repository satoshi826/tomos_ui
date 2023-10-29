import {Peer} from '../../../lib/webRTC'
import {partition, oForEach, oForEachV, oMap, isExpiration} from '../../../lib/util'
import {infra4} from '..'
import {getAddUsers} from '../../core/user'

export class PeerManager {
  constructor({myUserId} = {}) {
    this.peerMap = {}
    this.myUserId = myUserId
  }

  getUsers() {
    const users = oMap(getAddUsers(), ([id, v]) => ({id, ...v}))
    return users?.filter(u => isExpiration(u.update, 300)
    && u.id !== this.myUserId
    )
  }

  async getOffers() {
    const notif = await infra4({ttl: 5, series: true, diff: true}).notification.pull({sub: this.myUserId}) // updateでフィルタする
    return notif.filter(({type, time}) => type === 'offerSDP' && isExpiration(time, 300))
  }

  async getAnswers() {
    const notif = await infra4({ttl: 5, series: true, diff: true}).notification.pull({sub: this.myUserId})
    return notif.filter(({type, time}) => type === 'answerSDP' && isExpiration(time, 300))
  }

  async sendOffer({id, sdp, key}) {
    return infra4({throttle: 1, parallel: true}).user.sendOffer({ // peerの状態で分岐入れたい
      sub: id, sdp, pub: this.myUserId, key
    })
  }

  async sendAnswer({id, sdp, key}) {
    return infra4({throttle: 1, parallel: true}).user.sendAnswer({
      sub: id, sdp, pub: this.myUserId, key
    })
  }

  async dcSendForId() {
    throw 'override me'
  }

  async dcSendForAll(value) {
    oForEachV(this.peerMap, ({peer, status}) => {
      if (status === 'connected') {
        peer.dc.send({from: this.myUserId, value})
      }
    })
  }

  getImOfferer(userId) {
    return userId && userId > this.myUserId
  }

  createPeer(id) {
    const peer = new Peer()
    peer.onDataChannelOpen = () => this.peerMap[id].status = 'connected'
    peer.onDataChannelClose = () => delete this.peerMap[id]
    peer.onDataChannelError = () => delete this.peerMap[id]
    return peer
  }

  async signaling() {
    if(!this.myUserId) return null
    const users = this.getUsers()

    const [answererUsers] = partition(users, u => this.getImOfferer(u.id))
    answererUsers.forEach(async u => {
      const offererPeer = this.createPeer(u.id)
      this.peerMap[u.id] ??= { //古くて未接続なら上書き？
        key   : u.update,
        status: 'offer_creating',
        peer  : offererPeer
      }
    })

    this.getOffers().then((offers) => {
      offers.forEach((offer) => {
        const answererPeer = this.createPeer(offer.pub)
        this.peerMap[offer.pub] ??= {
          key     : offer.key,
          status  : 'offer_received',
          peer    : answererPeer,
          offerSDP: offer.sdp
        }
      })
    })

    this.getAnswers().then((answers) => {
      answers.forEach((answer) => {
        const offererPeer = this.peerMap?.[answer.pub]
        if(offererPeer && offererPeer.status === 'offer_sent' && offererPeer.key === answer.key) {
          offererPeer.status = 'answer_received'
          offererPeer.peer.setAnswerSdp(answer.sdp).then(() => offererPeer.status = 'connencted')
        }
      })
    })

    oForEach(this.peerMap, ([id, v]) => {
      if (v.status === 'offer_creating') {
        v.status = 'offer_sending'
        v.peer.createOfferSdp()
          .then(() => this.sendOffer({id, key: v.key, sdp: v.peer.localSDP}))
          .then(() => v.status = 'offer_sent')
          .catch((error) => {
            console.error(error)
            v.status = 'offer_send_failed'
          })
      }
      if (v.status === 'offer_received') {
        v.status = 'answer_sending'
        v.peer.setOfferSdp(v.offerSDP)
          .then(() => this.sendAnswer({id, key: v.key, sdp: v.peer.localSDP}))
          .then(() => v.status = 'answer_sent')
          .catch((error) => {
            console.error(error)
            v.status = 'answer_send_failed'
          })
      }
    })


  }

}
