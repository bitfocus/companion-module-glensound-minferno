const { InstanceBase, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const WebSocket = require('ws')
const objectPath = require('object-path')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')
const UpgradeScripts = require('./upgrades')

class GlensoundMinfernoInstance extends InstanceBase {
	isInitialized = false

	subscriptions = new Map()
	
	pgmStatus = true
	gainSetting = 255
	meterPeakRaw = 0
	meterPeak = 0
	
	wsRegex = '^wss?:\\/\\/([\\da-z\\.-]+)(:\\d{1,5})?(?:\\/(.*))?$'

	async init(config) {
		this.config = config

		this.initWebSocket()
		this.isInitialized = true

		this.updateFeedbacks()
		this.updateVariableDefinitions()
		this.updateActions()
	}

	async destroy() {
		this.isInitialized = false
		if (this.reconnect_timer) {
			clearTimeout(this.reconnect_timer)
			this.reconnect_timer = null
		}
		if (this.ws) {
			this.ws.close(1000)
			delete this.ws
		}
	}

	async configUpdated(config) {
		this.config = config
		this.initWebSocket()
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
	
	updateActions() {
		UpdateActions(this)
	}

	maybeReconnect() {
		if (this.isInitialized && this.config.reconnect) {
			if (this.reconnect_timer) {
				clearTimeout(this.reconnect_timer)
			}
			this.reconnect_timer = setTimeout(() => {
				this.initWebSocket()
			}, 5000)
		}
	}

	initWebSocket() {
		if (this.reconnect_timer) {
			clearTimeout(this.reconnect_timer)
			this.reconnect_timer = null
		}

		const url = 'ws://'+this.config.addr+'/ppmetc'
		if (!url || url.match(new RegExp(this.wsRegex)) === null) {
			this.updateStatus(InstanceStatus.BadConfig, `IP address is not defined or invalid`)
			return
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.ws) {
			this.ws.close(1000)
			delete this.ws
		}
		this.ws = new WebSocket(url)
		this.ws.binaryType = 'arraybuffer'

		this.ws.on('open', () => {
			this.updateStatus(InstanceStatus.Ok)
			this.log('debug', `Connection opened`)
			if (this.config.reset_variables) {
				this.updateVariableDefinitions()
			}
		})
		this.ws.on('close', (code) => {
			this.log('debug', `Connection closed with code ${code}`)
			this.updateStatus(InstanceStatus.Disconnected, `Connection closed with code ${code}`)
			this.maybeReconnect()
		})

		this.ws.on('message', this.messageReceivedFromWebSocket.bind(this))

		this.ws.on('error', (data) => {
			this.log('error', `WebSocket error: ${data}`)
		})
	}

	messageReceivedFromWebSocket(data) {
		let d = new Uint8Array(data)
		let status = d[4] == 1 ? true : false
		let gainSetting = d[5]-128
		this.meterPeakRaw = d[0]
		this.meterPeak = 2*this.meterPeakRaw-14
		this.setVariableValues({['meterPeak']: this.meterPeak,['meterPeakRaw']: this.meterPeakRaw,})
		if (gainSetting != this.gainSetting) {
			this.gainSetting = gainSetting
			this.setVariableValues({['gainSetting']: gainSetting})
		}
		if (this.pgmStatus != status) {
			this.pgmStatus = status
			this.setVariableValues({['pgmStatus']: d[4]})
			this.checkFeedbacks('PGMStatus')
		}
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					"Module for controlling Glensound Minferno commentator boxes.",
			},
			{
				type: 'textinput',
				id: 'addr',
				label: 'Target address',
				tooltip: 'The ip address or hostname of the Glensound Minferno.',
				width: 12
			},
			{
				type: 'checkbox',
				id: 'reconnect',
				label: 'Reconnect',
				tooltip: 'Reconnect on WebSocket error (after 5 secs)',
				width: 6,
				default: true,
			},
			{
				type: 'checkbox',
				id: 'debug_messages',
				label: 'Debug messages',
				tooltip: 'Log incomming and outcomming messages',
				width: 6,
			},
			{
				type: 'checkbox',
				id: 'reset_variables',
				label: 'Reset variables',
				tooltip: 'Reset variables on init and on connect',
				width: 6,
				default: true,
			},
		]
	}

}

runEntrypoint(GlensoundMinfernoInstance, UpgradeScripts)
