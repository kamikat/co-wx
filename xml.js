var xml2js = require('xml2js');

var builder = new xml2js.Builder({
  cdata    : true,
  headless : true,
  allowSurrogateChars: true,
  renderOpts: { pretty: false }
});

module.exports = {

  fromString: function (xmlString, callback) {
    xml2js.parseString(xmlString, {
      explicitArray: false,
      explicitRoot: false
    }, callback);
  },

  toString: function (obj) {
    return builder.buildObject(obj);
  }

}
