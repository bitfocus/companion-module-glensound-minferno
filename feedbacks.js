const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		PGMStatus: {
			name: 'PGM channel status',
			type: 'boolean',
			label: 'PGM State',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: (feedback) => {
					return self.pgmStatus
			},
		},
	})
}
