'use strict';

const BbPromise = require('bluebird');

class DavisVersion {
  constructor(davis, options) {
    this.davis = davis;
    this.options = options;

    this.intents = {
      davisVersion: {
        usage: 'Davis version',
        phrases: [
          'What version are you?',
          'What version of davis is running?',
        ],
        lifecycleEvents: [
          'davisVersion',
        ],
        clarification: 'I think you were asking what version I am running.',
        regex: /(what|which) version/,
      },
    };

    this.hooks = {
      'davisVersion:davisVersion': this.davisVersion.bind(this),
    };
  }

  davisVersion(exchange) {
    const version = this.davis.version;

    exchange.addContext({ version });

    const templates = this.davis.pluginManager.responseBuilder.getTemplates(this);

    exchange
      .greet()
      .response(templates)
      .smartEnd();
  }
}

module.exports = DavisVersion;
