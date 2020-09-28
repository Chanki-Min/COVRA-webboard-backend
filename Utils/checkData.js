const keys = ['death', 'confirmed', 'deathPrediction', 'confirmedPrediction', 'cladePopulation'];
const regions = ['global'];
const cladeRegion = [
    'global',
    'Australia', 'Austria', 'Belgium', 'Canada', 'Chile', 'Denmark',
    'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Iceland', 'Ireland', 'Israel', 'Italy', 'Japan', 'Latvia',
    'Lithuania', 'Luxembourg', 'Mexico', 'Netherlands', 'New Zealand',
    'Norway', 'Poland', 'Portugal', 'Republic of Korea', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden', 'Switzerland',
    'United States of America'
];

const checkData = async (dataObj) => {
    keys.forEach(value => {
        if (!dataObj.hasOwnProperty(value))
            return false;
    });

    regions.forEach((region) =>{
        keys.forEach((key) => {
            if (!dataObj[key].hasOwnProperty(region))
                return false;
        })
    });

    cladeRegion.forEach((value) => {
        if(!dataObj[keys[4]].hasOwnProperty(value))
            return false;
    })
    return true;
}

module.exports = checkData;
