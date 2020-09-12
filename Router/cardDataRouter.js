const express = require("express");
const router = express.Router();
const {ungzip} = require("node-gzip");
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


router.get("/nationalDeath", wrapAsyncFn(async (req, res) => {
        const nation = req.query.nation;
        if (nation === undefined) {
            res.status(404).send({
                error: `invalid request. need "nation" parameter`
            })
            return
        }

        const nationData = global.data.death[nation];
        if (nationData === undefined) {
            res.status(404).send({
                error: `${nation} is not supported nation`
            })
            return
        }

        const slicedData = nationData.slice(-2);
        res.status(200).send(
            {
                total: slicedData[1],
                sinceYesterday: slicedData[1] - slicedData[0],
            })
    })
);

router.get("/nationalConfirmed", wrapAsyncFn(async (req, res) => {
        const nation = req.query.nation;
        if (nation === undefined) {
            res.status(404).send({
                error: `invalid request. need "nation" parameter`
            })
            return
        }

        const nationData = global.data.confirmed[nation];
        if (nationData === undefined) {
            res.status(404).send({
                error: `${nation} is not supported nation`
            })
            return
        }

        const slicedData = nationData.slice(-2);
        res.status(200).send(
            {
                total: slicedData[1],
                sinceYesterday: slicedData[1] - slicedData[0],
            })
    })
);

module.exports = router;
