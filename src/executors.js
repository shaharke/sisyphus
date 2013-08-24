var q = require('q');
var pre = require('./preprocessors');

var RequestExecutor = function () {

  this.execute = function (config, context) {

    // Init as empty if not passed
    context = context || {};

    var json = config.json || false;

    var query = context.query;
    var body = context.body;
    var headers = context.headers;

    var client = require('request');

    var options = {};
    options.url = config.url;
    options.method = config.method;
    options.qs = query;
    options.body = body;
    options.headers = headers;
    options.json = json || undefined;

    var request = q.defer();


    client(options, function (err, response, body) {
      if (err) {
        request.reject(new Error(err));
        return;
      }

      if (response.statusCode >= 400 && response.statusCode < 500) {
        request.reject(new Error("client error: " + response.statusCode));
        return;
      }

      if (response.statusCode >= 500) {
        request.reject(new Error("server error: " + response.statusCode));
        return;
      }

      var targetContext = {};
      targetContext.body = body;
      request.resolve(targetContext)

    });

    return request.promise;

  }
}

module.exports.JobExecutor = function (config) {

  this.config = config;

  this.processors = {
    source: {
      pre: [pre.SourceConfigPreprocessor],
      post: []
    },
    target: {
      pre: [pre.TargetConfigPreprocessor],
      post: []
    }
  }

  this.execute = function () {
    var self = this;

    var sourceExecutor = new RequestExecutor();

    var preprocessed = process(this.config.source, {}, this.processors.source.pre);
    var response = sourceExecutor.execute(preprocessed.config);
    return response.then(function(context) {
      var targetExecutor = new RequestExecutor();
      var preprocessed = process(self.config.target, context, self.processors.target.pre);
      return targetExecutor.execute(preprocessed.config, preprocessed.context);
    })

  }

  var process = function(config, context, processors) {
    processors.forEach(function(processorClass) {
      var result = new processorClass().process(config, context);
      config = result.config;
      context = result.context;
    })

    return {config: config, context: context};
  }
}
