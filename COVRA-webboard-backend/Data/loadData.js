const fs = require('fs');
const checkData = require('../Utils/checkData');

let data = undefined;

if(fs.existsSync('Data/data.json')) {
    data = fs.readFileSync('Data/data.json');
    data = JSON.parse(data.toString());
}

module.exports = data;


