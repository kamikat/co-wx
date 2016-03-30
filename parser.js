var buildBody = require('raw-body');
var mediaType = require('media-typer');

var sha1sum = require('./util').sha1sum;
var XML = require('./xml');

var error = require('./error');
var WxParserError = error.WxParserError;
var WxSignatureError = error.WxSignatureError;

var _debug = require('debug')('wx:parser');

module.exports = function (token) {
  return function (req, res, next) {

    if (req.query.signature !== sha1sum([ token, req.query.nonce, req.query.timestamp ].sort().join(''))) {
      return next(new WxSignatureError('signature mismatch'));
    }

    if (req.method === 'GET') {

      _debug('process validation request.');
      return res.status(200).send(req.query.echostr);

    } else if (req.method === 'POST' && req.get('content-type') === 'text/xml') {

      _debug('process bussiness request.');
      buildBody(req, {
        length: req.headers['content-length'],
        encoding: mediaType.parse(req.headers['content-type']).parameters.charset
      }, function (err, raw) {
        if (err) return next(err);
        XML.fromString(raw, function (err, data) {
          if (err) return next(err);
          _debug(`parsed ${JSON.stringify(data)}`);
          req.body = data;
          return next();
        });
      });

      // method: res.reply([Object])
      res.reply = function (body) {
        _debug(`reply ${JSON.stringify(body)}`);
        var xml = XML.toString({
          xml: Object.assign({
            FromUserName: body['FromUserName'] || req.body['ToUserName'],
            ToUserName: body['ToUserName'] || req.body['FromUserName'],
            CreateTime: parseInt(Date.now() / 1000)
          }, body)
        });
        return res.status(200).send(xml);
      };

    } else {

      return next();

    }
  };
};
