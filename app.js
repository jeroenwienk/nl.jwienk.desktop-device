'use strict';

const Homey = require('homey');

class App extends Homey.App {
  onInit() {
    this.log('app:onInit');
  }
}

module.exports = App;
