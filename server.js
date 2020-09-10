require("dotenv").config();
const express = require("express");
const compression = require('compression')
const bodyParser = require("body-parser");
const cors = require('cors')
const backendRouter = require('./Router/cardDataRouter');

const data = require('./testData/sample');

const app = express();
app.use(compression({}));
app.use(bodyParser.json({limit: "50mb"}));

global.countries = [
    'Australia', 'Austria', 'Belgium', 'Canada', 'Chile', 'Denmark',
    'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Iceland', 'Ireland', 'Israel', 'Italy', 'Japan', 'Latvia',
    'Lithuania', 'Luxembourg', 'Mexico', 'Netherlands', 'New Zealand',
    'Norway', 'Poland', 'Portugal', 'Republic of Korea', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden', 'Switzerland',
    'United States of America'
];

global.data = data;

const corsOptions = {
    origin: '*', // Origin 이 어디든지 허용한다.
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

app.use("/", backendRouter);

const listener = app.listen(5000,  () => {
    console.log("Your app is listening on port " + listener.address().port);
});
