const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const wrapAsyncFn = require('../Utils/wrapAsyncFn');
const checkData = require('../Utils/checkData');

router.post(
    "/updateData",
    wrapAsyncFn(async (req, res) => {
        console.log('got updateData req');
        const tmpFileName = process.env.DATA_FILE_NAME + process.env.DATA_FILE_EXT + '.tmp';

        const downloadPath = path.join(process.env.DATA_DIR_PATH, tmpFileName);
        const fileWriteStream = fs.createWriteStream(downloadPath);

        //save tmp data
        await pipeline(
            req,
            fileWriteStream
        );

        //파이썬 돌리기


        //data check


        //데이터  파일 교체

        //데이터 global에 리로딩

        res.set(200).send({result: 'ok'});
    })
);

module.exports = router;
