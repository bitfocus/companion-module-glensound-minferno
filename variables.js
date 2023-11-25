module.exports = async function (self) {
	self.setVariableDefinitions([
		{ variableId: 'pgmStatus', name: 'PGM Status' },
		{ variableId: 'meterPeak', name: 'Meter Peak' },
		{ variableId: 'meterPeakRaw', name: 'Meter Peak RAW' },
		{ variableId: 'gainSetting', name: 'Gain Setting' },
	])
}
