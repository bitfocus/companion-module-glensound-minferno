module.exports = function (self) {
	self.setActionDefinitions({
		togglePGM: {
			name: 'Toggle PGM',
			callback: async (action, context) => {
				let cmd1 = new Uint8Array([0,0,0,1,0,0,0,0,0,0])
				let cmd2 = new Uint8Array([0,0,0,0,0,0,0,0,0,0])
				self.ws.send(cmd1)
				self.ws.send(cmd2)
			},
		},
		gainUp: {
			name: 'Gain Up',
			callback: async (action, context) => {
				let cmd1 = new Uint8Array([1,0,0,0,0,0,0,0,0,0])
				let cmd2 = new Uint8Array([0,0,0,0,0,0,0,0,0,0])
				self.ws.send(cmd1)
				self.ws.send(cmd2)
			},
		},
		gainDown: {
			name: 'Gain Down',
			callback: async (action, context) => {
				let cmd1 = new Uint8Array([0,1,0,0,0,0,0,0,0,0])
				let cmd2 = new Uint8Array([0,0,0,0,0,0,0,0,0,0])
				self.ws.send(cmd1)
				self.ws.send(cmd2)
			},
		},
		gainLineUp: {
			name: 'Gain Line Up',
			callback: async (action, context) => {
				let cmd1 = new Uint8Array([0,0,1,0,0,0,0,0,0,0])
				let cmd2 = new Uint8Array([0,0,0,0,0,0,0,0,0,0])
				self.ws.send(cmd1)
				self.ws.send(cmd2)
			},
		},
	})
}
