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

export type TimeArray = [number, number, number, number]

export function get_current_time(): TimeArray {
 const now = new Date()
 const year = now.getFullYear()
 const month = now.getMonth() + 1
 const day = now.getDate()
 const hour = now.getHours()
 return [year, month, day, hour]
}

export function generate_previous_hours(
 Y: number,
 M: number,
 D: number,
 H: number,
 count: number,
): TimeArray[] {
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
  times.unshift([Y, M, D, H])
 }
 return times
}

export function generate_next_hours(
 Y: number,
 M: number,
 D: number,
 H: number,
 count: number,
): TimeArray[] {
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
  times.push([Y, M, D, H])
 }
 return times
}

export function get_next_hour(hour: TimeArray) {
 return generate_next_hours(...hour, 1).pop()!
}

export function get_previous_hour(hour: TimeArray) {
 return generate_previous_hours(...hour, 1).shift()!
}

export function time_is_equal(a: TimeArray, b: TimeArray) {
 return !a.some((x, i) => x !== b[i])
}

export function get_now_minutes() {
 return new Date().getMinutes()
}

export function get_hour_delta(base: TimeArray, compare: TimeArray) {
 let delta = 0
 const [bY, bM, bD, bH] = base
 let [cY, cM, cD, cH] = compare
 if (cH !== bH) {
  delta += cH - bH
 }
 if (cD !== bD) {
  delta += (cD - bD) * 24
 }
 while (cY > bY || cM > bM) {
  cM--
  if (cM === 0) {
   cM = 12
   cY--
  }
  delta +=
   (is_leap_year(cY)
    ? DAYS_IN_MONTH_LEAP_YEAR[cM - 1]
    : DAYS_IN_MONTH_NORMAL_YEAR[cM - 1]) * 24
 }
 while (cY < bY || cM < bM) {
  delta -=
   (is_leap_year(cY)
    ? DAYS_IN_MONTH_LEAP_YEAR[cM - 1]
    : DAYS_IN_MONTH_NORMAL_YEAR[cM - 1]) * 24
  cM++
  if (cM === 13) {
   cM = 1
   cY++
  }
 }
 return delta
}
