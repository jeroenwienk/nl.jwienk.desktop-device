'use strict';

const Homey = require('homey');
const { HomeyAPI } = require('athom-api');

console.log(process.env.DEBUG);
if (process.env.DEBUG === '1') {
  require('inspector').open(9229, '0.0.0.0', false);
}

class App extends Homey.App {
  async onInit() {
    this.log('app:onInit');

    await this.initHomeyApi();
  }

  async initHomeyApi() {
    this.homeyAPI = await HomeyAPI.forCurrentHomey(this.homey);
    this.homeyAPISession = await this.homeyAPI.sessions.getSessionMe();

    this.systemName = await this.homeyAPI.system.getSystemName();
    this.systemInfo = await this.homeyAPI.system.getInfo();
  }
}

module.exports = App;
