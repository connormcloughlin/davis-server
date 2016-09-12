'use strict';

const ConversationService = require('../../../services/ConversationService'),
    logger = require('../../../utils/logger'),
    Davis = require('../../../core'),
    BbPromise = require('bluebird'),
    _ = require('lodash');

const REQUEST_SOURCE = 'web';


module.exports = function WebService(config) {
    
    /**
     * Responds to web using the exchange generated by Davis
     * @param {Object} davis - The fully processed Davis object.
     * @returns {Object} response - The response formatted how web expects.
     */
    function formatResponse(davis) {
        //ToDo Add support for cards.
        logger.info('Generating the response for web');
        
        if (davis.exchange.response.audible.ssml) {
            davis.exchange.response.visual.text = davis.exchange.response.audible.ssml.replace(/(<([^>]+)>)/ig, "").trim();
        }

        return {
            response: {
                shouldEndSession: _.get(davis, 'exchange.response.finished', true),
                text: davis.exchange.response.visual.text,
                card: davis.exchange.response.visual.card,
                hyperlink: davis.exchange.response.visual.hyperlink,
                ssml: '<speak>' + davis.exchange.response.audible.ssml + '</speak>'
            }
        };
    }

    return {
        /**
         * Interacts with Davis via web
         * @param {Object} req - The request received from web.
         * @returns {promise} res - The response formatted for web.
         */
        askDavis: (req) => {
            logger.info('Starting our interaction with Davis');
            
            return new BbPromise((resolve, reject) => {

                // Use web user token as id for Davis user 
                let user = {
                    'id': `web-user-${req.body.use}`,
                    'nlp': config.nlp,
                    'dynatrace': config.web.dynatrace,
                    'timezone': req.body.timezone
                };
                
                // Starts or continues our conversation
                ConversationService.getConversation(user)
                    .then(conversation => {
                        let davis = new Davis(user, conversation, config);
                        return davis.interact(req.body.request, REQUEST_SOURCE);
                    })
                    .then(davis => {
                        logger.info('Finished processing request');
                        return resolve(formatResponse(davis));
                    })
                    .catch(err => {
                        logger.error(`Unfortunately, something went wrong.  ${err.message}`);
                        return reject(err.message);
                    });
            });
        }
    };
};