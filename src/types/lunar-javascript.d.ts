declare module 'lunar-javascript' {
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

    getSolar(): Solar
    [key: string]: any
  }

  export class Solar {
    constructor(year: number, month: number, day: number)
    getYear(): number
    getMonth(): number
    getDay(): number
    [key: string]: any
  }
}
