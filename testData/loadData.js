const fs = require('fs');

let data = fs.readFileSync('testData/data.json');
data = JSON.parse(data.toString());

module.exports = data;
