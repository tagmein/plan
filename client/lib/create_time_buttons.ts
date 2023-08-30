import { MONTH_NAMES } from './constants'
import {
 generate_day_options,
 generate_hour_options,
 generate_month_options,
 generate_year_options,
 ordinal_day,
} from './date_utils'
import { select } from './select'

type TimePropertyName = 'year' | 'month' | 'day' | 'hour'

export interface TimeButtonsControl {
 year: HTMLButtonElement
 month: HTMLButtonElement
 day: HTMLButtonElement
 hour: HTMLButtonElement
 selected_time: [string, string, string, string]
 set_time(year: string, month: string, day: string, hour: string): void
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
  year: string,
  month: string,
  day: string,
  hour: string,
 ) => void,
): TimeButtonsControl {
 let auto_time_interval: NodeJS.Timeout
 const select_time = (
  ['year', 'month', 'day', 'hour'] as TimePropertyName[]
 ).map(function (time_property: TimePropertyName) {
  return function () {
   const options = time_options[time_property]
   select(
    control[time_property],
    typeof options === 'function'
     ? options(
        parseInt(control.selected_time[0], 10),
        parseInt(control.selected_time[1], 10),
       )
     : options,
    set_time_property[time_property],
   )
  }
 }) as [() => void, () => void, () => void, () => void]
 const control: TimeButtonsControl = {
  selected_time: ['', '', '', ''],
  year: /* */ create_button('Year', /* */ select_time[0]),
  month: /**/ create_button('Month', /**/ select_time[1]),
  day: /*  */ create_button('Day', /*  */ select_time[2]),
  hour: /* */ create_button('Hour', /* */ select_time[3]),
  set_time(year, month, day, hour) {
   clearInterval(auto_time_interval)
   if (year === '') {
    use_current_time()
    auto_time_interval = setInterval(use_current_time, 60e3)
   } else {
    const current_time = get_current_time()
    control.selected_time = [year, month, day, hour].map(
     function (time, index) {
      const int = parseInt(time, 10)
      return isNaN(int) ? current_time[index] : int.toString(10)
     },
    ) as [string, string, string, string]
    set_time_button_labels(...control.selected_time)
   }
  },
 }
 function get_current_time() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hour = now.getHours()
  return [year, month, day, hour].map((x) => x.toString(10)) as [
   string,
   string,
   string,
   string,
  ]
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
  set_time_button_labels(...control.selected_time)
 }
 const set_time_property = {
  year(year: string) {
   const [_, month, day, hour] = control.selected_time
   const new_valid_days = generate_day_options(
    parseInt(year, 10),
    parseInt(month, 10),
   )
   const final_day = new_valid_days.some(([value]) => value === day)
    ? day
    : new_valid_days[new_valid_days.length - 1][0]
   on_change_time(year, month, final_day, hour)
  },
  month(month: string) {
   const [year, _, day, hour] = control.selected_time
   const new_valid_days = generate_day_options(
    parseInt(year, 10),
    parseInt(month, 10),
   )
   const final_day = new_valid_days.some(([value]) => value === day)
    ? day
    : new_valid_days[new_valid_days.length - 1][0]
   on_change_time(year, month, final_day, hour)
  },
  day(day: string) {
   const [year, month, _, hour] = control.selected_time
   on_change_time(year, month, day, hour)
  },
  hour(hour: string) {
   const [year, month, day, _] = control.selected_time
   on_change_time(year, month, day, hour)
  },
 }

 return control
}
