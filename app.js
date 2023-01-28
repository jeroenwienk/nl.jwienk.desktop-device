'use strict';

const Homey = require('homey');
const { HomeyAPIApp } = require('homey-api');

// if (process.env.DEBUG === '1') {
//   require('inspector').open(9229, '0.0.0.0', false);
// }

class App extends Homey.App {
  async onInit() {
    this.log('app:onInit');

    await this.initHomeyApi();
  }

  async initHomeyApi() {
    this.homeyAPI = new HomeyAPIApp({
      homey: this.homey,
    });
  
    await this.homeyAPI.login();
    this.systemName = await this.homeyAPI.system.getSystemName();
    this.systemInfo = await this.homeyAPI.system.getInfo();
  }
}

module.exports = App;
