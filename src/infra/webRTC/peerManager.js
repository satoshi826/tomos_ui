import {Peer} from '../../../lib/webRTC'
import {partition, oForEach} from '../../../lib/util'
import {infra4} from '..'
import {getCurrentArea} from '../../core'

export class PeerManager {
  constructor({myUserId} = {}) {
    this.peerMap = {}
    this.myUserId = myUserId
  }

  async getUsers() {
    const [xxx, yyy] = getCurrentArea()
    const users = await infra4({ttl: 5}).user.getByLocate({xxx, yyy}) // updateでフィルタする
    return users?.filter(u => u.update + 10 * 60 * 1000 > Date.now()
    && u.id !== this.myUserId
    )
  }

  async getOffers() {
    const notif = await infra4({ttl: 5, series: true}).notification.pull({sub: this.myUserId}) // updateでフィルタする
    return await notif?.filter(({type, time}) => type === 'offerSDP' && time + 5 * 60 * 1000 > Date.now())
  }

  async getAnswers() {
    const notif = await infra4({ttl: 5, series: true}).notification.pull({sub: this.myUserId})
    return notif.filter(({type, time}) => type === 'answerSDP' && time + 5 * 60 * 1000 > Date.now())
  }

  async sendOffer({id, sdp, key}) {
    return infra4({throttle: 0.5, parallel: true}).user.sendOffer({
      sub: id, sdp, pub: this.myUserId, key
    })
  }

  async sendAnswer({id, sdp, key}) {
    return infra4({throttle: 0.5, parallel: true}).user.sendAnswer({
      sub: id, sdp, pub: this.myUserId, key
    })
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
    if(!this.myUserId) return null
    this.getUsers().then(users => {
      const [answererUsers, offererUsers] = partition(users, u => this.getImOfferer(u.id))
      answererUsers.forEach(async u => {
        this.peerMap[u.id] ??= { //古くて未接続なら上書き？
          key   : u.update,
          status: 'offer_creating',
          peer  : new Peer()
        }
      })
    })

    this.getOffers().then((offers) => {
      offers.forEach((offer) => {
        this.peerMap[offer.pub] ??= {
          key     : offer.key,
          status  : 'offer_received',
          peer    : new Peer(),
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
