// Generated by CoffeeScript 1.6.2
(function() {
  var PluginManager, UrlDetector, bot, config, irc, package_info, util;

  process.stdin.resume();

  process.on('SIGINT', function() {
    return bot.disconnect("Ctrl+C from console.", process.exit);
  });

  console.log("Stating bot");

  util = require('util');

  irc = require("irc");

  config = require('../config');

  package_info = require('../package');

  UrlDetector = require('./url_detector');

  PluginManager = require('./plugins');

  bot = new irc.Client(config.server, config.nick, {
    channels: config.channels,
    password: config.password,
    userName: config.username,
    realName: config.realname,
    debug: true
  });

  bot.commandList = {};

  bot.addListener("message", function(who, channel, message) {
    var args, command, url;

    console.log("" + who + " => " + channel + ": " + message);
    if (0 === message.indexOf(config.trigger)) {
      args = message.split(" ");
      command = args.shift().substr(config.trigger.length);
      bot.emit("command", channel, who, command, args);
      if (bot.commandList[command]) {
        return bot.emit("command_" + command, channel, who, args);
      } else {
        return bot.emit("missing_command", channel, who, command, args);
      }
    } else if (url = UrlDetector.has_url(message)) {
      if (!bot.emit("message_with_url:" + url.host, channel, who, message, url)) {
        return bot.emit("message_with_url", channel, who, message, url);
      }
    }
  });

  bot.addMissingCommandHandler = function(callback) {
    if (this.missingCommandHanlder) {
      return false;
    }
    this.missingCommandHanlder = callback;
    bot.addListener("missing_command", this.missingCommandHanlder);
    return true;
  };

  bot.removeMissingCommandHandler = function() {
    if (!this.missingCommandHanlder) {
      return false;
    }
    bot.removeListener("missing_command", this.missingCommandHanlder);
    this.missingCommandHanlder = null;
    return true;
  };

  bot.addCommand = function(command, callback) {
    if (this.commandList[command]) {
      return false;
    }
    this.commandList[command] = callback;
    this.addListener("command_" + command, callback);
    return true;
  };

  bot.removeCommand = function(command) {
    if (!this.commandList[command]) {
      return false;
    }
    this.removeListener("command_" + command, this.commandList[command]);
    delete this.commandList[command];
    return true;
  };

  bot.start = function() {
    var _this = this;

    this.addCommand("reload-plugins", function(channel, who, args) {
      if (who === "epochwolf") {
        _this.say(channel, "Okay.");
        _this.plugins.__rescan();
        return _this.say(channel, "Done.");
      } else {
        return _this.say(channel, "Nope.");
      }
    });
    return this.plugins = new PluginManager(bot, config);
  };

  bot.start();

}).call(this);
