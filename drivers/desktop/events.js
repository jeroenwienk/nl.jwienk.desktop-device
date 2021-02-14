const IO_ON = {
  BUTTONS_SYNC: 'buttons:sync',
  BUTTON_RUN: 'button:run',
  ACCELERATORS_SYNC: 'accelerators:sync',
  ACCELERATOR_RUN: 'accelerator:run',
  DISPLAYS_SYNC: 'displays:sync',
  INPUTS_SYNC: 'inputs:sync',
  INPUT_RUN: 'input:run',
};

const IO_EMIT = {
  BROWSER_OPEN_RUN: 'browser:open:run',
  PATH_OPEN_RUN: 'path:open:run',
  COMMAND_RUN: 'command:run',
  BUTTON_RUN_SUCCESS: 'button:run:success',
  BUTTON_RUN_ERROR: 'button:run:error',
  FLOW_BUTTON_SAVED: 'flow:button:saved',
  ACCELERATOR_RUN_SUCCESS: 'accelerator:run:success',
  ACCELERATOR_RUN_ERROR: 'accelerator:run:error',
  FLOW_ACCELERATOR_SAVED: 'flow:accelerator:saved',
  NOTIFICATION_SHOW_RUN: 'notification:show:run',
  DISPLAY_SET_RUN: 'display:set:run',
  FLOW_DISPLAY_SAVED: 'flow:display:saved',
  INPUT_RUN_SUCCESS: 'input:run:success',
  INPUT_RUN_ERROR: 'input:run:error',
  FLOW_INPUT_SAVED: 'flow:input:saved',
};


module.exports = {
  IO_EMIT,
  IO_ON
};