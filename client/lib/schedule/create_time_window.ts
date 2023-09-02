import { add_style } from '../add_style'
import { DELAY, MONTH_NAMES } from '../constants'
import { App } from '../create_app'
import {
 TimeArray,
 generate_next_hours,
 generate_previous_hours,
 get_current_time,
 get_hour_delta,
 get_next_hour,
 get_now_minutes,
 ordinal_day,
} from '../date_utils'
import { elem } from '../element_utils'

add_style`
.time_window {
 display: flex;
 flex-direction: column;
 flex-grow: 1;
 margin-bottom: 1px;
 overflow: hidden;
 position: relative;
}

.time_window canvas {
 height: 100%;
 left: 0;
 pointer-events: none;
 position: absolute;
 top: 0;
 width: 100%;
}

.time_window:focus::after {
 bottom: 0;
 box-shadow: inset 0 0 0 2px #eeeeee;
 content: '';
 display: block;
 left: 0;
 outline: none;
 pointer-events: none;
 position: absolute;
 right: 0;
 top: 0;
 z-index: 1;
}
.current_time_mark {
 background-color: #a4000080;
 box-shadow: 0 0 2px #a4000080;
 height: 1px;
 left: 0;
 mix-blend-mode: darken;
 overflow: visible;
 pointer-events: none;
 position: absolute;
 right: 0;
 z-index: 2;
}
.current_time_mark::after {
 background-color: #a40000;
 box-shadow: 0 0 2px #a4000080;
 content: '';
 display: block;
 height: 7px;
 position: absolute;
 right: -4px;
 top: -3px;
 transform-origin: center;
 transform: rotate(45deg);
 width: 7px;
}
`

export interface TimeWindowControl {
 canvas: HTMLCanvasElement
 container: HTMLDivElement
 current_time_mark: HTMLDivElement
 layer: CanvasRenderingContext2D
 selected_time: TimeArray
 set_time(
  year: number,
  month: number,
  day: number,
  hour: number,
  internal?: boolean,
 ): void
}

const HOUR_BLOCK_HEIGHT = 48

export function create_time_window(app: App): TimeWindowControl {
 let auto_time_interval: NodeJS.Timeout
 const container = elem('div', 'time_window')
 const canvas = elem<HTMLCanvasElement>('canvas')
 container.setAttribute('tabIndex', '0')
 const control: TimeWindowControl = {
  canvas,
  container,
  current_time_mark: elem('div', 'current_time_mark'),
  layer: canvas.getContext('2d')!,
  selected_time: [NaN, NaN, NaN, NaN],
  set_time(year, month, day, hour, internal) {
   if (!internal) {
    page_movement_accumulator = 0
    page_movement_step = 0
    wheel_accumulator = 0
    clearInterval(page_movement_interval)
   }
   clearInterval(auto_time_interval)
   if (isNaN(year)) {
    use_current_time()
    auto_time_interval = setInterval(use_current_time, DELAY.MINUTE)
   } else {
    auto_time_interval = setInterval(render, DELAY.MINUTE)
    const current_time = get_current_time()
    control.selected_time = [year, month, day, hour].map(
     function (time, index) {
      return isNaN(time) ? current_time[index] : time
     },
    ) as TimeArray
    render()
   }
  },
 }
 control.container.appendChild(control.canvas)
 control.container.appendChild(control.current_time_mark)
 const WHEEL_HOUR_DISTANCE = 528
 let wheel_accumulator = 0
 function wheel_commit(steps: number, hour: TimeArray) {
  wheel_accumulator -= steps * WHEEL_HOUR_DISTANCE
  app.navigate_schedule(hour.map((x) => x.toString(10)).join('/'), true)
 }
 function process_wheel() {
  const wheel_steps = (wheel_accumulator > 0 ? Math.floor : Math.ceil)(
   wheel_accumulator / WHEEL_HOUR_DISTANCE,
  )
  if (wheel_steps >= 1) {
   const next = generate_next_hours(
    ...control.selected_time,
    wheel_steps,
   ).pop()!
   wheel_commit(wheel_steps, next)
   return
  } else if (wheel_steps <= -1) {
   const previous = generate_previous_hours(
    ...control.selected_time,
    -wheel_steps,
   ).shift()!
   wheel_commit(wheel_steps, previous)
   return
  }
  // we moved, but not far enough to change route
  render()
 }
 control.container.addEventListener('wheel', function (event) {
  wheel_accumulator += event.deltaY
  process_wheel()
 })
 let page_movement_interval: NodeJS.Timeout
 let page_movement_accumulator = 0
 let page_movement_step = 0
 function auto_page_movement(days: number) {
  page_movement_accumulator += days
  clearInterval(page_movement_interval)
  if (page_movement_accumulator !== 0) {
   page_movement_interval = setInterval(function () {
    if (page_movement_accumulator > 0) {
     page_movement_step++
     if (page_movement_step === 24 * 4 + 1) {
      auto_page_movement(-1)
      page_movement_step = 0
     } else {
      wheel_accumulator += WHEEL_HOUR_DISTANCE / 4
      process_wheel()
     }
    } else {
     page_movement_step--
     if (page_movement_step === -24 * 4 - 1) {
      auto_page_movement(1)
      page_movement_step = 0
     } else {
      wheel_accumulator -= WHEEL_HOUR_DISTANCE / 4
      process_wheel()
     }
    }
   }, DELAY.INSTANT)
  }
 }
 control.container.addEventListener('keydown', function (event) {
  switch (event.key) {
   case 'ArrowUp':
    wheel_accumulator -= 132
    process_wheel()
    break
   case 'ArrowDown':
    wheel_accumulator += 132
    process_wheel()
    break
   case 'PageUp':
    auto_page_movement(-1)
    break
   case 'PageDown':
    auto_page_movement(1)
    break
  }
 })
 function use_current_time() {
  control.selected_time = get_current_time()
  render()
 }
 function render() {
  const time_window_size = control.container.getBoundingClientRect()
  control.canvas.height = time_window_size.height
  control.canvas.width = time_window_size.width
  const [view_year, view_month, view_day, view_hour] = control.selected_time
  const num_full_size_blocks = Math.max(
   2,
   Math.floor((time_window_size.height * 0.5) / HOUR_BLOCK_HEIGHT),
  )
  const blocks_around_count = Math.max(12, num_full_size_blocks * 2)
  const hours_pre = generate_previous_hours(
   view_year,
   view_month,
   view_day,
   view_hour,
   blocks_around_count,
  )
  const hours_mid = ([control.selected_time] as TimeArray[]).concat(
   generate_next_hours(
    view_year,
    view_month,
    view_day,
    view_hour,
    num_full_size_blocks - 1,
   ),
  )
  const hours_post = generate_next_hours(
   ...hours_mid[hours_mid.length - 1],
   blocks_around_count,
  )
  function hour_to_vertical_px(hour: TimeArray, fraction: number = 0) {
   const base_vertical_px = time_window_size.height * 0.25
   const full_size_chunk_px = num_full_size_blocks * HOUR_BLOCK_HEIGHT
   const hours_from_base = get_hour_delta(control.selected_time, hour)
   const wheel_hour_fraction = wheel_accumulator / WHEEL_HOUR_DISTANCE
   const position_hour = hours_from_base - wheel_hour_fraction + fraction
   /* before all full size blocks */
   if (position_hour < 0) {
    return Math.exp(position_hour / 3) * base_vertical_px
   } /* 
   after all full size blocks 
   */ else if (position_hour > num_full_size_blocks) {
    const after_hour = position_hour - num_full_size_blocks
    const after_vertical_px = base_vertical_px + full_size_chunk_px
    const after_size_chunk_px = time_window_size.height - after_vertical_px
    return (
     after_vertical_px + (1 - Math.exp(-after_hour / 3)) * after_size_chunk_px
    )
   } /* 
   within full size blocks 
   */ else {
    return Math.round(base_vertical_px + position_hour * HOUR_BLOCK_HEIGHT)
   }
  }
  control.layer.clearRect(0, 0, time_window_size.width, time_window_size.height)
  control.layer.font = '10px monospace'
  for (const hours of [hours_pre, hours_mid, hours_post]) {
   for (const hour of hours) {
    const y = hour_to_vertical_px(hour)
    control.layer.lineWidth = 1
    control.layer.strokeStyle = '#a8a8a8'
    control.layer.beginPath()
    control.layer.moveTo(0, y)
    control.layer.lineTo(time_window_size.width, y)
    control.layer.stroke()
    control.layer.fillStyle = '#1b1b1b'
    control.layer.save()
    control.layer.beginPath()
    control.layer.rect(
     0,
     y,
     time_window_size.width,
     hour_to_vertical_px(get_next_hour(hour)) - y,
    )
    control.layer.clip()
    let day_label: string | undefined
    if (hour[3] === 0) {
     day_label = `${MONTH_NAMES[hour[1] - 1]} ${ordinal_day(hour[2])}`
     if (hour[2] === 1) {
      if (hour[1] === 1) {
       day_label += ' ' + hour[0].toString(10).padStart(4, ' ')
      }
     }
    }
    control.layer.fillText(
     ` ${hour[3].toString(10).padStart(2, ' ')}:00`,
     8,
     y + 17,
    )
    if (day_label) {
     control.layer.fillText(day_label, 8, y + 30)
    }
    control.layer.restore()
    control.layer.fillStyle = '#1b1b1b30'
    control.layer.fillText(
     ` ${hour[3].toString(10).padStart(2, ' ')}:00`,
     8,
     y + 17,
    )
    if (day_label) {
     control.layer.fillText(day_label, 8, y + 30)
    }
   }
  }
  const now = get_current_time()
  const minutes = get_now_minutes()
  control.current_time_mark.style.top = `${Math.min(
   hour_to_vertical_px(now, minutes / 60),
   time_window_size.height - 1,
  )}px`
 }
 addEventListener('resize', render)
 return control
}
