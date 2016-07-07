'use strict';

const express = require('express'),
    router = express.Router(),
    AlexaService = require('../services/AlexaService'),
    logger = require('../../../utils/logger');


router.post('/', function(req, res) {
    logger.info('Recieved a request from Alexa!');

    //ToDo: Check that the request is from Amazon
    AlexaService.askDavis(req)
    .then(response => {
        logger.info('Sending a response back to the Alexa service');
        res.json(response);
    });
});

module.exports  = router;