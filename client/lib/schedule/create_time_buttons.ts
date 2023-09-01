/// <reference path="../../types/global.d.ts" />

import { DELAY, MONTH_NAMES } from '../constants'
import {
 TIME_PROPERTY_ARRAY,
 TimeArray,
 TimePropertyName,
 generate_day_options,
 generate_hour_options,
 generate_month_options,
 generate_year_options,
 get_current_time,
 ordinal_day,
} from '../date_utils'
import { select } from '../select'

export interface TimeButtonsControl {
 year: HTMLButtonElement
 month: HTMLButtonElement
 day: HTMLButtonElement
 hour: HTMLButtonElement
 selected_time: TimeArray
 set_time(year: number, month: number, day: number, hour: number): void
}

const time_options: {
 [key in TimePropertyName]:
  | [string, string][]
  | ((year: number, month: number) => [string, string][])
} = {
 year: generate_year_options(),
 month: generate_month_options(),
 day: generate_day_options,
 hour: generate_hour_options,
}

export function create_time_buttons(
 create_button: (label: string, on_click: () => void) => HTMLButtonElement,
 on_change_time: (
  year: number,
  month: number,
  day: number,
  hour: number,
 ) => void,
): TimeButtonsControl {
 let auto_time_interval: NodeJS.Timeout
 const select_time = TIME_PROPERTY_ARRAY.map(function (time_property, index) {
  return function () {
   const options = time_options[time_property]
   select({
    element: control[time_property],
    options:
     typeof options === 'function'
      ? options(control.selected_time[0], control.selected_time[1])
      : options,
    on_select: set_time_property[time_property].and(function () {
     setTimeout(function () {
      select_time[index + 1]?.()
     }, DELAY.SHORT)
    }),
    go_next: select_time[(index + 1) % 4],
    go_prev: select_time[(index + 3) % 4],
    selected_value:
     control.selected_time[TIME_PROPERTY_ARRAY.indexOf(time_property)].toString(
      10,
     ),
   })
  }
 }) as [() => void, () => void, () => void, () => void]
 const control: TimeButtonsControl = {
  selected_time: [NaN, NaN, NaN, NaN],
  year: /* */ create_button('Year', /* */ select_time[0]),
  month: /**/ create_button('Month', /**/ select_time[1]),
  day: /*  */ create_button('Day', /*  */ select_time[2]),
  hour: /* */ create_button('Hour', /* */ select_time[3]),
  set_time(year, month, day, hour) {
   clearInterval(auto_time_interval)
   if (isNaN(year)) {
    use_current_time()
    auto_time_interval = setInterval(use_current_time, DELAY.MINUTE)
   } else {
    const current_time = get_current_time()
    control.selected_time = [year, month, day, hour].map(
     function (time, index) {
      return isNaN(time) ? current_time[index] : time
     },
    ) as TimeArray
    set_time_button_labels(
     ...(control.selected_time.map((x) => x.toString(10)) as [
      string,
      string,
      string,
      string,
     ]),
    )
   }
  },
 }
 function set_time_button_labels(
  year: string,
  month: string,
  day: string,
  hour: string,
 ) {
  control.year.textContent = year
  control.month.textContent = MONTH_NAMES[parseInt(month, 10) - 1]
  control.day.textContent = ordinal_day(parseInt(day, 10)).padStart(4, ' ')
  control.hour.textContent = hour.padStart(2, ' ') + ':00'
 }
 function use_current_time() {
  control.selected_time = get_current_time()
  set_time_button_labels(
   ...(control.selected_time.map((x) => x.toString(10)) as [
    string,
    string,
    string,
    string,
   ]),
  )
 }
 const set_time_property = {
  year(year: string) {
   const year_int = parseInt(year, 10)
   const [_, month, day, hour] = control.selected_time
   const new_valid_days = generate_day_options(year_int, month)
   const day_string = day.toString(10)
   const final_day = new_valid_days.some(([value]) => value === day_string)
    ? day
    : parseInt(new_valid_days[new_valid_days.length - 1][0], 10)
   on_change_time(year_int, month, final_day, hour)
  },
  month(month: string) {
   const month_int = parseInt(month, 10)
   const [year, _, day, hour] = control.selected_time
   const new_valid_days = generate_day_options(year, month_int)
   const day_string = day.toString(10)
   const final_day = new_valid_days.some(([value]) => value === day_string)
    ? day
    : parseInt(new_valid_days[new_valid_days.length - 1][0], 10)
   on_change_time(year, month_int, final_day, hour)
  },
  day(day: string) {
   const [year, month, _, hour] = control.selected_time
   on_change_time(year, month, parseInt(day, 10), hour)
  },
  hour(hour: string) {
   const [year, month, day, _] = control.selected_time
   on_change_time(year, month, day, parseInt(hour, 10))
  },
 }

 return control
}
