import { App } from '../create_app'
import { add_style } from '../add_style'
import {
 TimeArray,
 generate_next_hours,
 generate_previous_hours,
 get_current_time,
 get_now_minutes,
 time_is_equal,
} from '../date_utils'
import { elem } from '../element_utils'
import {
 HOUR_BLOCK_HEIGHT,
 TimeBlock,
 create_time_block,
} from './create_time_block'

add_style`
.time_window {
 display: flex;
 flex-direction: column;
 flex-grow: 1;
 overflow: hidden;
 position: relative;
}
`

export interface TimeWindowControl {
 container: HTMLDivElement
 selected_time: TimeArray
 set_time(year: string, month: string, day: string, hour: string): void
}

export function create_time_window(app: App): TimeWindowControl {
 let auto_time_interval: NodeJS.Timeout
 let block_with_current_time: TimeBlock | undefined
 const control: TimeWindowControl = {
  container: elem('div', 'time_window'),
  selected_time: ['', '', '', ''],
  set_time(year, month, day, hour) {
   clearInterval(auto_time_interval)
   if (year === '') {
    use_current_time()
    auto_time_interval = setInterval(use_current_time, 60e3)
   } else {
    auto_time_interval = setInterval(render, 60e3)
    const current_time = get_current_time()
    control.selected_time = [year, month, day, hour].map(
     function (time, index) {
      const int = parseInt(time, 10)
      return isNaN(int) ? current_time[index] : int.toString(10)
     },
    ) as TimeArray
    render()
   }
  },
 }
 let wheel_speed = 0
 let wheel_accumulator = 0
 control.container.addEventListener('wheel', function (event) {
  if (wheel_speed === 0) {
   wheel_speed = Math.abs(event.deltaY)
  }
  wheel_accumulator += Math.floor(event.deltaY / wheel_speed)
  if (wheel_accumulator > 0) {
   const next = generate_next_hours(
    ...control.selected_time,
    wheel_accumulator,
   ).pop()!
   wheel_accumulator = 0
   app.navigate_schedule([''].concat(next).join('/'))
  } else if (wheel_accumulator < 0) {
   const previous = generate_previous_hours(
    ...control.selected_time,
    -wheel_accumulator,
   ).shift()!
   wheel_accumulator = 0
   app.navigate_schedule([''].concat(previous).join('/'))
  }
 })
 function use_current_time() {
  control.selected_time = get_current_time()
  render()
 }
 const cached_hour_blocks = new Map<string, TimeBlock>()
 const rendered_hour_block_ids = new Set<string>()
 function get_hour_block(
  year: string,
  month: string,
  day: string,
  hour: string,
 ) {
  const id = `${year}-${month}-${day}-${hour}`
  if (cached_hour_blocks.has(id)) {
   return cached_hour_blocks.get(id)!
  }
  const block = create_time_block(id, year, month, day, hour)
  cached_hour_blocks.set(id, block)
  return block
 }
 function render() {
  const time_window_height = control.container.getBoundingClientRect().height
  const [view_year, view_month, view_day, view_hour] = control.selected_time
  const num_full_size_blocks = Math.max(
   2,
   Math.floor((time_window_height * 0.5) / HOUR_BLOCK_HEIGHT),
  )
  const blocks_around_count = Math.max(4, num_full_size_blocks)
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
  const just_rendered_block_ids = new Set<string>()
  const now = get_current_time()
  const [blocks_pre, blocks_mid, blocks_post] = [
   hours_pre,
   hours_mid,
   hours_post,
  ].map(function (hours_group) {
   return hours_group.map(function (time_array, index) {
    const block = get_hour_block(...time_array)
    if (time_is_equal(now, time_array)) {
     if (block_with_current_time !== block) {
      if (block_with_current_time) {
       block_with_current_time.remove_current_time_mark()
      }
      block_with_current_time = block
     }
     block_with_current_time.set_current_time_mark(get_now_minutes() / 60)
    }
    rendered_hour_block_ids.add(block.block_id)
    just_rendered_block_ids.add(block.block_id)
    control.container.appendChild(block)
    return block
   })
  })
  rendered_hour_block_ids.forEach(function (id) {
   if (!just_rendered_block_ids.has(id)) {
    rendered_hour_block_ids.delete(id)
    const block = cached_hour_blocks.get(id)
    if (block) {
     block.remove_block()
    }
   }
  })
  blocks_pre.map(function (block, index) {
   block.scale_to(index / blocks_around_count)
  })
  blocks_mid.map(function (block) {
   block.scale_to(1)
  })
  blocks_post.map(function (block, index) {
   block.scale_to((blocks_around_count - index - 1) / blocks_around_count)
  })
 }
 addEventListener('resize', render)
 return control
}
