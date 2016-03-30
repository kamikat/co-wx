var util = require('util');

function WxError (msg) {
  Error.call(this, msg);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.statusCode = 500;
}

util.inherits(WxError, Error);

function WxAPIError (msg, body) {
  WxError.call(this, `${msg} (${body.errcode}: ${body.errmsg})`);
  this.body = body;
  this.statusCode = 503;
};

util.inherits(WxAPIError, WxError);

function WxSignatureError (msg) {
  WxError.call(this, msg);
  this.statusCode = 403;
}

util.inherits(WxSignatureError, WxError);

function WxParserError (msg) {
  WxError.call(this, msg);
  this.statusCode = 400;
}

util.inherits(WxParserError, WxError);

function middleware (err, req, res, next) {
  if (err instanceof WxError) {
    return res.status(err.statusCode).send(err.message);
  }
  return next(err);
}

module.exports = { middleware, WxError, WxAPIError, WxParserError };
