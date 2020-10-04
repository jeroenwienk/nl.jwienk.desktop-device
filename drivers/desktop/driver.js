'use strict';

const Homey = require('homey');

class DesktopDriver extends Homey.Driver {
  async onInit() {
    this.log('driver:onInit');

    this.ready().then(() => {
      this.log('driver:ready');
    });

    const commandAction = this.homey.flow.getActionCard('command');

    commandAction.registerRunListener(async (args, state) => {
      const { device, command } = args;
      device.socket.emit(
        'run:commands',
        { commands: [command] },
        (response) => {
          console.log('response:', response);
        }
      );
      return true;
    });

    commandAction.registerArgumentAutocompleteListener(
      'command',
      async (query, args) => {
        const { device } = args;
        const commands = device.commands != null ? device.commands : [];

        return commands.map((command) => {
          return {
            id: command.id,
            name: command.name,
            description: command.description,
          };
        });
      }
    );

    commandAction.on('update', (...args) => {
      // This event is fired when the card is updated by the user (e.g. a Flow has been saved).
      console.log('commandAction:update');
    });

    this.registerActionBrowserOpen();
    this.registerActionPathOpen();
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
          fullname: discoveryResult.fullname,
        },
        store: {
          address: discoveryResult.address,
        },
      };
    });
  }

  registerActionBrowserOpen() {
    const action = this.homey.flow.getActionCard('action_browser_open');

    action.registerRunListener(async (args, state) => {
      const { device, url } = args;

      device.socket.emit('run:browser:open', { url: url }, (response) => {
        console.log('run:browser:open:response:', response);
      });
      return true;
    });

    action.on('update', () => {
      console.log('browser:open:command:update', args);
    });
  }

  registerActionPathOpen() {
    const action = this.homey.flow.getActionCard('action_path_open');

    action.registerRunListener(async (args, state) => {
      const { device, path } = args;

      device.socket.emit('run:path:open', { path: path }, (response) => {
        console.log('run:path:open:response:', response);
      });
      return true;
    });

    action.on('update', () => {
      console.log('browser:path:command:update', args);
    });
  }
}

module.exports = DesktopDriver;
