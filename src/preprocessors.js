var _ = require('lodash');

module.exports.OAuthRequestPreProcessor = function() {

  this.process = function(config, context) {
    if (!config.auth) {
      throw new Error('Authorization scheme was not defined');
    }

    if (config.auth.type != 'oauth') {
      throw new Error('Authentication type should be set to "oauth"');
    }

//    var consumerKey = config.auth.consumerKey
  }
}

module.exports.SourceConfigPreprocessor = function() {

  this.process = function(config, context) {
    var newConfig = _.cloneDeep(config);
    var newContext = _.cloneDeep(context);

    if (!config.url) {
      throw new Error('URL is a mandatory field');
    }

    function validMethod(method) {
      return _.contains(['POST', 'GET'], method.toUpperCase());
    }

    if (!config.method) {
      newConfig.method = 'GET';

    } else if (!validMethod(config.method)) {
      throw new Error('Invalid method: ' + config.method)
    }

    return {config: newConfig, context: newContext};
  }
}

module.exports.TargetConfigPreprocessor = function() {

  this.process = function(config, context) {
    var newConfig = _.cloneDeep(config);
    var newContext = _.cloneDeep(context);

    if (!config.url) {
      throw new Error('URL is a mandatory field');
    }

    function validMethod(method) {
      return _.contains(['POST', 'GET'], method.toUpperCase());
    }

    if (!config.method) {
      newConfig.method = 'POST';

    } else if (!validMethod(config.method)) {
      throw new Error('Invalid method: ' + config.method)
    }

    return {config: newConfig, context: newContext};
  }
}

