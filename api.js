module.exports = {
  async addSomething({ homey, body }) {
    // access the post body and perform some action on it.
    return 'addSomething';
  },
  async getSomething({ homey, body }) {
    // access the post body and perform some action on it.
    return 'getSomething';
  }
};