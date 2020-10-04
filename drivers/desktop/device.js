'use strict';

const Homey = require('homey');
const io = require('socket.io-client');

class DesktopDriver extends Homey.Device {
  onInit() {
    this.log('device:onInit');
    const data = this.getData();

    this.socket = io(`http://${data.address}:${data.port}`, {
      path: '/desktop',
    });

    this.socket.on('connect', () => {
      console.log('connect:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('disconnect:', reason);
    });

    this.socket.on('error', (error) => {
      console.log('error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.log('connect_error:', error);
    });

    this.socket.on('connect_timeout', (timeout) => {
      console.log('connect_error:', timeout);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('reconnect:', attemptNumber);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('reconnect_attempt:', attemptNumber);
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log('reconnecting:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.log('reconnect_error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('reconnect_failed:', error);
    });

    this.socket.on('init:commands', (data) => {
      console.log('init:commands:', data);
      this.commands = data.commands;
    });
  }

  ready() {
    this.log('device:ready');
    this.setAvailable();
  }

  // onDiscoveryResult(discoveryResult) {
  //   this.log('device:onDiscoveryResult');
  //   this.log('discoveryResult.id', discoveryResult.id);
  //   this.log('this.getData().id', this.getData().id);
  //   // Return a truthy value here if the discovery result matches your device.
  //   return discoveryResult.id === this.getData().id;
  // }
  //
  // async onDiscoveryAvailable(discoveryResult) {
  //   this.log('device:onDiscoveryAvailable');
  //
  //   // This method will be executed once when the device has been found (onDiscoveryResult returned true)
  //   // this.api = new MyDeviceAPI(discoveryResult.address);
  //   // await this.api.connect(); // When this throws, the device will become unavailable.
  //
  //
  //   const data = this.getData();
  //
  //
  //   console.log(data);
  // }
  //
  // onDiscoveryAddressChanged(discoveryResult) {
  //   this.log('device:onDiscoveryAddressChanged');
  //   // Update your connection details here, reconnect when the device is offline
  // }
  //
  // onDiscoveryLastSeenChanged(discoveryResult) {
  //   this.log('device:onDiscoveryLastSeenChanged');
  //   // When the device is offline, try to reconnect here
  // }
}

module.exports = DesktopDriver;
