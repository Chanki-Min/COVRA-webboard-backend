require("dotenv").config();
const express = require("express");
const compression = require('compression')
const bodyParser = require("body-parser");
const cors = require('cors')
const cardDataRouter = require('./Router/cardDataRouter');
const graphDataRouter = require('./Router/graphDataRouter');
const updateRouter = require('./Router/updateRouter');

const data = require('./Data/loadData');

const app = express();
app.use(compression({}));

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

app.use("/", cardDataRouter);
app.use("/", graphDataRouter);
app.use("/", updateRouter);

const listener = app.listen(parseInt(process.env.PORT, 10) , process.env.URL, () => {
    console.log("Your app is listening on  " + listener.address());
});

