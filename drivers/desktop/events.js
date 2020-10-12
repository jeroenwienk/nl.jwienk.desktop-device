const IO_EMIT = {
  BROWSER_OPEN_RUN: 'browser:open:run',
  PATH_OPEN_RUN: 'path:open:run',
  BUTTON_RUN_SUCCESS: 'button:run:success',
  BUTTON_RUN_ERROR: 'button:run:error',
  NOTIFICATION_SHOW_RUN: 'notification:show:run',
  FLOW_BUTTON_SAVED: 'flow:button:saved'
};

const IO_ON = {
  BUTTONS_SYNC: 'buttons:sync',
  BUTTON_RUN: 'button:run',
  COMMANDS_SYNC: 'commands:sync'
};


module.exports = {
  IO_EMIT,
  IO_ON
}