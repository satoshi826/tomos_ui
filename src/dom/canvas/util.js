import {state} from '../../../lib/state'

const [watchResize] = state({key: 'canvasSize'})

export const postionAdapter = {

  canvasWidht : null,
  canvasHeight: null,

  pxToNormal(x, y) {
    return [
      2 * (x / this.canvasWidht) - 1,
      - (2 * ((y / this.canvasHeight)) - 1)
    ]
  },

  worldToNormal() {

  },

  normalToPx() {

  },

  worldToPx([posX, posY], [cX, cY]) {
    console.log()


    return [
      2 * (x / this.canvasWidht) - 1,
      - (2 * ((y / this.canvasHeight)) - 1)
    ]

  }

}

watchResize(([width, height] = [1, 1]) => {
  postionAdapter.canvasWidht = width
  postionAdapter.canvasHeight = height
})