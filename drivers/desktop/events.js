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
  WINDOW_ACTION_RUN: 'window:action:run',
  WINDOW_MOVE_RUN: 'window:move:run',
  COMMAND_RUN: 'command:run',
  WEB_APP_EXECUTE_CODE_RUN: 'web:app:execute:code:run',
  NOTIFICATION_SHOW_RUN: 'notification:show:run',
  SCREENS_FETCH: 'screens:fetch',
  DISPLAY_SET_RUN: 'display:set:run',
  FLOW_BUTTON_SAVED: 'flow:button:saved',
  FLOW_ACCELERATOR_SAVED: 'flow:accelerator:saved',
  FLOW_DISPLAY_SAVED: 'flow:display:saved',
  FLOW_INPUT_SAVED: 'flow:input:saved',
};

module.exports = {
  IO_EMIT,
  IO_ON,
};
