'use strict';

const Homey = require('homey');
const io = require('socket.io-client');

const { IO_ON, IO_EMIT, events } = require('./events');

class DesktopDevice extends Homey.Device {
  static KEYS = {
    BUTTONS: 'buttons',
    ACCELERATORS: 'accelerators',
    DISPLAYS: 'displays',
    INPUTS: 'inputs'
  };

  async onInit() {
    this.log('device:onInit');
    const store = this.getStore();

    this.socket = io(`https://${store.address}:${store.port}`, {
      path: '/desktop',
      rejectUnauthorized: false, // selfsigned certificate
      query: {
        cloudId: this.homey.app.systemInfo.cloudId, // remove
        homeyId: this.homey.app.systemInfo.cloudId,
        name: this.homey.app.systemName
      }
    });

    this.socket.on('connect', () => {
      // broken
      // using socket.volatile.emit for now
      this.socket.sendBuffer = [];
      this.log('connect:', this.socket.id);

      this.driver.sendTriggerCommanderEventArgumentValues(this);
    });

    this.socket.on('disconnect', (reason) => {
      this.log('disconnect:', reason);
    });

    this.socket.on('error', (error) => {
      this.error('error:', error);
    });

    this.socket.on('connect_error', (error) => {
      //this.log('connect_error:', error);
    });

    this.socket.on('connect_timeout', (timeout) => {
      this.log('connect_error:', timeout);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.log('reconnect:', attemptNumber);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.log('reconnect_attempt:', attemptNumber);
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      this.log('reconnecting:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      this.log('reconnect_error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      this.log('reconnect_failed:');
    });

    this.socket.on(IO_ON.BUTTONS_SYNC, (data, callback) => {
      this.handleButtonsSync(data, callback);
    });

    this.socket.on(IO_ON.BUTTON_RUN, (data, callback) => {
      this.handleButtonRun(data, callback);
    });

    this.socket.on(IO_ON.ACCELERATORS_SYNC, (data) => {
      this.handleAcceleratorsSync(data);
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

    this.socket.on(events.GET_API_PROPS, (data, callback) => {
      Promise.all([
        this.homey.api.getOwnerApiToken(),
        this.homey.api.getLocalUrl()
      ])
        .then(([token, url]) => {
          callback(null, { data: { token, url } });
        })
        .catch((error) => {
          callback(error);
        });
    });

    this.socket.on(events.GET_COMMAND_ARGUMENT_VALUES, (args, callback) => {
      const responsePromise =
        this.driver.getTriggerCommanderEventArgumentValuesResponse(this);

      Promise.all([responsePromise])
        .then(([response]) => {
          callback(null, response);
        })
        .catch((error) => {
          callback(error);
        });
    });

    this.socket.on(events.SEND_COMMAND, (args, callback) => {
      this.log(args);
      const command = args.data.command;
      const input = args.data.input;

      let inputAsString = '';
      if (input != null) {
        inputAsString = input;
      }

      let inputAsNumber = parseFloat(input);
      if (Number.isNaN(inputAsNumber)) {
        // Same as Number(null)
        inputAsNumber = 0;
        // inputAsNumber = Number.MIN_SAFE_INTEGER;
      }

      this.log({
        inputAsString,
        inputAsNumber
      });

      const responsePromise = this.driver.triggerCommanderEvent.trigger(
        this,
        {
          inputAsString: inputAsString,
          inputAsNumber: inputAsNumber
        },
        {
          command
        }
      );

      Promise.all([responsePromise])
        .then(([result]) => {
          this.log('triggerCommanderEvent.trigger:', result);
          callback(null, result);
        })
        .catch((error) => {
          this.error(error);
          callback(error);
        });
    });
  }

  async send({ event, args, callback }) {
    // Volatile events are events that will not be sent if the underlying connection is not ready (a bit like UDP, in terms of reliability).
    // https://socket.io/docs/v3/emitting-events/#volatile-events
    this.socket.volatile.emit(event, args, callback);
  }

  onDiscoveryResult(discoveryResult) {
    this.log('onDiscoveryResult', discoveryResult);
    return discoveryResult.id === this.getData().id;
  }

  onDiscoveryAvailable(discoveryResult) {
    this.log('onDiscoveryAvailable', discoveryResult);
    this.setStoreValue('address', discoveryResult.address);
    this.setAvailable().catch(this.error);
  }

  onDiscoveryAddressChanged(discoveryResult) {
    this.log('onDiscoveryAddressChanged', discoveryResult);
    // todo set in store
  }

  onDiscoveryLastSeenChanged(discoveryResult) {
    this.log('onLastSeenChanged', discoveryResult);
  }

  async handleButtonRun(data) {
    this.log('button:run', data);
    try {
      await this.driver.triggerDeviceButtonCard.trigger(this, {}, data);
    } catch (error) {
      this.error(error);
    }
  }

  async handleAcceleratorRun(data) {
    this.log('accelerator:run', data);
    try {
      await this.driver.triggerDeviceAcceleratorCard.trigger(this, {}, data);
    } catch (error) {
      this.error(error);
    }
  }

  async handleInputRun(data) {
    this.log('input:run', data);

    let card = null;

    switch (data.type) {
      case 'text':
        card = this.driver.triggerDeviceInputTextCard;
        break;
      case 'number':
        card = this.driver.triggerDeviceInputNumberCard;
        break;
      default:
        throw new Error(`Invalid input type: ${data.type}`);
    }

    try {
      await card.trigger(this, { content: data.content }, data);
    } catch (error) {
      this.error(error);
    }
  }

  async handleButtonsSync(data) {
    this.log('buttons:sync');
    await this.setButtons(data.buttons);
  }

  async handleAcceleratorsSync(data) {
    this.log('accelerators:sync');
    await this.setAccelerators(data.accelerators);
  }

  async handleDisplaysSync(data) {
    this.log('displays:sync');
    await this.setDisplays(data.displays);
  }

  async handleInputsSync(data) {
    this.log('inputs:sync');
    await this.setInputs(data.inputs);
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
