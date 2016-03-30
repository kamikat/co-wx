var _debug = require('debug')('wx:api:sns');

var WxAPIError = require('../error').WxAPIError;

var qs = require('querystring');

module.exports = {

  createOpenIdAuthEndpoint: function* (redirectUrl, payload) {
    _debug(`createOpenIdAuthEndpoint ${redirectUrl} {...}`);
    var params = {
      appid: this.appId,
      redirect_uri: redirectUrl,
      response_type: 'code',
      scope: 'snsapi_userinfo',
      state: getNonceStr(32),
    };
    yield this.store.set(`wx:sns:auth:state:${params.state}`, this.openIdAuthTimeout, JSON.stringify(payload));
    var endpoint = `https://open.weixin.qq.com/connect/oauth2/authorize?${qs.stringify(params)}#wechat_redirect`;
    _debug(`createOpenIdAuthEndpoint ${redirectUrl} {...} => "${endpoint}"`);
    return endpoint;
  },

  getOpenIdAuthPayload: function* (state) {
    return JSON.parse(yield this.store.get(`wx:sns:auth:state:${state}`));
  },

  getOpenIdCredential: function* (code) {
    _debug(`getOpenIdCredential ${code}`);
    var res = yield http({
      method : 'GET',
      url    : 'https://api.weixin.qq.com/sns/oauth2/access_token',
      params : {
        appid      : appId,
        secret     : secret,
        code       : code,
        grant_type : 'authorization_code'
      }
    });
    if (res.data.errcode) {
      throw new WxAPIError('failed to authorize user.', res.data);
    }
    var data = {
      openId       : res.data.openid,
      unionId      : res.data.unionid,
      accessToken  : res.data.access_token,
      expiresIn    : res.data.expires_in,
      refreshToken : res.data.refresh_token,
      scope        : res.data.scope
    };
    _debug(`getOpenIdCredential ${code} => ${JSON.stringify(data)}`);
    return data;
  },

  getUserInfo: function* (openId, accessToken) {
    _debug(`getUserInfo ${openId} ${accessToken}`);
    var res = yield http({
      method : 'GET',
      url    : 'https://api.weixin.qq.com/sns/userinfo',
      params : {
        access_token : accessToken,
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
    _debug(`getUserInfo ${openId} ${accessToken} => ${JSON.stringify(data)}`);
    return data;
  },

};
