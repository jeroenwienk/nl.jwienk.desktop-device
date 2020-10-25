'use strict';

const Homey = require('homey');

const { IO_ON, IO_EMIT } = require('./events');

class DesktopDriver extends Homey.Driver {
  async onInit() {
    this.log('driver:onInit');

    this.ready().then(() => {
      this.log('driver:ready');
    });

    this.triggerDeviceButtonCard = this.homey.flow.getDeviceTriggerCard('trigger_button');
    this.triggerDeviceAcceleratorCard = this.homey.flow.getDeviceTriggerCard('trigger_accelerator');
    this.triggerDeviceCommandCard = this.homey.flow.getDeviceTriggerCard('trigger_command');

    this.registerTriggerButton();
    this.registerTriggerAccelerator();
    this.registerTriggerCommand();
    this.registerActionBrowserOpen();
    this.registerActionPathOpen();
    this.registerActionNotificationShow();
    this.registerActionCommand();
  }

  async onPairListDevices() {
    this.log('driver:onPairListDevices');
    const discoveryStrategy = this.homey.discovery.getStrategy('desktop');
    const discoveryResults = Object.values(
      discoveryStrategy.getDiscoveryResults()
    );

    return discoveryResults.map((discoveryResult) => {
      this.log(discoveryResult);
      return {
        name: discoveryResult.txt.hostname,
        data: {
          id: discoveryResult.id,
          mac: discoveryResult.txt.mac,
          address: discoveryResult.address,
          host: discoveryResult.host,
          port: discoveryResult.port,
          name: discoveryResult.name,
          fullname: discoveryResult.fullname
        },
        store: {
          id: discoveryResult.txt.id,
          mac: discoveryResult.txt.mac,
          address: discoveryResult.address,
          port: discoveryResult.txt.port,
          platform: discoveryResult.txt.platform,
          hostname: discoveryResult.txt.hostname
        }
      };
    });
  }

  registerTriggerButton() {
    this.triggerDeviceButtonCard.registerRunListener(async (args, state) => {
      const { device, button } = args;

      if (state.id === button.id) {
        // TODO: create issue about ghost error;
        try {
          device.socket.emit(IO_EMIT.BUTTON_RUN_SUCCESS, button);
        } catch (error) {
          this.error(error);
        }

        return true;
      }

      return false;
    });

    this.triggerDeviceButtonCard.registerArgumentAutocompleteListener(
      'button',
      async (query, args) => {
        const { device } = args;
        const buttons = device.getButtons();

        return buttons.map((button) => {
          return {
            id: button.id,
            name: button.name,
            description: button.description
          };
        });
      }
    );

    this.triggerDeviceButtonCard.on('update', () => {
      this.getDevices().forEach((device) => {
        device.socket.emit(IO_EMIT.FLOW_BUTTON_SAVED);
      });
    });
  }

  registerTriggerAccelerator() {
    this.triggerDeviceAcceleratorCard.registerRunListener(async (args, state) => {
      const { device, accelerator } = args;

      if (state.id === accelerator.id) {
        try {
          device.socket.emit(IO_EMIT.ACCELERATOR_RUN_SUCCESS, accelerator);
        } catch (error) {
          this.error(error);
        }

        return true;
      }

      return false;
    });

    this.triggerDeviceAcceleratorCard.registerArgumentAutocompleteListener(
      'accelerator',
      async (query, args) => {
        const { device } = args;
        const accelerators = device.getAccelerators();

        return accelerators.map((accelerator) => {
          return {
            id: accelerator.id,
            name: accelerator.keys,
            description: accelerator.keys
          };
        });
      }
    );

    this.triggerDeviceAcceleratorCard.on('update', () => {
      this.getDevices().forEach((device) => {
        device.socket.emit(IO_EMIT.FLOW_ACCELERATOR_SAVED);
      });
    });
  }

  registerTriggerCommand() {
    this.triggerDeviceCommandCard.registerRunListener(async (args, state) => {
      const { device, outputId } = args;

      if (state.outputId === outputId) {
        return true;
      }

      return false;
    });

    this.triggerDeviceCommandCard.on('update', () => {

    });
  }

  registerActionBrowserOpen() {
    const action = this.homey.flow.getActionCard('action_browser_open');

    action.registerRunListener(async (args, state) => {
      const { device, url } = args;

      device.socket.emit(IO_EMIT.BROWSER_OPEN_RUN, { url }, (error) => {
        if (error) {
          this.error(error);
        }
      });
      return true;
    });

    action.on('update', () => {

    });
  }

  registerActionPathOpen() {
    const action = this.homey.flow.getActionCard('action_path_open');

    action.registerRunListener(async (args, state) => {
      const { device, path } = args;

      device.socket.emit(IO_EMIT.PATH_OPEN_RUN, { path }, (error) => {
        if (error) {
          this.error(error);
        }
      });
      return true;
    });

    action.on('update', () => {

    });
  }

  registerActionNotificationShow() {
    const action = this.homey.flow.getActionCard('action_notification_show');

    action.registerRunListener(async (args, state) => {
      const { device, title, body, silent } = args;

      device.socket.emit(IO_EMIT.NOTIFICATION_SHOW_RUN, { title, body, silent }, (error) => {
        if (error) {
          this.error(error);
        }
      });
      return true;
    });

    action.on('update', () => {

    });
  }

  registerActionCommand() {
    const action = this.homey.flow.getActionCard('action_command');

    action.registerRunListener(async (args, state) => {
      const { device, command, cwd, timeout, outputId } = args;

      const emit = () => new Promise((resolve, reject) => {
        device.socket.emit(IO_EMIT.COMMAND_RUN, { command, cwd, timeout }, (error, result) => {
          if (error) {
            reject(error)
          }

          resolve(result);
        });
      })

      try {
        const result = await emit()
        this.log(result)

        // TODO: when!
        if (result.stderr.length > 0) {

        }

        this.triggerDeviceCommandCard
          .trigger(device, { output: result.stdout }, { outputId });

        return true
      } catch (error) {
        this.error(error)

        if (error.stderr != null) {
          this.triggerDeviceCommandCard
            .trigger(device, { output: error.stderr }, { outputId });
          return true;
        }

        this.triggerDeviceCommandCard
          .trigger(device, { output: JSON.stringify(error) }, { outputId });
        return false;
      }
    });

    action.on('update', () => {

    });
  }
}

module.exports = DesktopDriver;
