'use strict';
import * as moment from 'moment';

export class DateUtil {
    /**
     * 10为的当前时间戳，精度秒
     * 本地时区时间
     */
    static now() {
        return Math.round(new Date().getTime() / 1000);
    }

    /**
     * 10位的当前时间戳，精度秒
     * unix时间
     */
    static unixNow() {
        return moment().unix();
    }

    /**
     * 获取订阅开始时间
     * @param unixTime 指定某天的时间戳，10位时间戳
     */
    static dayStartUnixTime(unixTime: number = 0) {
        if (unixTime > 0) {
            return moment(unixTime * 1000).hour(0).minute(0).second(0).unix();
        }
        return moment().hour(0).minute(0).second(0).unix();
    }

    /**
     * 获取订阅结束时间
     * @param days 指定多少天之后，天数
     * @param unixTime 具体时间的时间戳，10位时间戳
     */
    static dayEndUnixTime(days: number = 0, unixTime: number = 0) {
        if (unixTime > 0) {
            return moment(unixTime * 1000).subtract(1, 'days').add(days, 'days').hour(23).minute(59).second(59).unix();
        }
        return moment().subtract(1, 'days').add(days, 'days').hour(23).minute(59).second(59).unix();
    }

    /**
     * 获取开始时间和结束时间相差的天数
     * @param endAt 结束时间 10位时间戳
     * @param startAt 开始时间 10位时间戳
     */
    static diffDay(endAt: number = 0, startAt: number = 0) {
        return moment((endAt + 1) * 1000).diff(moment(startAt * 1000), 'days');
    }

    /**
     * 当前时间到结束时间剩余天数
     * @param endAt 结束时间 10位时间戳
     */
    static remainderDays(endAt: number): number {
        return moment((endAt + 1) * 1000).diff(moment(), 'days');
    }

    /**
     * 获取当前时间
     * 如果传递格式，按照传递格式
     * 默认格式是: YYYY-MM-DD HH:mm:ss
     */
    static timeFormat(format: string = 'YYYY-MM-DD HH:mm:ss') {
        return moment().format(format);
    }

    /**
     * 获取某个时间几天前的时间
     * @param date 日期可以是时间戳
     * @param day 几天前
     * @param format 格式
     */
    static beforDateFormat(date: Date | number, day: number = 7, format: string = 'YYYY-MM-DD HH:mm:ss') {
        return moment(date).subtract(day, 'days').format(format);
    }

    /**
     * 获取某个时间几天后的时间
     * @param date 日期可以是时间戳
     * @param day 几天后
     * @param format 格式
     */
    static afterDateFormat(date: Date | number, day: number = 7, format: string = 'YYYY-MM-DD HH:mm:ss') {
        return moment(date).add(day, 'days').format(format);
    }

    /**
     * 格式化时间
     * 如果传递格式，按照传递格式
     * 默认格式是: YYYY-MM-DD HH:mm:ss
     */
    static format(date: Date | number, format: string = 'YYYY-MM-DD HH:mm:ss') {
        return moment(date).format(format);
    }

    /**
     * 获取月份的开始时间和结束时间
     * @param monthly 月份 格式： 05/2019
     */
    static getMonthStartAndEnd(monthly: string = ''): number[] {
        if (monthly.length === 7) {
            return [moment(`01/${monthly}`, 'DD/MM/YYYY').startOf('month').unix(), moment(`01/${monthly}`, 'DD/MM/YYYY').endOf('month').unix()];
        } else {
            return [0, 0];
        }
    }

    /**
     * 根据时区处理传递进来的时间
     * @param time 当是时间戳的时候，必须13位
     * @param zone
     * @param format
     */
    static getTimeZoneTime(time: Date | number | string, zone: number = 0, format: string = 'YYYY-MM-DD HH:mm:ss'): string | number {
        let t;
        if (typeof time ==='number' || typeof time === 'string') {
            t = new Date(time);
        } else if (time instanceof Date) {
            t = time;
        } else {
            t = new Date();
        }

        // 先把时间还原到没有时区
        t.setHours(t.getHours() - 8);

        // 把目标时区加上
        t.setHours(t.getHours() + zone);

        // 格式化时间
        const r = moment(t).format(format);
        return r;
    }

    /**
     * 计算某个时间在某年的第多少周
     * 默认周日算一周的第一天，如果需要周一算第一天，第二个参数传递false即可
     * https://en.wikipedia.org/wiki/ISO_week_date
     * https://blog.csdn.net/carllucasyu/article/details/78569525
     */
    static getWeek(time: string, sunday: boolean = true): string {

        if (sunday) {
            const today = new Date(time);

            // 这一年的第一天
            let firstDay = new Date(today.getFullYear(), 0, 1);

            // 这一年第一天是周几
            const dayOfWeek = firstDay.getDay();

            let spendDay = 1;
            // 如果第一天不是周天，计算偏移量
            if (dayOfWeek !== 0) {
                spendDay = 7 - dayOfWeek + 1;
            }

            // 这一年偏移之后的第一个完整周的第一天的日期
            firstDay = new Date(today.getFullYear(), 0, 1 + spendDay);

            // 计算共相差多少天
            const d = Math.ceil((today.valueOf() - firstDay.valueOf()) / 86400000);

            // 计算共多少周
            let week = Math.ceil(d / 7);

            // 如果当天是周天+1
            if (today.getDay() === 0) {
                week = week + 1;
            }

            // 如果偏移量不是1天也+1，不要问，问就自己去看，绝对头发掉很多。
            if (spendDay !== 1) {
                week = week + 1;
            }
            return `${today.getFullYear()}-${week < 10 ? '0' + week : week}`;
        } else {
            // 计算当天时间
            const today = new Date(time);

            // 计算起始时间
            const firstDay = new Date(today.getFullYear(), 0, 1);
            let day1 = today.getDay();

            if (day1 === 0) {
                day1 = 7;
            }

            let day2 = firstDay.getDay();
            if (day2 === 0) {
                day2 = 7;
            }

            // 当前时间减去今年第一秒时间 加上 今天周几 和 今年第一天周几的差的几天 换算成 具体的天数
            const d = Math.round((today.getTime() - firstDay.getTime() + (day2 - day1) * (24 * 60 * 60 * 1000)) / 86400000);

            // 除以7 换成周
            let week = Math.ceil(d / 7);

            const first = new Date(`${today.getFullYear()}-01-01`);

            // 获取今年第一天是周几
            if (first.getDay() !== 0) {
                week++;
            }

            return `${today.getFullYear()}-${week < 10 ? '0' + week : week}`;
        }
    }

}
