function getBrokenButtons(buttons, flows, device) {
  const filteredFlows = Object.values(flows).filter((flow) => {
    return (
      flow.trigger &&
      flow.trigger.id === "trigger_button" &&
      flow.trigger.uri === `homey:device:${device.apiId}`
    );
  });

  return filteredFlows.reduce((accumulator, flow) => {
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
          button: button,
        });
        return accumulator;
      }

      // there is a flow with a unknown button
      if (button == null) {
        accumulator.push({
          flow: flow,
          button: null,
        });
        return accumulator;
      }
    }
    return accumulator;
  }, []);
}

function getBrokenAccelerators(accelerators, flows, device) {
  const filteredFlows = Object.values(flows).filter((flow) => {
    return (
      flow.trigger &&
      flow.trigger.id === "trigger_accelerator" &&
      flow.trigger.uri === `homey:device:${device.apiId}`
    );
  });

  return filteredFlows.reduce((accumulator, flow) => {
    if (flow.trigger.args.accelerator) {
      const accelerator = accelerators.find((accelerator) => {
        return flow.trigger.args.accelerator.id === accelerator.id;
      });

      // keys doesnt match
      if (
        accelerator &&
        accelerator.keys !== flow.trigger.args.accelerator.name
      ) {
        accumulator.push({
          flow: flow,
          accelerator: accelerator,
        });
        return accumulator;
      }

      // there is a flow with a unknown button
      if (accelerator == null) {
        accumulator.push({
          flow: flow,
          accelerator: null,
        });
        return accumulator;
      }
    }
    return accumulator;
  }, []);
}

function getBrokenDisplays(displays, flows, device) {
  const filteredFlows = Object.values(flows).filter((flow) => {
    return (
      flow.actions &&
      flow.actions.some(
        (action) =>
          action.id === "action_display_set" &&
          action.uri === `homey:device:${device.apiId}`
      )
    );
  });

  return filteredFlows.reduce((accumulator, flow) => {
    const actions = flow.actions.filter((action) => {
      return (
        action.args.display != null &&
        action.uri === `homey:device:${device.apiId}`
      );
    });

    actions.forEach((action) => {
      const display = displays.find((display) => {
        return action.args.display.id === display.id;
      });

      // either name or description doesnt match
      if (
        display &&
        (display.name !== action.args.display.name ||
          display.description !== action.args.display.description)
      ) {
        accumulator.push({
          flow: flow,
          display: display,
          action: action,
        });
      }

      // there is a flow with a unknown button
      if (display == null) {
        accumulator.push({
          flow: flow,
          display: null,
          action: action,
        });
      }
    });
    return accumulator;
  }, []);
}

function getBrokenInputs(inputs, flows, device) {
  // const filteredFlows = Object.values(flows).filter((flow) => {
  //   return flow.actions && flow.actions.some((action) => action.id === 'action_display_set'
  //     && action.uri === `homey:device:${device.apiId}`);
  // });
  //
  // return filteredFlows.reduce((accumulator, flow) => {
  //
  //   const actions = flow.actions.filter((action) => {
  //     return action.args.display != null && action.uri === `homey:device:${device.apiId}`;
  //   });
  //
  //   actions.forEach((action) => {
  //     const display = inputs.find((display) => {
  //       return action.args.display.id === display.id;
  //     });
  //
  //     // either name or description doesnt match
  //     if (
  //       display &&
  //       (display.name !== action.args.display.name ||
  //         display.description !== action.args.display.description)
  //     ) {
  //       accumulator.push({
  //         flow: flow,
  //         display: display,
  //         action: action
  //       });
  //     }
  //
  //     // there is a flow with a unknown button
  //     if (display == null) {
  //       accumulator.push({
  //         flow: flow,
  //         display: null,
  //         action: action
  //       });
  //
  //     }
  //   });
  //   return accumulator;
  // }, []);

  return [];
}

module.exports = {
  getBrokenButtons,
  getBrokenAccelerators,
  getBrokenDisplays,
  getBrokenInputs
};