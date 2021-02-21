"use strict";

const Homey = require("homey");
const io = require("socket.io-client");

const { IO_ON, IO_EMIT } = require("./events");
const {
  getBrokenButtons,
  getBrokenAccelerators,
  getBrokenDisplays,
  getBrokenInputs,
} = require("./helpers");

class DesktopDevice extends Homey.Device {
  static KEYS = {
    BUTTONS: "buttons",
    ACCELERATORS: "accelerators",
    DISPLAYS: "displays",
    INPUTS: "inputs",
  };

  async onInit() {
    this.log("device:onInit");
    const data = this.getData();
    const store = this.getStore();

    const devices = await this.homey.app.homeyAPI.devices.getDevices({
      filter: {
        driverId: "desktop",
        driverUri: "homey:app:nl.jwienk.desktop-device",
      },
    });

    const device = Object.values(devices).find((device) => {
      return device.data.id === data.id;
    });

    this.apiId = device ? device.id : null;

    this.socket = io(`https://${store.address}:${store.port}`, {
      path: "/desktop",
      rejectUnauthorized: false, // selfsigned certificate
      query: {
        cloudId: this.homey.app.systemInfo.cloudId,
        name: this.homey.app.systemName,
      },
    });

    this.socket.on("connect", () => {
      this.socket.sendBuffer = [];
      this.log("connect:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      this.log("disconnect:", reason);
    });

    this.socket.on("error", (error) => {
      this.error("error:", error);
    });

    this.socket.on("connect_error", (error) => {
      //this.log('connect_error:', error);
    });

    this.socket.on("connect_timeout", (timeout) => {
      this.log("connect_error:", timeout);
    });

    this.socket.on("reconnect", (attemptNumber) => {
      this.log("reconnect:", attemptNumber);
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      this.log("reconnect_attempt:", attemptNumber);
    });

    this.socket.on("reconnecting", (attemptNumber) => {
      this.log("reconnecting:", attemptNumber);
    });

    this.socket.on("reconnect_error", (error) => {
      this.log("reconnect_error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      this.log("reconnect_failed:");
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

    this.socket.on(IO_ON.DISPLAYS_SYNC, (data, callback) => {
      this.handleDisplaysSync(data, callback);
    });

    this.socket.on(IO_ON.INPUTS_SYNC, (data, callback) => {
      this.handleInputsSync(data, callback);
    });

    this.socket.on(IO_ON.INPUT_RUN, (data, callback) => {
      this.handleInputRun(data, callback);
    });
  }

  ready() {
    this.log("device:ready");
    this.setAvailable();
  }

  onDiscoveryResult(discoveryResult) {
    this.log("onDiscoveryResult");
    return discoveryResult.id === this.getData().id;
  }

  onDiscoveryAvailable(discoveryResult) {
    this.log("onDiscoveryAvailable", discoveryResult);
    // todo set in store
  }

  onDiscoveryAddressChanged(discoveryResult) {
    this.log("onDiscoveryAddressChanged", discoveryResult);
    // todo set in store
  }

  onDiscoveryLastSeenChanged(discoveryResult) {
    this.log("onLastSeenChanged", discoveryResult);
  }

  async handleButtonsSync(data, callback) {
    this.log("buttons:sync");
    const buttons = await this.setButtons(data.buttons);
    const flows = await this.homey.app.homeyAPI.flow.getFlows();
    const broken = getBrokenButtons(buttons, flows, this);
    callback({ broken });
  }

  async handleButtonRun(data) {
    this.log("button:run", data);
    try {
      await this.driver.triggerDeviceButtonCard.trigger(
        this,
        { token: 1 },
        data
      );
    } catch (error) {
      this.error(error);
    }
  }

  async handleAcceleratorsSync(data, callback) {
    this.log("accelerators:sync");
    const accelerators = await this.setAccelerators(data.accelerators);
    const flows = await this.homey.app.homeyAPI.flow.getFlows();
    const broken = getBrokenAccelerators(accelerators, flows, this);
    callback({ broken });
  }

  async handleAcceleratorRun(data) {
    this.log("accelerator:run", data);
    try {
      await this.driver.triggerDeviceAcceleratorCard.trigger(
        this,
        { token: 1 },
        data
      );
    } catch (error) {
      this.error(error);
    }
  }

  async handleDisplaysSync(data, callback) {
    this.log("displays:sync");
    const displays = await this.setDisplays(data.displays);
    const flows = await this.homey.app.homeyAPI.flow.getFlows();
    const broken = getBrokenDisplays(displays, flows, this);
    callback({ broken });
  }

  async handleInputsSync(data, callback) {
    this.log("inputs:sync");
    const inputs = await this.setInputs(data.inputs);
    const flows = await this.homey.app.homeyAPI.flow.getFlows();
    const broken = getBrokenInputs(inputs, flows, this);
    callback({ broken });
  }

  async handleInputRun(data) {
    this.log("input:run", data);

    let card = null;

    switch (data.type) {
      case 'text':
        card = this.driver.triggerDeviceInputTextCard
        break;
      case 'number':
        card = this.driver.triggerDeviceInputNumberCard
        break;
      default:
        throw new Error(`Invalid input type: ${data.type}`)
    }

    try {
      await card.trigger(
        this,
        { content: data.content },
        data
      );
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

  getDisplays() {
    const displays = this.getStoreValue(DesktopDevice.KEYS.DISPLAYS);
    return displays ? displays : [];
  }

  async setDisplays(displays) {
    await this.setStoreValue(DesktopDevice.KEYS.DISPLAYS, displays);
    return this.getDisplays();
  }

  getInputs() {
    const inputs = this.getStoreValue(DesktopDevice.KEYS.INPUTS);
    return inputs ? inputs : [];
  }

  async setInputs(inputs) {
    await this.setStoreValue(DesktopDevice.KEYS.INPUTS, inputs);
    return this.getInputs();
  }
}

module.exports = DesktopDevice;
