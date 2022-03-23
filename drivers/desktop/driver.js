'use strict';

const Homey = require('homey');

const { IO_EMIT } = require('./events');

class DesktopDriver extends Homey.Driver {
  async onInit() {
    this.log('driver:onInit');

    this.ready().then(() => {
      this.log('driver:ready');
    });

    this.triggerDeviceButtonCard =
      this.homey.flow.getDeviceTriggerCard('trigger_button');
    this.triggerDeviceAcceleratorCard = this.homey.flow.getDeviceTriggerCard(
      'trigger_accelerator'
    );
    this.triggerDeviceCommandCard =
      this.homey.flow.getDeviceTriggerCard('trigger_command');
    this.triggerDeviceInputTextCard =
      this.homey.flow.getDeviceTriggerCard('trigger_input_text');
    this.triggerDeviceInputNumberCard = this.homey.flow.getDeviceTriggerCard(
      'trigger_input_number'
    );

    this.registerTriggerButton();
    this.registerTriggerAccelerator();
    this.registerTriggerCommand();
    this.registerTriggerInputText();
    this.registerTriggerInputNumber();
    this.registerActionBrowserOpen();
    this.registerActionPathOpen();
    this.registerActionNotificationShow();
    this.registerActionCommand();
    this.registerActionDisplaySet();
    this.registerActionWindowOpen();
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
          fullname: discoveryResult.fullname,
        },
        store: {
          id: discoveryResult.txt.id,
          mac: discoveryResult.txt.mac,
          address: discoveryResult.address,
          port: discoveryResult.txt.port,
          platform: discoveryResult.txt.platform,
          hostname: discoveryResult.txt.hostname,
        },
      };
    });
  }

  // onPair(session) {
  //   session.setHandler('list_devices', this.onPairListDevices.bind(this));
  // }

  // onRepair(session, device) {
  //   session.setHandler('list_devices', async (data) => {
  //     const discoveryStrategy = this.homey.discovery.getStrategy('desktop');
  //     const discoveryResults = Object.values(
  //       discoveryStrategy.getDiscoveryResults()
  //     );
  //
  //     return discoveryResults.map((discoveryResult) => {
  //       this.log(discoveryResult);
  //       return {
  //         name: discoveryResult.txt.hostname,
  //         data: {
  //           id: discoveryResult.id,
  //           mac: discoveryResult.txt.mac,
  //           address: discoveryResult.address,
  //           host: discoveryResult.host,
  //           port: discoveryResult.port,
  //           name: discoveryResult.name,
  //           fullname: discoveryResult.fullname,
  //         },
  //         store: {
  //           id: discoveryResult.txt.id,
  //           mac: discoveryResult.txt.mac,
  //           address: discoveryResult.address,
  //           port: discoveryResult.txt.port,
  //           platform: discoveryResult.txt.platform,
  //           hostname: discoveryResult.txt.hostname,
  //         },
  //       };
  //     });
  //   });
  // }

  registerTriggerButton() {
    this.triggerDeviceButtonCard.registerRunListener(async (args, state) => {
      const { device, button } = args;

      if (state.id === button.id) {
        try {
          device.socket.volatile.emit(IO_EMIT.BUTTON_RUN_SUCCESS, button);
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

        return buttons
          .map((button) => {
            return {
              id: button.id,
              name: button.name,
              description: button.description,
            };
          })
          .filter((button) => {
            return this.matchesNameOrDescription(button, query);
          });
      }
    );

    this.triggerDeviceButtonCard.on('update', () => {
      this.getDevices().forEach((device) => {
        device.socket.volatile.emit(IO_EMIT.FLOW_BUTTON_SAVED);
      });
    });
  }

  registerTriggerAccelerator() {
    this.triggerDeviceAcceleratorCard.registerRunListener(
      async (args, state) => {
        const { device, accelerator } = args;

        if (state.id === accelerator.id) {
          try {
            device.socket.volatile.emit(
              IO_EMIT.ACCELERATOR_RUN_SUCCESS,
              accelerator
            );
          } catch (error) {
            this.error(error);
          }

          return true;
        }

        return false;
      }
    );

    this.triggerDeviceAcceleratorCard.registerArgumentAutocompleteListener(
      'accelerator',
      async (query, args) => {
        const { device } = args;
        const accelerators = device.getAccelerators();

        return accelerators
          .map((accelerator) => {
            return {
              id: accelerator.id,
              name: accelerator.keys,
              description: accelerator.description,
            };
          })
          .filter((accelerator) => {
            return this.matchesNameOrDescription(accelerator, query);
          });
      }
    );

    this.triggerDeviceAcceleratorCard.on('update', () => {
      this.getDevices().forEach((device) => {
        device.socket.volatile.emit(IO_EMIT.FLOW_ACCELERATOR_SAVED);
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

    this.triggerDeviceCommandCard.on('update', () => {});
  }

  registerTriggerInputText() {
    this.triggerDeviceInputTextCard.registerRunListener(async (args, state) => {
      const { device, input } = args;

      if (state.id === input.id) {
        try {
          device.socket.volatile.emit(IO_EMIT.INPUT_RUN_SUCCESS, input);
        } catch (error) {
          this.error(error);
        }

        return true;
      }

      return false;
    });

    this.triggerDeviceInputTextCard.registerArgumentAutocompleteListener(
      'input',
      async (query, args) => {
        const { device } = args;
        const inputs = device.getInputs();

        return inputs
          .map((input) => {
            return {
              id: input.id,
              type: input.type,
              name: input.name,
              description: input.description,
            };
          })
          .filter((input) => {
            return (
              input.type === 'text' &&
              this.matchesNameOrDescription(input, query)
            );
          });
      }
    );

    this.triggerDeviceInputTextCard.on('update', () => {
      this.getDevices().forEach((device) => {
        device.socket.volatile.emit(IO_EMIT.FLOW_INPUT_SAVED);
      });
    });
  }

  registerTriggerInputNumber() {
    this.triggerDeviceInputNumberCard.registerRunListener(
      async (args, state) => {
        const { device, input } = args;

        if (state.id === input.id) {
          try {
            device.socket.volatile.emit(IO_EMIT.INPUT_RUN_SUCCESS, input);
          } catch (error) {
            this.error(error);
          }

          return true;
        }

        return false;
      }
    );

    this.triggerDeviceInputNumberCard.registerArgumentAutocompleteListener(
      'input',
      async (query, args) => {
        const { device } = args;
        const inputs = device.getInputs();

        return inputs
          .map((input) => {
            return {
              id: input.id,
              type: input.type,
              name: input.name,
              description: input.description,
            };
          })
          .filter((input) => {
            return (
              input.type === 'number' &&
              this.matchesNameOrDescription(input, query)
            );
          });
      }
    );

    this.triggerDeviceInputNumberCard.on('update', () => {
      this.getDevices().forEach((device) => {
        device.socket.volatile.emit(IO_EMIT.FLOW_INPUT_SAVED);
      });
    });
  }

  registerActionBrowserOpen() {
    const action = this.homey.flow.getActionCard('action_browser_open');

    action.registerRunListener(async (args, state) => {
      const { device, url } = args;

      device.socket.volatile.emit(
        IO_EMIT.BROWSER_OPEN_RUN,
        { url },
        (error) => {
          if (error) {
            this.error(error);
          }
        }
      );
      return true;
    });

    action.on('update', () => {});
  }

  registerActionPathOpen() {
    const action = this.homey.flow.getActionCard('action_path_open');

    action.registerRunListener(async (args, state) => {
      const { device, path } = args;

      device.socket.volatile.emit(IO_EMIT.PATH_OPEN_RUN, { path }, (error) => {
        if (error) {
          this.error(error);
        }
      });
      return true;
    });

    action.on('update', () => {});
  }

  registerActionNotificationShow() {
    const action = this.homey.flow.getActionCard('action_notification_show');

    action.registerRunListener(async (args, state) => {
      const { device, title, body, silent } = args;

      device.socket.volatile.emit(
        IO_EMIT.NOTIFICATION_SHOW_RUN,
        { title, body, silent },
        (error) => {
          if (error) {
            this.error(error);
          }
        }
      );
      return true;
    });

    action.on('update', () => {});
  }

  registerActionCommand() {
    const action = this.homey.flow.getActionCard('action_command');

    action.registerRunListener(async (args, state) => {
      const { device, command, cwd, timeout, outputId } = args;

      const emit = () =>
        new Promise((resolve, reject) => {
          device.socket.volatile.emit(
            IO_EMIT.COMMAND_RUN,
            { command, cwd, timeout },
            (error, result) => {
              if (error) {
                reject(error);
              }

              resolve(result);
            }
          );
        });

      try {
        const result = await emit();
        this.log(result);

        // todo: when!
        if (result.stderr.length > 0) {
        }

        this.triggerDeviceCommandCard.trigger(
          device,
          { output: result.stdout },
          { outputId }
        );

        return true;
      } catch (error) {
        this.error(error);

        if (error.stderr != null) {
          this.triggerDeviceCommandCard.trigger(
            device,
            { output: error.stderr },
            { outputId }
          );
          return true;
        }

        this.triggerDeviceCommandCard.trigger(
          device,
          { output: JSON.stringify(error) },
          { outputId }
        );
        return false;
      }
    });

    action.on('update', () => {});
  }

  registerActionDisplaySet() {
    const action = this.homey.flow.getActionCard('action_display_set');

    action.registerRunListener(async (args, state) => {
      const { device, display, text } = args;

      device.socket.volatile.emit(
        IO_EMIT.DISPLAY_SET_RUN,
        { display, text },
        (error) => {
          if (error) {
            this.error(error);
          }
        }
      );
      return true;
    });

    action.registerArgumentAutocompleteListener(
      'display',
      async (query, args) => {
        const { device } = args;
        const displays = device.getDisplays();

        return displays
          .map((display) => {
            return {
              id: display.id,
              name: display.name,
              description: display.description,
            };
          })
          .filter((display) => {
            return this.matchesNameOrDescription(display, query);
          });
      }
    );

    action.on('update', () => {
      this.getDevices().forEach((device) => {
        device.socket.volatile.emit(IO_EMIT.FLOW_DISPLAY_SAVED);
      });
    });
  }

  registerActionWindowOpen() {
    const action = this.homey.flow.getActionCard('action_window_open');

    action.registerRunListener(async (args, state) => {
      const { device, window } = args;

      device.socket.volatile.emit(
        IO_EMIT.WINDOW_OPEN_RUN,
        { window },
        (error) => {
          if (error) {
            this.error(error);
          }
        }
      );
      return true;
    });

    action.registerArgumentAutocompleteListener(
      'window',
      async (query, args) => {
        // const { device } = args;
        // const windows = device.getWindows();

        return ['main', 'overlay', 'webapp']
          .map((display) => {
            return {
              id: display,
              name: display,
              description: display,
            };
          })
          .filter((display) => {
            return this.matchesNameOrDescription(display, query);
          });
      }
    );

    action.on('update', () => {});
  }

  matchesNameOrDescription(value, query) {
    return (
      value.name.toLowerCase().includes(query.toLowerCase()) ||
      value.description.toLowerCase().includes(query.toLowerCase())
    );
  }
}

module.exports = DesktopDriver;
