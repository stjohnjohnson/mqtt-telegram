/*jslint node: true */
'use strict';

var winston = require('winston'),
    path = require('path'),
    fs = require('fs'),
    yaml = require('js-yaml'),
    async = require('async'),
    mqtt = require('mqtt'),
    TelegramBotAPI = require('node-telegram-bot-api');

var CONFIG_DIR = process.env.CONFIG_DIR || process.cwd(),
    CONFIG_FILE = path.join(CONFIG_DIR, 'config.yml'),
    SAMPLE_FILE = path.join(__dirname, '_config.yml'),
    CURRENT_VERSION = require('./package').version;

var config,
    broker,
    bot;

// Show Debug logs in console
winston.level = 'debug';

/**
 * Load user configuration (or create it)
 * @method loadConfiguration
 * @return {Object} Configuration
 */
function loadConfiguration () {
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, fs.readFileSync(SAMPLE_FILE));
    }

    return yaml.safeLoad(fs.readFileSync(CONFIG_FILE));
}

/**
 * Parse incoming message from MQTT
 * @method parseMQTTMessage
 * @param  {String} topic   Topic channel the event came from
 * @param  {String} message Contents of the event
 */
function parseMQTTMessage (topic, message) {
    winston.info('Incoming message from MQTT %s', topic);

    if (message.length === 0) {
        return;
    }
    config.topics[topic].forEach(function (chat_id) {
        winston.info('Forwarding image from %s to %s', topic, chat_id);
        bot.sendPhoto(chat_id, message, {
            disable_notification: true
        });
    });
}

// Main flow
async.series([
    function loadFromDisk (next) {
        winston.info('Starting MQTT Telegram - v%s', CURRENT_VERSION);
        winston.info('Loading configuration');
        config = loadConfiguration();

        process.nextTick(next);
    },
    function connectToMQTT (next) {
        winston.info('Connecting to MQTT at mqtt://%s', config.mqtt.host);
        broker = mqtt.connect('mqtt://' + config.mqtt.host);
        broker.on('connect', function () {
            next();
            // @TODO Not call this twice if we get disconnected
            next = function () {};
        });
        broker.on('message', parseMQTTMessage);
    },
    function setupTelegramBot (next) {
        winston.info('Configuring Telegram');
        bot = new TelegramBotAPI(config.telegram.token);
        bot.getMe().then(function (msg) {
            winston.info('Bot %s initialized', msg.username);
            next();
        })
        .catch(next);
    },
    function beginListening (next) {
        winston.info('Listening to events');

        broker.subscribe(Object.keys(config.topics));
        process.nextTick(next);
    }
], function (error) {
    if (error) {
        return winston.error(error);
    }
    winston.info('Waiting for events');
});
