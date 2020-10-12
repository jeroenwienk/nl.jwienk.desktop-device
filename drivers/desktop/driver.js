'use strict';

const Homey = require('homey');

class DesktopDriver extends Homey.Driver {
  async onInit() {
    this.log('driver:onInit');

    this.ready().then(() => {
      this.log('driver:ready');
    });

    this.triggerDeviceButtonCard = this.homey.flow.getDeviceTriggerCard('trigger_button');

    console.log(this.triggerDeviceButtonCard);

    this.registerTriggerButton();
    this.registerActionBrowserOpen();
    this.registerActionPathOpen();
    this.registerActionNotificationShow();
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
        name: discoveryResult.txt.name,
        data: {
          id: discoveryResult.txt.id,
          address: discoveryResult.address,
          host: discoveryResult.host,
          port: discoveryResult.port,
          name: discoveryResult.name,
          fullname: discoveryResult.fullname
        },
        store: {
          address: discoveryResult.address
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
          device.socket.emit('button:run:success', button);
        } catch (error) {
          console.log(error);
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
        device.socket.emit('flow:button:saved');
      })
    });
  }

  registerActionBrowserOpen() {
    const action = this.homey.flow.getActionCard('action_browser_open');

    action.registerRunListener(async (args, state) => {
      const { device, url } = args;

      device.socket.emit('browser:open:run', { url }, (response) => {
        console.log('browser:open:run:response:', response);
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

      device.socket.emit('path:open:run', { path }, (response) => {
        console.log('path:open:run:response:', response);
      });
      return true;
    });

    action.on('update', () => {

    });
  }

  registerActionNotificationShow() {
    const action = this.homey.flow.getActionCard('action_notification_show');

    action.registerRunListener(async (args, state) => {

      //console.log(args);

      const { device, title, body, silent } = args;

      device.socket.emit('notification:show:run', { title, body, silent }, (response) => {
        console.log('notification:show:run:response:', response);
      });
      return true;
    });

    action.on('update', () => {

    });
  }
}

module.exports = DesktopDriver;
