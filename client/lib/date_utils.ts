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
