var saml = require('passport-saml/lib/passport-saml/saml');

exports.register = function (server, options, next) {
    this.saml = new saml.SAML(options.saml);
    this.path = options['path'];
    this.successAction = options['success'];
    if (!this.path) {
        this.path = '/sso/saml/';
    }

    var samlController = require('./lib/controllers/saml')(server, this.saml, this.successAction);

    server.route({
        method: 'GET',
        path: this.path + 'metadata.xml',
        handler: samlController.metadata
    });

    server.route({
      method: 'GET',
      path: this.path + 'login',
      handler: samlController.login
    });

    server.route({
      method: 'POST',
      path: this.path + 'assert',
      handler: samlController.assert
    });

    server.route({
      method: 'GET',
      path: this.path + 'logout',
      handler: samlController.logout
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};