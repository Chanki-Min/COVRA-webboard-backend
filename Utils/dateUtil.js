const moment = require('moment');
const _ = require('lodash');
const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

function addDays(date, days) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + days,
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    );
}

function getDateDiffInDays(date1, date2) {
    return Math.floor( (date1 - date2) / DAY_IN_MILLIS );
}

function dateToString(date) {
    return date.toISOString().split('T')[0];
}

function groupAndAggregateByWeek(data, dataStartingFrom, len) {
    const mappedData = data.map((value, index) => {
        return ({
            data: value,
            date: dateToString(addDays(new Date(dataStartingFrom), index)),
        })
    });

    return Object.values(_.groupBy(mappedData, (dt) => moment(dt.date).year().toString()+'-'+moment(dt.date).week())) //mappedData 를 주차별로 그룹핑
        .map((
            (value) => value.map((value) =>value.data) //mappedData 각 원소에서 data 만 다시 분리
                .reduce((prev, curr) => prev+curr) //각 주별로 data 합산
            )
        );
}

function groupAndAggregateByMonth(data, dataStartingFrom, len) {
    const mappedData = data.map((value, index) => {
            return ({
                data: value,
                date: dateToString(addDays(new Date(dataStartingFrom), index)),
            });
        });

    return Object.values(_.groupBy(mappedData, (dt) => moment(dt.date).year().toString()+'-'+moment(dt.date).month()))
        .map((
                (value) => value.map((value) =>value.data)
                    .reduce((prev, curr) => prev+curr)
            )
        );
}

exports.addDays = addDays;
exports.getDateDiffInDats = getDateDiffInDays;
exports.dateToString = dateToString;
exports.groupAndAggregateByWeek = groupAndAggregateByWeek;
exports.groupAndAggregateByMonth = groupAndAggregateByMonth;
