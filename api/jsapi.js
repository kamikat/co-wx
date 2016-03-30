var _debug = require('debug')('wx:api:jsapi');

var WxAPIError = require('../error').WxAPIError;

var getNonceStr = require('../util').getNonceStr;
var sha1sum = require('../util').sha1sum;

var getSignatureParams = function (jsapi_ticket, url) {
  var timestamp = parseInt(Date.now() / 1000);
  var nonceStr = getNonceStr(9);
  return {
    timestamp: `${timestamp}`,
    nonceStr: nonceStr,
    signature: sha1sum(`jsapi_ticket=${jsapi_ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`)
  };
}

module.exports = {

  getJsApiTicket: function* () {
    var accessToken = yield this.getAccessToken();
    var cacheKey = `wx:jsapi_ticket:${appId}:${accessToken.slice(0, 10)}`;
    var jsApiTicket = yield this.store.get(cacheKey);
    if (!jsApiTicket) {
      _debug('cached jsapi ticket not found.');
      var res = yield http({
        method : 'GET',
        url    : 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
        params : {
          access_token : accessToken,
          type         : 'jsapi'
        }
      });
      if (res.data.errcode) {
        throw new WxAPIError('failed to obtain WeChat JavaScript API Ticket.', res.data);
      }
      jsApiTicket = res.data.ticket;
      yield this.store.set(cacheKey, +res.data.expires_in / 2, jsApiTicket);
      _debug('jsapi ticket cached.');
    }
    _debug(`jsApiTicket: ${jsApiTicket}`);
    return jsApiTicket;
  },

  getJsApiConfig: function* (url) {
    var jsApiTicket = yield this.getJsApiTicket();
    return Object.assign({
      url   : url,
      appId : appId
    }, getSignatureParams(jsApiTicket, url));
  },

};
