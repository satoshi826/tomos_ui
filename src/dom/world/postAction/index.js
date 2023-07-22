import {state} from '../../../../lib/state'
import {style, icon} from '../../../../lib/theme'
import {snippets as _} from '../../../theme/snippets'
import {domContainerEl, getTranslate} from '../domContainer'
import {postionAdapter} from '../../canvas/util'

const [watchCamera] = state({key: 'cameraPosition'})

export function postAction() {

  queueMicrotask(() => {
    const postHTML = /* html */`
      <div class="postAction" style="transform:${getTranslate(1, -1)}">
        ${icon('maps_ugc', {size: '64px'})}
      </div>`
    domContainerEl.insertAdjacentHTML('beforeend', postHTML)

    watchCamera((camera) => {

      if (camera[2] < 10) {
        const minX = camera[0] - camera[2] * postionAdapter.canvasAspect[0] / 2
        const maxX = camera[0] + camera[2] * postionAdapter.canvasAspect[0] / 2
        const minY = camera[1] - camera[2] * postionAdapter.canvasAspect[1] / 2
        const maxY = camera[1] + camera[2] * postionAdapter.canvasAspect[1] / 2
        let visiblePoints = []
        for (let x = Math.trunc(minX); x < maxX; x++) {
          for (let y = Math.trunc(minY); y < maxY; y++) {
            visiblePoints.push([x, y])
          }
        }
        console.log(visiblePoints)
      }
    })


  })

  style.set('.postAction', postActionC)
  style.hover('.postAction', postActionHoverC)

}

//-------------------------------------------

const postActionC = {
  ..._.abs,
  ..._.wh('100px'),
  ..._.txC({type: 'text', i: 2}),
  ..._.flex({align: 'center', justify: 'center'}),
  ..._.bRd('50%'),
  ..._.dur('0.6s'),
  ..._.bgC({type: 'gray', i: 0, alpha: 0.2}),
  ..._.breakWord,
  contain             : 'strict',
  contentVisibility   : 'auto',
  containIntrinsicSize: '0px',
}

const postActionHoverC = {
  ..._.txC({type: 'primary', i: 0}),
  ..._.txGrow(10),
}
