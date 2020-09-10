const express = require("express");
const router = express.Router();
const { ungzip } = require("node-gzip");
const fs = require('fs');
const path = require('path');

const wrapAsyncFn = asyncFn => {
    return (async (req, res, next) => {
        try {
            return await asyncFn(req, res, next)
        } catch (error) {
            return next(error)
        }
    })
}

router.get("/globalStatus", wrapAsyncFn(async (req, res) => {

        res.status(200).send(
            {
                byDay: {
                    confirmed: [216452, 266120, 271234, 242321, 235421, 267432, 254231],
                    death: [4497, 5632, 6434, 4753, 4214, 6432, 7214],
                    from: '2020-08-31',
                    end: '2020-09-06'
                },
                byWeek: {
                    confirmed: [32, 266120, 271234, 242321, 235421, 267432, 254231],
                    death: [4497, 5632, 6434, 4753, 4214, 6432, 7214],
                    from: '2020-08-17',
                    end: '2020-09-28'
                },
                byMonth: {
                    confirmed: [1216452, 132, 1271234, 1242321, 1235421, 1267432, 1254231],
                    death: [24497, 15632, 16434, 14753, 14214, 16432, 17214],
                    from: '2020-06-01',
                    end: '2020-12-31'
                }
            })
    })
);

router.get("/cladeStatus", wrapAsyncFn(async (req, res) => {
        const cladeData = global.data.cladePopulation.global;

        res.status(200).send(cladeData)
    })
);

function getGlobalStatus(day, week, month, deathDate, confirmedData) {
    const todayDate = new Date();


}

module.exports = router;