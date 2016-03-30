var _debug = require('debug')('wx:api:platform');

var WxAPIError = require('../error').WxAPIError;

var http = require('axios');

module.exports = {

  getAccessToken: function* () {
    var cacheKey = `wx:access_token:${this.appId}`;
    var accessToken = yield this.store.get(cacheKey);
    if (!accessToken) {
      _debug('cached access token not found.');
      var res = yield http({
        method : 'GET',
        url    : 'https://api.weixin.qq.com/cgi-bin/token',
        params : {
          appid      : this.appId,
          secret     : this.secret,
          grant_type : 'client_credential'
        }
      });
      if (res.data.errcode) {
        throw new WxAPIError('Cannot obtain application credential', res.data);
      }
      accessToken = res.data.access_token;
      yield this.store.set(cacheKey, +res.data.expires_in / 2, accessToken);
      _debug('access token cached.');
    }
    _debug(`accessToken: "${accessToken}"`);
    return accessToken;
  },

  getSubscriberInfo: function* (openId) {
    _debug(`getSubscriberInfo ${openId}`);
    var res = yield http({
      method : 'GET',
      url    : 'https://api.weixin.qq.com/cgi-bin/user/info',
      params : {
        access_token : yield this.getAccessToken(),
        openid       : openId,
        lang         : 'zh_CN'
      }
    });
    if (res.data.errcode) {
      throw new WxAPIError('failed to obtain user information.', res.data);
    }
    var data = {
      openId   : res.data.openid,
      unionId  : res.data.unionid,
      nickname : res.data.nickname,
      gender   : res.data.sex === 1 ? 'male' : 'female',
      photo    : res.data.headimgurl,
      country  : res.data.country,
      province : res.data.province,
      city     : res.data.city,
      lang     : res.data.language
    };
    _debug(`getSubscriberInfo ${openId} => ${JSON.stringify(data)}`);
    return data;
  },

  openMediaStream: function* (mediaId) {
    var accessToken = yield this.getAccessToken();
    return yield new Promise(function (resolve, reject) {
      require('http').get(`http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=${accessToken}&media_id=${mediaId}`, function(res) {
        if (res.statusCode !== 200) reject(new Error(`HTTP ${res.statusCode} (${res.statusMessage})`));
        else resolve(res);
      });
    });
  },

  createTemporaryQrCode: function* (sceneId, expiration) {
    _debug(`createTemporaryQrCode ${sceneId} ${expiration}`);
    var res = yield http({
      method : 'POST',
      url    : 'https://api.weixin.qq.com/cgi-bin/qrcode/create',
      params : {
        access_token : yield this.getAccessToken(),
      },
      data: {
        "expire_seconds": expiration || 2592000,
        "action_name": "QR_SCENE",
        "action_info": {
          "scene": { "scene_id": sceneId }
        }
      }
    });
    if (res.data.errcode) {
      throw new WxAPIError('failed to obtain user information.', res.data);
    }
    var data = {
      expiresIn : res.data.expire_seconds,
      ticket    : res.data.ticket,
      url       : res.data.url
    };
    _debug(`createTemporaryQrCode ${sceneId} ${expiration} => ${JSON.stringify(data)}`);
    return data;
  },

  sendTemplateMessageToSubscriber: function* (templateId, openId, url, data) {
    _debug(`sendTemplateMessageToSubscriber ${templateId} ${openId} ${url} {...}`);
    var res = yield http({
      method : 'POST',
      url    : 'https://api.weixin.qq.com/cgi-bin/message/template/send',
      params : {
        access_token : yield this.getAccessToken(),
      },
      data: {
        touser: openId,
        template_id: templateId,
        url: url,
        data: _.mapValues(data, (value) => ({ value: value, color: '#000000' }))
      }
    });
    if (res.data.errcode) {
      throw new WxAPIError('failed to obtain user information.', res.data);
    }
    _debug(`sendTemplateMessageToSubscriber ${templateId} ${openId} ${url} {...} => :OK`);
  },

};
