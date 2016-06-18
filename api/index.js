function WxAPIProvider (config) {
  this.appId = config.appId
  this.secret = config.secret
  this.openIdAuthTimeout = config.openIdAuthTimeout || 1800;
  this.store = config.store || (function () {
    var _store = {};
    return {
      set: function (key, expiresIn, val) { // => Promise
        _store[key] = { expiredAt: Date.now() + expiresIn * 1000, value: val};
        return Promise.resolve();
      },
      get: function (key) { // => Promise
        var pair = _store[key];
        if (pair && pair.expiredAt < Date.now()) {
          return Promise.resolve(_store[key]);
        } else {
          if (pair) {
            delete _store[key];
          }
          return Promise.resolve();
        }
      }
    };
  })();
}

WxAPIProvider.extend = function (obj) {
  Object.assign(WxAPIProvider.prototype, obj);
}

WxAPIProvider.extend(require('./platform'));
WxAPIProvider.extend(require('./jsapi'));
WxAPIProvider.extend(require('./snsapi'));
WxAPIProvider.extend(require('./iot'));

module.exports = WxAPIProvider;
