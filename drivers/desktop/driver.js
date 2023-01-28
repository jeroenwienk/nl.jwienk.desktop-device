'use strict';

const Homey = require('homey');

const { IO_EMIT, events } = require('./events');

class DesktopDriver extends Homey.Driver {
  async onInit() {
    this.log('driver:onInit');

    this.ready().then(() => {
      this.log('driver:ready');
    });

    this.registerTriggerCommanderEvent();

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
    // this.registerActionWindowAction();
    // this.registerActionWindowMove();
    // this.registerActionWebAppExecuteCode();
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
          fullname: discoveryResult.fullname,
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

  async getTriggerCommanderEventArgumentValues(device) {
    return await this.triggerCommanderEvent.getArgumentValues(device);
  }

  async getTriggerCommanderEventArgumentValuesResponse(device) {
    /**
     * Three cases
     * - On app restart send on connection established
     * - On flow save
     * - On requested by desktop app
     *
     */

    const result = await this.getTriggerCommanderEventArgumentValues(device);
    const homeyId = await this.homey.cloud.getHomeyId();
    const name = this.homey.app.systemName;

    return {
      data: {
        homeyId: homeyId,
        name: name,
        arguments: result,
      },
    };
  }

  async sendTriggerCommanderEventArgumentValues(device) {
    const response = await this.getTriggerCommanderEventArgumentValuesResponse(
      device
    );
    device.send({
      event: events.ON_COMMAND_ARGUMENT_VALUES,
      args: response,
    });
  }

  sendArgumentValues() {
    for (const device of this.getDevices()) {
      this.sendTriggerCommanderEventArgumentValues(device).catch(this.error);
    }
  }

  registerTriggerCommanderEvent() {
    this.triggerCommanderEvent = this.homey.flow.getDeviceTriggerCard(
      'trigger_commander_event'
    );

    this.triggerCommanderEvent.registerRunListener(async (args, state) => {
      this.log('Running command');
      this.log(state.command === args.command);
      return state.command === args.command;
    });

    this.triggerCommanderEvent.on('update', () => {
      this.sendArgumentValues();
    });
  }

  registerTriggerButton() {
    this.triggerDeviceButtonCard.registerRunListener(async (args, state) => {
      const { button } = args;

      return state.id === button.id;
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
        const { accelerator } = args;

        return state.id === accelerator.id;
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
      const { outputId } = args;

      return state.outputId === outputId;
    });
  }

  registerTriggerInputText() {
    this.triggerDeviceInputTextCard.registerRunListener(async (args, state) => {
      const { input } = args;

      return state.id === input.id;
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
        const { input } = args;

        return state.id === input.id;
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

      return new Promise((resolve, reject) => {
        device.socket.volatile.emit(
          IO_EMIT.BROWSER_OPEN_RUN,
          { url },
          (error) => {
            if (error) {
              this.error(error);
              reject(error);
            } else {
              resolve(true);
            }
          }
        );
      });
    });
  }

  registerActionPathOpen() {
    const action = this.homey.flow.getActionCard('action_path_open');

    action.registerRunListener(async (args, state) => {
      const { device, path } = args;

      return new Promise((resolve, reject) => {
        device.socket.volatile.emit(
          IO_EMIT.PATH_OPEN_RUN,
          { path },
          (error) => {
            if (error) {
              this.error(error);
              reject(error);
            } else {
              resolve(true);
            }
          }
        );
      });
    });
  }

  registerActionNotificationShow() {
    const action = this.homey.flow.getActionCard('action_notification_show');

    action.registerRunListener(async (args, state) => {
      const { device, title, body, silent } = args;

      return new Promise((resolve, reject) => {
        device.socket.volatile.emit(
          IO_EMIT.NOTIFICATION_SHOW_RUN,
          { title, body, silent },
          (error) => {
            if (error) {
              this.error(error);
              reject(error);
            } else {
              resolve(true);
            }
          }
        );
      });
    });
  }

  registerActionWindowAction() {
    const action = this.homey.flow.getActionCard('action_window_action');

    action.registerRunListener(async (args, state) => {
      const { device, window, action } = args;

      return new Promise((resolve, reject) => {
        device.socket.volatile.emit(
          IO_EMIT.WINDOW_ACTION_RUN,
          { window, action },
          (error) => {
            if (error) {
              this.error(error);
              reject(error);
            } else {
              resolve(true);
            }
          }
        );
      });
    });

    action.registerArgumentAutocompleteListener(
      'window',
      async (query, args) => {
        return [
          {
            id: 'main',
            name: 'Main',
            description: 'The main app window.',
          },
          {
            id: 'overlay',
            name: 'Overlay',
            description: 'The overlay window.',
          },
          {
            id: 'web_app',
            name: 'Web App',
            description: 'The web app window.',
          },
        ]
          .map((window) => {
            return {
              id: window.id,
              name: window.name,
              description: window.description,
            };
          })
          .filter((window) => {
            return this.matchesNameOrDescription(window, query);
          });
      }
    );

    action.registerArgumentAutocompleteListener(
      'action',
      async (query, args) => {
        return [
          {
            id: 'open',
            name: 'open',
            description: 'Shows and gives focus to the window.',
          },
          {
            id: 'close',
            name: 'close',
            description: 'Hides the window.',
          },
          {
            id: 'toggle',
            name: 'toggle',
            description: 'Shows or hides a window.',
          },
          {
            id: 'maximize',
            name: 'maximize',
            description:
              "Maximizes the window. This will also show (but not focus) the window if it isn't being displayed already.",
          },
          {
            id: 'unmaximize',
            name: 'unmaximize',
            description: 'Unmaximizes the window.',
          },
          {
            id: 'minimize',
            name: 'minimize',
            description:
              'Minimizes the window. On some platforms the minimized window will be shown in the Dock.',
          },
          {
            id: 'restore',
            name: 'restore',
            description:
              'Restores the window from minimized state to its previous state.',
          },
          {
            id: 'focus',
            name: 'focus',
            description: 'Focuses on the window.',
          },
          {
            id: 'blur',
            name: 'blur',
            description: 'Removes focus from the window.',
          },
        ]
          .map((action) => {
            return {
              id: action.id,
              name: action.name,
              description: action.description,
            };
          })
          .filter((action) => {
            return this.matchesNameOrDescription(action, query);
          });
      }
    );
  }

  registerActionWebAppExecuteCode() {
    const action = this.homey.flow.getActionCard('action_web_app_execute_code');

    action.registerRunListener(async (args, state) => {
      const { device, code } = args;

      return new Promise((resolve, reject) => {
        device.socket.volatile.emit(
          IO_EMIT.WEB_APP_EXECUTE_CODE_RUN,
          { code },
          (error, result) => {
            if (error) {
              this.error(error);
              reject(error);
            } else {
              this.log(result);
              resolve(true);
            }
          }
        );
      });
    });
  }

  registerActionWindowMove() {
    const action = this.homey.flow.getActionCard('action_window_move');

    action.registerRunListener(async (args, state) => {
      const { device, window, screen } = args;

      return new Promise((resolve, reject) => {
        device.socket.volatile.emit(
          IO_EMIT.WINDOW_MOVE_RUN,
          { window, screen },
          (error) => {
            if (error) {
              this.error(error);
              reject(error);
            } else {
              resolve(true);
            }
          }
        );
      });
    });

    action.registerArgumentAutocompleteListener(
      'window',
      async (query, args) => {
        return [
          {
            id: 'main',
            name: 'Main',
            description: 'The main app window.',
          },
          {
            id: 'overlay',
            name: 'Overlay',
            description: 'The overlay window.',
          },
          {
            id: 'web_app',
            name: 'Web App',
            description: 'The web app window.',
          },
        ]
          .map((window) => {
            return {
              id: window.id,
              name: window.name,
              description: window.description,
            };
          })
          .filter((window) => {
            return this.matchesNameOrDescription(window, query);
          });
      }
    );

    action.registerArgumentAutocompleteListener(
      'screen',
      async (query, args) => {
        return new Promise((resolve, reject) => {
          let timeoutRejected = false;
          const callback = (error, data) => {
            if (timeoutRejected === true) return;

            if (error != null) {
              reject(error);
              return;
            }

            if (data != null && data.screens != null) {
              const filtered = data.screens
                .map((screen) => {
                  return {
                    id: String(screen.id),
                    name: `${screen.id} (${screen.size.width}x${screen.size.height})`,
                    description: `x : ${screen.bounds.x}, y: ${screen.bounds.y}`,
                  };
                })
                .filter((action) => {
                  return this.matchesNameOrDescription(action, query);
                });

              resolve(filtered);
            }
          };

          this.homey.setTimeout(() => {
            timeoutRejected = true;
            reject(new Error('timeout'));
          }, 10000);
          args.device.socket.volatile.emit(IO_EMIT.SCREENS_FETCH, {}, callback);
        });
      }
    );
  }

  registerActionDisplaySet() {
    const action = this.homey.flow.getActionCard('action_display_set');

    action.registerRunListener(async (args, state) => {
      const { device, display, text } = args;

      return new Promise((resolve, reject) => {
        device.socket.volatile.emit(
          IO_EMIT.DISPLAY_SET_RUN,
          { display, text },
          (error) => {
            if (error) {
              this.error(error);
              reject(error);
            } else {
              resolve(true);
            }
          }
        );
      });
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
  }

  matchesNameOrDescription(value, query) {
    return (
      value.name.toLowerCase().includes(query.toLowerCase()) ||
      value.description.toLowerCase().includes(query.toLowerCase())
    );
  }
}

module.exports = DesktopDriver;
