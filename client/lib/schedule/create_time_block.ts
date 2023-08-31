import { add_style } from '../add_style'
import { elem } from '../element_utils'

add_style`
.hour {
 border-top: 1px solid #808080;
 box-sizing: border-box;
 font-family: sans-serif;
 font-size: 12px;
 height: 50px;
 position: relative;
}
.hour_inner {
 overflow: hidden;
 position: absolute;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
}
`

export const HOUR_BLOCK_HEIGHT = 50

export interface TimeBlock extends HTMLDivElement {
 block_id: string
 inner: HTMLDivElement
 scale_to(scale: number): void
}

export function create_time_block(
 id: string,
 year: string,
 month: string,
 day: string,
 hour: string,
) {
 const block: TimeBlock = elem('div', 'hour')
 block.inner = elem('div', 'hour_inner')
 block.appendChild(block.inner)
 block.block_id = id
 block.style.order = [year, month, day, hour]
  .map((x) => x.padStart(2, '0'))
  .join('')
 block.scale_to = function (scale: number) {
  block.style.flexBasis = `${scale * HOUR_BLOCK_HEIGHT}px`
  block.style.flexGrow = scale === 1 ? '0' : '1'
  block.style.flexShrink = scale === 1 ? '0' : '1'
 }
 block.inner.textContent = `${id} : ${year} ${month} ${day} ${hour}:00`
 return block
}
