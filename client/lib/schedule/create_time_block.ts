import { add_style } from '../add_style'
import { DELAY, MONTH_NAMES } from '../constants'
import { ordinal_day } from '../date_utils'
import { elem } from '../element_utils'

add_style`
.hour {
 border-top: 1px solid #808080;
 box-sizing: border-box;
 flex-basis: 0; 
 flex-grow: 1;
 flex-shrink: 1;
 font-family: sans-serif;
 font-size: 12px;
 max-height: 50px;
 overflow: hidden;
 position: relative;
 transition: flex-basis 0.4s linear, max-height 0.4s linear;
}
.hour_inner {
 height: 50px;
 left: 0;
 overflow: hidden;
 position: absolute;
 right: 0;
 top: 0;
 transform-origin: top left;
 transform: scaleY(1);
 transition: transform 0.4s linear;
}
.hour_time_mark {
 align-items: start;
 color: #1b1b1b;
 display: grid;
 font-family: monospace;
 font-size: 10px;
 line-height: 16px;
 height: 50px;
 left: 0;
 padding: 4px;
 position: absolute;
 top: 0;
 white-space: pre;
}
`

export const HOUR_BLOCK_HEIGHT = 50

export interface TimeBlock extends HTMLDivElement {
 block_id: string
 inner: HTMLDivElement
 remove_block(): void
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
 block.remove_block = function () {
  block.style.flexBasis = '0'
  block.style.maxHeight = '0'
  setTimeout(function () {
   block.remove()
  }, DELAY.LONG)
 }
 block.scale_to = function (scale: number) {
  block.style.maxHeight = '50px'
  setTimeout(function () {
   block.style.flexBasis = `${scale * HOUR_BLOCK_HEIGHT}px`
   block.inner.style.transform = `scaleY(${scale})`
  }, DELAY.INSTANT)
 }
 const time_mark = elem('div', 'hour_time_mark')
 const mark_lines: string[] = []
 const mark_day: string[] = []
 if (hour === '0') {
  if (day === '1') {
   if (month === '1') {
    mark_day.push(year)
   }
  }
  mark_day.push(MONTH_NAMES[parseInt(month, 10) - 1])
  mark_day.push(ordinal_day(parseInt(day, 10)))
 }
 if (mark_day.length > 0) {
  mark_lines.push(mark_day.join(' '))
 }
 mark_lines.push(`${hour.padStart(2, ' ')}:00`)
 time_mark.textContent = mark_lines.join('\n')
 block.inner.appendChild(time_mark)
 return block
}
