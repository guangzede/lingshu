declare module 'lunar-javascript' {
  export class EightChar {
    setSect(sect: number): void
    getYearGan(): string
    getYearZhi(): string
    getMonthGan(): string
    getMonthZhi(): string
    getDayGan(): string
    getDayZhi(): string
    getTimeGan(): string
    getTimeZhi(): string
    getDayGanIndex(): number
    [key: string]: any
  }

  export class Lunar {
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number)
    static fromDate(date: Date): Lunar
    static fromYmd(year: number, month: number, day: number): Lunar
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar

    getYear(): number
    getMonth(): number
    getDay(): number
    getHour(): number
    getMinute(): number
    getSecond(): number

    getDayInChinese(): string
    getMonthInChinese(): string
    getYearInChinese(): string

    getYearInGanZhi(): string
    getMonthInGanZhi(): string
    getDayInGanZhi(): string
    getTimeInGanZhi(): string

    getDayGan(): string
    getDayZhi(): string
    getMonthZhi(): string
    getMonthGan(): string

    getJieQi(): string

    getEightChar(): EightChar
    getPrevJie(): Lunar
    getNextJie(): Lunar
    getYearGanIndexExact(): number

    getSolar(): Solar
    [key: string]: any
  }

  export class Solar {
    constructor(year: number, month: number, day: number)
    static fromDate(date: Date): Solar
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar
    getYear(): number
    getMonth(): number
    getDay(): number
    getHour(): number
    getMinute(): number
    getLunar(): Lunar
    subtractMinute(other: Solar): number
    nextYear(years: number): Solar
    nextMonth(months: number): Solar
    next(days: number): Solar
    nextHour(hours: number): Solar
    [key: string]: any
  }

  export class LunarYear {
    static fromYear(year: number): LunarYear
    getLeapMonth(): number
  }

  export class LunarMonth {
    static fromYm(year: number, month: number): LunarMonth
    getDayCount(): number
    [key: string]: any
  }
}
