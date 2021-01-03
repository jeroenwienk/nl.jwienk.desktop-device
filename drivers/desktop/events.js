const IO_ON = {
  BUTTONS_SYNC: 'buttons:sync',
  BUTTON_RUN: 'button:run',
  ACCELERATORS_SYNC: 'accelerators:sync',
  ACCELERATOR_RUN: 'accelerator:run',
  DISPLAYS_SYNC: 'displays:sync'
};

const IO_EMIT = {
  BROWSER_OPEN_RUN: 'browser:open:run',
  PATH_OPEN_RUN: 'path:open:run',
  COMMAND_RUN: 'command:run',
  BUTTON_RUN_SUCCESS: 'button:run:success',
  BUTTON_RUN_ERROR: 'button:run:error',
  ACCELERATOR_RUN_SUCCESS: 'accelerator:run:success',
  ACCELERATOR_RUN_ERROR: 'accelerator:run:error',
  NOTIFICATION_SHOW_RUN: 'notification:show:run',
  FLOW_BUTTON_SAVED: 'flow:button:saved',
  FLOW_ACCELERATOR_SAVED: 'flow:accelerator:saved',
  DISPLAY_SET_RUN: 'display:set:run'
};


module.exports = {
  IO_EMIT,
  IO_ON
};