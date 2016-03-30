var crypto = require('crypto');

module.exports = {

  sha1sum: function (data) {
    return crypto.createHash('sha1').update(data).digest('hex');
  },

  getNonceStr: function (length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

};
