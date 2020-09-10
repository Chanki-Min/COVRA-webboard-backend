const data = {
	death: {
		from: "2020-01-01",
		to: "2020-09-08",
		global: {
			data : [
				1,
				10,
			]
		},
	},

	confirmed: {
		from: "2020-01-01",
		to: "2020-09-08",
		global: {
			data : [
				1,
				10,
			]

		},
	},

	deathPrediction: {
		from: "2020-01-01",
		to: "2020-12-31",
		global: {
			data : [
				1,
				10,

			]

		},
	},

	cladePopulation: {
		global: {
			label: ['S', 'L', 'V', 'G', 'GR', 'GH', 'Other'],
			data: [5326, 3975, 4775, 18946, 29562, 19464, 3685]
		},

    }
}

module.exports = data;
