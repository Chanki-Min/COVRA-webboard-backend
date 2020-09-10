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

router.get("/globalDeath", wrapAsyncFn(async (req, res) => {
		const len = global.data.death.global.data.length;

		res.status(200).send(
		{
			total: global.data.death.global.data[len-1],
			sinceYesterday: global.data.death.global.data[len-1] - global.data.death.global.data[len-2],
		})
	})
);

router.get("/globalConfirmed", wrapAsyncFn(async (req, res) => {
		const len = global.data.confirmed.global.data.length;

		res.status(200).send(
		{
			total: global.data.confirmed.global.data[len-1],
			sinceYesterday: global.data.confirmed.global.data[len-1] - global.data.confirmed.global.data[len-2],
		})
	})
);

router.get("/nationalDeath", wrapAsyncFn(async (req, res) => {
		const nation = req.query.nation;
		if(nation === undefined) {
			res.status(404).send({
				error: `invalid request. need "nation" parameter`
			})
			return
		}

		const nationData = global.data.death[nation];
		if(nationData === undefined) {
			res.status(404).send({
				error: `${nation} is not supported nation`
			})
			return
		}

		const len = nationData.data.length;

		res.status(200).send(
		{
			total: nationData.data[len-1],
			sinceYesterday: nationData.data[len-1] - nationData.data[len-2],
		})
	})
);

router.get("/nationalConfirmed", wrapAsyncFn(async (req, res) => {
		const nation = req.query.nation;
		if(nation === undefined) {
			res.status(404).send({
				error: `invalid request. need "nation" parameter`
			})
			return
		}

		const nationData = global.data.confirmed[nation];
		if(nationData === undefined) {
			res.status(404).send({
				error: `${nation} is not supported nation`
			})
			return
		}
		const len = nationData.data.length;

		res.status(200).send(
		{
			total: nationData.data[len-1],
			sinceYesterday: nationData.data[len-1] - nationData.data[len-2],
		})
	})
);

module.exports = router;
