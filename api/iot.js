var _debug = require('debug')('wx:api:iot');

var WxAPIError = require('../error').WxAPIError;

var http = require('axios');

module.exports = {

  authorizeAirKissDevice: function* (productId, deviceId, macAddress, op) {
    var accessToken = yield this.getAccessToken();
    _debug(`authorizing ${deviceId} using ${macAddress}...`);
    var res = yield http({
      method : 'POST',
      url    : 'https://api.weixin.qq.com/device/authorize_device',
      params : {
        access_token : accessToken,
      },
      data   : {
        "device_num": "1",
        "device_list": [{
          "id": deviceId,
          "mac": macAddress,
          "connect_protocol": "4",
          "close_strategy": "1",
          "conn_strategy": "1"
        }],
        "op_type": op || "0",
        "product_id": productId
      }
    });
    if (res.data.errcode) {
      throw new WxAPIError('failed to authorize device', res.data);
    }
    if (res.data.resp[0].errcode) {
      throw new WxAPIError('failed to authorize device', res.data.resp[0]);
    }
    _debug(`device ${deviceId} authorized.`);
  },

  bindDevice: function* (deviceId, openId) {
    var accessToken = yield this.getAccessToken();
    _debug(`bind ${deviceId} to ${openId}...`);
    var res = yield http({
      method : 'POST',
      url    : 'https://api.weixin.qq.com/device/compel_bind',
      params : { access_token : accessToken },
      data   : {
        "device_id": deviceId,
        "openid": openId
      }
    });
    if (res.data.errcode) {
      throw new WxAPIError('failed to bind device', res.data);
    }
    _debug(`device ${deviceId} bind success.`);
  },

  unbindDevice: function* (deviceId, openId) {
    var accessToken = yield this.getAccessToken();
    _debug(`unbind ${deviceId} from ${openId}...`);
    var res = yield http({
      method : 'POST',
      url    : 'https://api.weixin.qq.com/device/compel_unbind',
      params : { access_token : accessToken },
      data   : {
        "device_id": deviceId,
        "openid": openId
      }
    });
    if (res.data.errcode) {
      throw new WxAPIError('failed to unbind device', res.data);
    }
    _debug(`device ${deviceId} unbind success.`);
  }

};
