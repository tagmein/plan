import {
 DAYS_IN_MONTH_LEAP_YEAR,
 DAYS_IN_MONTH_NORMAL_YEAR,
 MONTH_NAMES,
} from './constants'

export function ordinal_day(day: number): string {
 if (day < 4 || day > 20) {
  switch (day % 10) {
   case 1:
    return day + 'st'
   case 2:
    return day + 'nd'
   case 3:
    return day + 'rd'
  }
 }
 return day + 'th'
}

export function is_leap_year(year: number) {
 return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function generate_day_options(year: number, month: number) {
 const day_count = is_leap_year(year)
  ? DAYS_IN_MONTH_LEAP_YEAR[month - 1]
  : DAYS_IN_MONTH_NORMAL_YEAR[month - 1]
 return Array(day_count)
  .fill(null)
  .map(
   (_, i) =>
    [(i + 1).toString(10), ordinal_day(i + 1).padStart(4, ' ')] as [
     string,
     string,
    ],
  )
}

export function generate_hour_options(): [string, string][] {
 return Array(24)
  .fill(null)
  .map((_, i) => i.toString(10))
  .map((x) => [x, x.padStart(2, ' ') + ':00'])
}

export function generate_month_options(): [string, string][] {
 return MONTH_NAMES.map(
  (name, i) => [(i + 1).toString(10), name] as [string, string],
 )
}

export function generate_year_options(): [string, string][] {
 const current_year = new Date().getFullYear()
 const current_century = Math.floor(current_year / 100) * 100
 const years: [string, string][] = []
 for (let i = current_century - 100; i <= current_century + 199; i++) {
  const year = i.toString().padStart(4, '0')
  years.push([year, year])
 }
 return years
}

export type TimePropertyName = 'year' | 'month' | 'day' | 'hour'

export const TIME_PROPERTY_ARRAY: [
 TimePropertyName,
 TimePropertyName,
 TimePropertyName,
 TimePropertyName,
] = ['year', 'month', 'day', 'hour']

export type TimeArray = [string, string, string, string]

export function get_current_time() {
 const now = new Date()
 const year = now.getFullYear()
 const month = now.getMonth() + 1
 const day = now.getDate()
 const hour = now.getHours()
 return [year, month, day, hour].map((x) => x.toString(10)) as TimeArray
}

export function generate_previous_hours(
 year: string,
 month: string,
 day: string,
 hour: string,
 count: number,
): TimeArray[] {
 let [Y, M, D, H] = [year, month, day, hour].map((x) => parseInt(x, 10))
 const times: TimeArray[] = []
 for (let i = 0; i < count; i++) {
  H--
  if (H < 0) {
   D--
   if (D < 1) {
    M--
    if (M < 1) {
     Y--
     M = 12
    }
    D = is_leap_year(Y)
     ? DAYS_IN_MONTH_LEAP_YEAR[M - 1]
     : DAYS_IN_MONTH_NORMAL_YEAR[M - 1]
   }
   H = 23
  }
  times.unshift([Y, M, D, H].map((x) => x.toString(10)) as TimeArray)
 }
 return times
}

export function generate_next_hours(
 year: string,
 month: string,
 day: string,
 hour: string,
 count: number,
): TimeArray[] {
 let [Y, M, D, H] = [year, month, day, hour].map((x) => parseInt(x, 10))
 const times: TimeArray[] = []
 let max_days_in_month = is_leap_year(Y)
  ? DAYS_IN_MONTH_LEAP_YEAR[M - 1]
  : DAYS_IN_MONTH_NORMAL_YEAR[M - 1]
 for (let i = 0; i < count; i++) {
  H++
  if (H > 23) {
   D++
   if (D > max_days_in_month) {
    M++
    if (M > 12) {
     Y++
     M = 1
    }
    D = 1
    max_days_in_month = is_leap_year(Y)
     ? DAYS_IN_MONTH_LEAP_YEAR[M - 1]
     : DAYS_IN_MONTH_NORMAL_YEAR[M - 1]
   }
   H = 0
  }
  times.push([Y, M, D, H].map((x) => x.toString(10)) as TimeArray)
 }
 return times
}

export function time_is_equal(a: TimeArray, b: TimeArray) {
 return !a.some((x, i) => x !== b[i])
}

export function get_now_minutes() {
 return new Date().getMinutes()
}
