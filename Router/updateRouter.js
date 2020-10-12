const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);
const wrapAsyncFn = require('../Utils/wrapAsyncFn');
const exec = require('child_process').exec;
const execPromise = util.promisify(exec);
const checkData = require('../Utils/checkData');

router.post(
    "/updateData",
    wrapAsyncFn(async (req, res) => {
        const predictionPath = path.resolve(process.env.PATH_PYTHON_DIR, process.env.PATH_DOWNLOAD_PREDICTION);
        const tmpPath = path.join(predictionPath) + '.tmp';
        const fileWriteStream = fs.createWriteStream(tmpPath);

        //save tmp data
        await pipeline(
            req,
            fileWriteStream
        );

        //move tmp file
        await fs.promises.rename(tmpPath, predictionPath);

        //파이썬 돌리기
        const scriptPath = path.resolve(process.env.PATH_PYTHON_DIR, 'main.py');
        await execPromise(`python ${scriptPath}`);

        //TODO : data check

        //데이터  파일 교체
        const processFilePath = path.resolve(process.env.PATH_PYTHON_DIR, process.env.PATH_DATA_JSON);
        const targetPath = path.resolve(process.env.PATH_DATA);
        await fs.promises.rename(processFilePath, targetPath);

        //데이터 global에 리로딩
        let data = await fs.promises.readFile(process.env.PATH_DATA);
        data = JSON.parse(data.toString());
        global.data = data;

        res.set(200).send({result: 'ok'});
    })
);

module.exports = router;
