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

Initialization

    var WxAPIProvider = require('co-wx/api');

    var wxApi = new WxAPIProvider({
      appId: '<your-app-id>',
      secret: '<and-the-secret>'
    });

Retrieve information of specific subscriber

    var co = require('co');

    co(function* () {
      var subscriberInfo = yield wxApi.getSubscriberInfo('<open-id>');
      // => { openId, unionId, nickname, gender, photo, country, province, city, lang }
    })
    .then(function () { /* ... */ });

**Good night... more examples tomorrow**

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

