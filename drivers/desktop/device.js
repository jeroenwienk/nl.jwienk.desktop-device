'use strict';

const Homey = require('homey');
const io = require('socket.io-client');
const { IO_ON, IO_EMIT } = require('./events');

class DesktopDevice extends Homey.Device {
  static KEYS = {
    BUTTONS: 'buttons'
  };

  onInit() {
    this.log('device:onInit');
    const data = this.getData();

    this.socket = io(`http://${data.address}:${data.port}`, {
      path: '/desktop',
      query: {
        cloudId: this.homey.app.systemInfo.cloudId,
        name: this.homey.app.systemName
      }
    });

    this.socket.on('connect', () => {
      console.log('connect:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('disconnect:', reason);
    });

    this.socket.on('error', (error) => {
      console.log('error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.log('connect_error:', error);
    });

    this.socket.on('connect_timeout', (timeout) => {
      console.log('connect_error:', timeout);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('reconnect:', attemptNumber);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('reconnect_attempt:', attemptNumber);
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log('reconnecting:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.log('reconnect_error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('reconnect_failed:', error);
    });

    this.socket.on(IO_ON.COMMANDS_SYNC, (data) => {
      console.log('commands:sync', data);
      this.commands = data.commands;
    });

    this.socket.on(IO_ON.BUTTONS_SYNC, (data, callback) => {
      this.handleButtonsSync(data, callback);
    });

    this.socket.on(IO_ON.BUTTON_RUN, (data, callback) => {
      this.handleButtonRun(data, callback);
    });
  }

  ready() {
    this.log('device:ready');
    this.setAvailable();
  }

  async handleButtonsSync(data, callback) {
    console.log('buttons:sync', data);
    const buttons = await this.setButtons(data.buttons);
    const flows = await this.homey.app.homeyAPI.flow.getFlows();

    const filteredFlows = Object.values(flows).filter((flow) => {
      return flow.trigger && flow.trigger.id === 'trigger_button';
    });

    const broken = filteredFlows.reduce((accumulator, flow) => {
      if (flow.trigger.args.button) {
        const button = buttons.find((button) => {
          return flow.trigger.args.button.id === button.id;
        });

        // either name or description doesnt match
        if (
          button &&
          (button.name !== flow.trigger.args.button.name ||
            button.description !== flow.trigger.args.button.description)
        ) {
          accumulator.push({
            flow: flow,
            button: button
          });
          return accumulator;

        }

        // there is a flow with a unknown button
        if (button == null) {
          accumulator.push({
            flow: flow,
            button: null
          });
          return accumulator
        }
      }
      return accumulator;
    }, []);

    callback({ broken });
  }

  async handleButtonRun(data, callback) {
    console.log('button:run', data);

    try {
      await this.driver.triggerDeviceButtonCard
        .trigger(this, { token: 1 }, data);
    } catch (error) {
      this.error(error);
    }


  }

  getButtons() {
    const buttons = this.getStoreValue(DesktopDevice.KEYS.BUTTONS);
    return buttons ? buttons : [];
  }

  async setButtons(buttons) {
    await this.setStoreValue(DesktopDevice.KEYS.BUTTONS, buttons);
    return this.getButtons();
  }
}

module.exports = DesktopDevice;
