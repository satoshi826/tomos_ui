import {state} from '../../../lib/state'

const [watchResize] = state({key: 'canvasSize'})

export const postionAdapter = {

  canvasWidht    : null,
  canvasHeight   : null,
  canvasAspect   : null,
  canvasShortSide: null,

  pxToNormal(x, y) {
    return [
      2 * (x / this.canvasWidht) - 1,
      - (2 * ((y / this.canvasHeight)) - 1)
    ]
  },

  worldToPx([posX, posY], [cX, cY, cZ]) {
    let x = 2 * ((posX - cX) / (this.canvasAspect[0] * cZ))
    let y = -2 * (posY - cY) / (this.canvasAspect[1] * cZ)
    x = (x + 1) / 2
    y = (y + 1) / 2
    x *= this.canvasWidht
    y *= this.canvasHeight
    return [x, y]
  },

  calcVisiblePoints(camera, margin = 1) {
    const minX = camera[0] - margin * camera[2] * postionAdapter.canvasAspect[0] / 2
    const maxX = camera[0] + margin * camera[2] * postionAdapter.canvasAspect[0] / 2
    const minY = camera[1] - margin * camera[2] * postionAdapter.canvasAspect[1] / 2
    const maxY = camera[1] + margin * camera[2] * postionAdapter.canvasAspect[1] / 2
    let visiblePoints = []
    for (let x = Math.trunc(minX); x < maxX; x++) {
      for (let y = Math.trunc(minY); y < maxY; y++) {
        visiblePoints.push(`${x}_${y}`)
      }
    }
    return visiblePoints
  },

  worldToPxScale(size, z = 10) {
    return (this.canvasWidht / this.canvasAspect[0] * 2 * size) / z
  }

}

watchResize(([width, height] = [1, 1]) => {
  postionAdapter.canvasWidht = width
  postionAdapter.canvasHeight = height
  postionAdapter.canvasAspect = (width > height) ? [width / height, 1] : [1, height / width]
  postionAdapter.canvasShortSide = Math.min(width, height)
})