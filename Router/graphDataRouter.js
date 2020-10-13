const express = require("express");
const router = express.Router();
const {ungzip} = require("node-gzip");
const fs = require("fs");
const path = require("path");
const dateUtil = require('../Utils/dateUtil');
const moment = require('moment');
const TIME_FORMAT = "YYYY-MM-DD";
const wrapAsyncFn = require('../Utils/wrapAsyncFn');
const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

//TODO : 계산결과를 global 객체에 캐싱하기 (global.data 가 변경되지 않는 이상, 여러번 계산하는건 필요없음)
router.get(
    "/nationalStatus",
    (req, res) => {
        if(global.data === undefined) {
            res.status(404).send({
                error: `no data;`
            });
            return;
        }
        try {
            const result = aggregateDataByTime(req.query.nation, req.query.dayQ, req.query.weekQ, req.query.monthQ, global.data.death, global.data.confirmed);
            res.status(200).send(result);
        } catch (e) {
            console.error('nationalStatus :: ' + e);
            res.status(404).send(e.message);
        }
    }
);

router.get(
    "/nationalPrediction",
    (req, res) => {
        if(global.data === undefined) {
            res.status(404).send({
                error: `no data;`
            });
            return;
        }
        try {
            const result = aggregateDataByTime(req.query.nation, req.query.dayQ, req.query.weekQ, req.query.monthQ, global.data.deathPrediction, global.data.confirmedPrediction, req.query.endDate)
            res.status(200).send(result);
        } catch (e) {
            console.error('nationalPrediction :: ' + e);
            res.status(404).send(e.message);
        }
    }
);

router.get(
    "/nationalCladeStatus",
    wrapAsyncFn(async (req, res) => {
        const nation = req.query.nation;
        if(nation === undefined) {
            console.warn('cladeStatus :: got request with no param');
            res.status(404).send(`cladeStatus :: require 'nation' parameter.`);
            return;
        }
        if(global.data === undefined) {
            res.status(404).send({
                error: `no data;`
            });
            return;
        }

        const cladeData = global.data.cladePopulation[nation];
        if (cladeData === undefined) {
            console.warn(`cladeStatus :: got unsupported nation request. ${nation}`);
            res.status(404).send(`cladeStatus :: got unsupported nation request. ${nation}`);
            return;
        }
        res.status(200).send(cladeData);
    })
);

function aggregateDataByTime(
    nation,
    dayQ,
    weekQ,
    monthQ,
    deathData,
    confirmedData,
    endDate
) {
    if (deathData[nation] === undefined || confirmedData[nation] === undefined) {
        throw new TypeError(`getNationStatus :: got unsupported nation request. ${nation}`);
    }

    let todayDate;
    if(endDate === undefined) {
        todayDate = new Date();
    } else {
        todayDate = endDate instanceof  Date ? endDate : new Date(endDate);
    }

    const deathFrom = new Date(deathData.from);
    const confirmedFrom = new Date(confirmedData.from);

    let deathTodayIndex = dateUtil.getDateDiffInDats(todayDate, deathFrom);
    let confirmedTodayIndex = dateUtil.getDateDiffInDats(todayDate, confirmedFrom);

    //오늘까지의 데이터가 없는경우, 현재 가진 데이터의 최신 날짜까지만 계산하도록 변수 수정.
    if (
        deathTodayIndex > deathData[nation].length ||
        confirmedTodayIndex > confirmedData[nation].length
    ) {
        console.warn(
            `getNationStatus :: current date out of bound, today : ${moment(todayDate).format(TIME_FORMAT)}, deathTo : ${deathData.to}, confirmedTo : ${confirmedData.to}`
        );
        deathTodayIndex = deathData[nation].length - 1;
        confirmedTodayIndex = confirmedData[nation].length - 1;
        todayDate = new Date(deathData.to);
    }

    const deathStartingIndex = deathTodayIndex - dayQ >= 0 ? deathTodayIndex - dayQ + 1 : 0;
    const confirmedStartingIndex = confirmedTodayIndex - dayQ >= 0 ? confirmedTodayIndex - dayQ + 1 : 0;

    const byDay = {
        death: deathData[nation].slice(deathStartingIndex, deathTodayIndex + 1),
        confirmed: confirmedData[nation].slice(confirmedStartingIndex, confirmedTodayIndex + 1),
        from: deathStartingIndex !== 0 ? moment(todayDate).add(-dayQ+1, 'days').startOf('days').format(TIME_FORMAT) : deathData.from,
        to: moment(todayDate).endOf('days').format(TIME_FORMAT),
    };

    const byWeek = {
        death: dateUtil.groupAndAggregateByWeek(deathData[nation], deathData.from).slice(-weekQ),
        confirmed: dateUtil.groupAndAggregateByWeek(confirmedData[nation], confirmedData.from).slice(-weekQ),
        from: deathStartingIndex !== 0 ? moment(todayDate).add(-weekQ+1, 'weeks').startOf('weeks').format(TIME_FORMAT) : deathData.from,
        to: moment(todayDate).endOf('weeks').format(TIME_FORMAT),
    };

    const byMonth = {
        death: dateUtil.groupAndAggregateByMonth(deathData[nation], deathData.from).slice(-monthQ),
        confirmed: dateUtil.groupAndAggregateByMonth(confirmedData[nation], confirmedData.from).slice(-monthQ),
        from: deathStartingIndex !== 0 ? moment(todayDate).add(-monthQ+1, 'months').startOf('months').format(TIME_FORMAT) : deathData.from,
        to: moment(todayDate).endOf('months').format(TIME_FORMAT),
    };


    return (
        {
            byDay: byDay,
            byWeek: byWeek,
            byMonth: byMonth,
        }
    )
}

module.exports = router;
