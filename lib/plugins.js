// Generated by CoffeeScript 1.6.2
(function() {
  var PluginManager, fs, path, util;

  fs = require('fs');

  path = require('path');

  util = require('util');

  PluginManager = (function() {
    function PluginManager(bot, config) {
      this.bot = bot;
      this.config = config;
      this.plugins = {};
      this.__scan();
    }

    PluginManager.prototype.load = function(name) {
      var callback, callbacks, command, event, plugin, _i, _len, _ref, _ref1;

      if (plugin = this.plugins[name]) {
        console.log("Load Plugin: " + name);
        if (plugin.setup) {
          plugin.setup();
        }
        if (plugin.__missingCommandHandler) {
          this.bot.addMissingCommandHandler(plugin.__missingCommandHandler);
        }
        _ref = plugin.__listeners;
        for (event in _ref) {
          callbacks = _ref[event];
          for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            callback = callbacks[_i];
            this.bot.addListener(event, callback);
          }
        }
        _ref1 = plugin.__commands;
        for (command in _ref1) {
          callback = _ref1[command];
          this.bot.addCommand(command, callback);
        }
        plugin.__loaded = true;
        return true;
      } else {
        console.log("Load Plugin: " + name + " (error, no plugin by this name)");
        return false;
      }
    };

    PluginManager.prototype.unload = function(name, force) {
      var callback, callbacks, command, event, plugin, _i, _len, _ref, _ref1;

      if (force == null) {
        force = true;
      }
      if (plugin = this.plugins[name]) {
        console.log("Unload Plugin: " + name);
        if (!force && plugin.__prevent_unload) {
          return false;
        }
        if (plugin.teardown) {
          plugin.teardown();
        }
        if (this.bot.missingCommandHandler === plugin.__missingCommandHandler) {
          this.bot.removeMissingCommandHandler();
        }
        _ref = plugin.__listeners;
        for (event in _ref) {
          callbacks = _ref[event];
          for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            callback = callbacks[_i];
            this.bot.removeListener(event, callback);
          }
        }
        _ref1 = plugin.__commands;
        for (command in _ref1) {
          callback = _ref1[command];
          this.bot.removeCommand(command);
        }
        plugin.__loaded = false;
        return true;
      } else {
        console.log("Unload Plugin: " + name + " (error, no plugin by this name)");
        return false;
      }
    };

    PluginManager.prototype.get = function(name) {
      return this.plugins[name];
    };

    PluginManager.prototype.getAllNames = function() {
      return Object.keys(this.plugins);
    };

    PluginManager.prototype.getAllLoadedNames = function() {
      var name, plugin;

      return Object.keys((function() {
        var _ref, _results;

        _ref = this.plugins;
        _results = [];
        for (name in _ref) {
          plugin = _ref[name];
          if (plugin.__loaded) {
            _results.push(name);
          }
        }
        return _results;
      }).call(this));
    };

    PluginManager.prototype.__rescan = function() {
      var name, plugin, _ref;

      _ref = this.plugins;
      for (name in _ref) {
        plugin = _ref[name];
        if (plugin.__loaded) {
          this.unload(name, true);
        }
        delete require.cache[plugin.__required_as];
      }
      this.plugins = {};
      return this.__scan();
    };

    PluginManager.prototype.__scan = function() {
      var file, files, plugin, require_file, _i, _len, _results;

      files = fs.readdirSync(path.join(__dirname, 'plugins'));
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        require_file = fs.realpathSync(path.join(__dirname, 'plugins', file));
        plugin = new (require(require_file))(this.bot, this.config);
        this.plugins[plugin.__name] = plugin;
        plugin.__filename = file;
        plugin.__required_as = require_file;
        plugin.__loaded = false;
        if (plugin.__autoload) {
          _results.push(this.load(plugin.__name));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return PluginManager;

  })();

  module.exports = PluginManager;

}).call(this);