co-wx
-----

Yet another WeChat toolkit in generator style.

Installation
------------

    npm install --save co-wx

BodyParser
----------

A connect style request body parser,
checks signature of message and parses WeChat message body to `req.body`;

    var WxParser = require('co-wx/parser');

    app.all('/robot', WxParser('<signature-token>'), function (req, res, next) {
      var msgType = req.body['MsgType'];
      switch (msgType) {
        case 'event':
          var eventType = req.body['Event']; // => [ 'subscribe' | 'SCAN' | 'LOCATION' | 'CLICK' | 'VIEW' | 'unsubscribe' ]
          // ...
          return res.reply({
            MsgType: 'text',
            Content: 'No comment'
          });
        break;
        case 'text':
          // ...
        break;
      }
      return res.status(200).send(); // Stuffy sound made big money o-o
    });

Use `res.reply` will reply a xml document described as [official documentation](https://mp.weixin.qq.com/wiki/14/89b871b5466b19b3efa4ada8e577d45e.html).
`FromUserName` and `ToUserName` in the reply object defaults to the value of `ToUserName` and `FromUserName` from the incoming message. And a `CreateTime` record will be generated automatically in the xml document.

Platform API
------------

    var WxAPIProvider = require('co-wx/api');

    var wxApi = new WxAPIProvider({
      appId: '<your-app-id>',
      secret: '<and-the-secret>'
    });

**Retrieve information of specific subscriber**

    var co = require('co');

    co(function* () {
      var subscriberInfo = yield wxApi.getSubscriberInfo('<open-id>');
      // => { openId, unionId, nickname, gender, photo, country, province, city, lang }
    })
    .then(function () { /* ... */ });

Use with a `co-router`

    var Router = require('co-router');

    var router = Router();

    router.get('/user/:openId', function* (req, res, next) {
      return res.status(200).send(yield wxApi.getSubscriberInfo(req.params.openId));
    });

    app.use('/some-prefix', router);

**Sending a service template message to subscriber**

    yield wxApi.sendTemplateMessageToSubscriber('<template-id>', openId, url, {
      /* template data */
    });

**Create a temporary scene based QRCode**

    var ticket = yield wxApi.createTemporaryQrCode(sceneId, expiresIn);

`expiresIn` parameter is optional and defaults to maximum value of 7 days.
returns a ticket object contains QRCode ticket and url data.

**JSSDK parameter API for `wx.config`** (use `co-router`)

    router.get('/config', function* (req, res, next) {
      return res.status(200).send(yield req.wx.getJsApiConfig(req.query.url || req.get('Referer')));
    });

Debug
-----

Start with `DEBUG` variable set to `wx:*` should turn on debug output of the module.

    DEBUG=wx:* npm start

Roadmap
-------

- [x] Basic message handling
- [ ] Support AES message security mode
- [ ] Support customer service account interface
- [x] Support service template message
- [ ] Message broadcast
- [ ] Media management
- [ ] Menu management
- [ ] Subscriber group/tag management
- [x] Support OAuth 2.0
- [x] Generate scene based QRCode
- [x] Generate JS-SDK config
- [ ] URL shortener
- [ ] Statistics API
- [ ] Koa-compatible middleware
- [ ] ...

Contribution
------------

The module is developed and used in some of my personal works.
I may not implement a full set of APIs described in WeChat documentation.
Feel free to open an issue for any feature request or contribution.
I'll pick them up in my spare time :-)

License
-------

(The MIT License)

