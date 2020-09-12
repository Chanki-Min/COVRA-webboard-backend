const express = require("express");
const router = express.Router();
const {ungzip} = require("node-gzip");
const fs = require("fs");
const path = require("path");
const dateUtil = require('../Utils/dateUtil');

const wrapAsyncFn = (asyncFn) => {
    return async (req, res, next) => {
        try {
            return await asyncFn(req, res, next);
        } catch (error) {
            return next(error);
        }
    };
};
const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

//TODO : 계산결과를 global 객체에 캐싱하기 (global.data 가 변경되지 않는 이상, 여러번 계산하는건 필요없음)
router.get(
    "/nationStatus",
    wrapAsyncFn(async (req, res) => {
        try {
            const result = getNationStatus(req.query.nation, req.query.dayQ, req.query.weekQ, req.query.monthQ, global.data.death, global.data.confirmed);
            res.status(200).send(result);
        } catch (e) {
            console.error(e);
            res.status(404).send(e.message);
        }
    })
);

router.get(
    "/nationCladeStatus",
    wrapAsyncFn(async (req, res) => {
        const nation = req.query.nation;
        if(nation === undefined) {
            console.warn('cladeStatus :: got request with no param');
            res.status(404).send(`cladeStatus :: require 'nation' parameter.`);
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

function getNationStatus(
    nation,
    dayQ,
    weekQ,
    monthQ,
    deathData,
    confirmedData
) {
    if (deathData[nation] === undefined || confirmedData[nation] === undefined) {
        throw new TypeError(`getNationStatus :: got unsupported nation request. ${nation}`);
    }

    let todayDate = new Date();
    const deathFrom = new Date(deathData.from);
    const confirmedFrom = new Date(confirmedData.from);

    let deathTodayIndex = dateUtil.getDateDiffInDats(todayDate, deathFrom);
    let confirmedTodayIndex = dateUtil.getDateDiffInDats(todayDate, confirmedFrom);

    //오늘까지의 데이터가 없는경우, 마지막 날짜까지만 받는다.
    if (
        deathTodayIndex > deathData[nation].length ||
        confirmedTodayIndex > confirmedData[nation].length
    ) {
        console.warn(
            `getNationStatus :: current date out of bound, today : ${dateUtil.dateToString(todayDate)}, deathTo : ${deathData.to}, confirmedTo : ${confirmedData.to}`
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
        from: deathStartingIndex !== 0 ? dateUtil.dateToString(dateUtil.addDays(todayDate, -dayQ)) : deathData.from,
        to: dateUtil.dateToString(todayDate),
    };

    const byWeek = {
        death: dateUtil.groupAndAggregateByWeek(deathData[nation], deathData.from).slice(-weekQ),
        confirmed: dateUtil.groupAndAggregateByWeek(confirmedData[nation], confirmedData.from).slice(-weekQ),
        from: deathStartingIndex !== 0 ? dateUtil.dateToString(dateUtil.addDays(todayDate, -dayQ)) : deathData.from,
        to: dateUtil.dateToString(todayDate),
    };

    const byMonth = {
        death: dateUtil.groupAndAggregateByMonth(deathData[nation], deathData.from).slice(-monthQ),
        confirmed: dateUtil.groupAndAggregateByMonth(confirmedData[nation], confirmedData.from).slice(-monthQ),
        from: deathStartingIndex !== 0 ? dateUtil.dateToString(dateUtil.addDays(todayDate, -dayQ)) : deathData.from,
        to: dateUtil.dateToString(todayDate),
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
