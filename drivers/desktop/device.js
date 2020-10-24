'use strict';

const Homey = require('homey');
const io = require('socket.io-client');

const { IO_ON, IO_EMIT } = require('./events');
const { getBrokenButtons, getBrokenAccelerators } = require('./helpers');

class DesktopDevice extends Homey.Device {
  static KEYS = {
    BUTTONS: 'buttons',
    ACCELERATORS: 'accelerators'
  };

  async onInit() {
    this.log('device:onInit');
    const data = this.getData();

    this.log(this.getStore());

    const devices = await this.homey.app.homeyAPI.devices.getDevices({
      filter: {
        driverId: 'desktop',
        driverUri: 'homey:app:nl.jwienk.desktop',
      }
    });

    const device = Object.values(devices).find((device) => {
      return device.data.id === data.id
    })

    this.apiId = device.id;

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

    this.socket.on(IO_ON.BUTTONS_SYNC, (data, callback) => {
      this.handleButtonsSync(data, callback);
    });

    this.socket.on(IO_ON.BUTTON_RUN, (data, callback) => {
      this.handleButtonRun(data, callback);
    });

    this.socket.on(IO_ON.ACCELERATORS_SYNC, (data, callback) => {
      this.handleAcceleratorsSync(data, callback);
    });

    this.socket.on(IO_ON.ACCELERATOR_RUN, (data, callback) => {
      this.handleAcceleratorRun(data, callback);
    });
  }

  ready() {
    this.log('device:ready');
    this.setAvailable();
  }

  onDiscoveryResult(discoveryResult) {
    this.log('onDiscoveryResult', discoveryResult);
    return discoveryResult.id === this.getData().id;
  }

  async onDiscoveryAvailable(discoveryResult) {
    this.log('onDiscoveryAvailable', discoveryResult);
  }

  onDiscoveryAddressChanged(discoveryResult) {
    this.log('onDiscoveryAddressChanged', discoveryResult);
  }

  onDiscoveryLastSeenChanged(discoveryResult) {
    this.log('onLastSeenChanged', discoveryResult);
  }

  async handleButtonsSync(data, callback) {
    this.log('buttons:sync', data);
    const buttons = await this.setButtons(data.buttons);
    const flows = await this.homey.app.homeyAPI.flow.getFlows();
    const broken = getBrokenButtons(buttons, flows, this);
    callback({ broken });
  }

  async handleButtonRun(data) {
    console.log('button:run', data);
    try {
      await this.driver.triggerDeviceButtonCard
        .trigger(this, { token: 1 }, data);
    } catch (error) {
      this.error(error);
    }
  }

  async handleAcceleratorsSync(data, callback) {
    console.log('accelerators:sync', data);
    const accelerators = await this.setAccelerators(data.accelerators);
    const flows = await this.homey.app.homeyAPI.flow.getFlows();
    const broken = getBrokenAccelerators(accelerators, flows, this);
    callback({ broken });
  }

  async handleAcceleratorRun(data) {
    console.log('accelerator:run', data);
    try {
      await this.driver.triggerDeviceAcceleratorCard
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

  getAccelerators() {
    const accelerators = this.getStoreValue(DesktopDevice.KEYS.ACCELERATORS);
    return accelerators ? accelerators : [];
  }

  async setAccelerators(accelerators) {
    await this.setStoreValue(DesktopDevice.KEYS.ACCELERATORS, accelerators);
    return this.getAccelerators();
  }
}

module.exports = DesktopDevice;
