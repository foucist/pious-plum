// Generated by CoffeeScript 1.6.2
(function() {
  var GitHubApi, Plugin, commits_url, issues_url, prefix, repo_url,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  GitHubApi = require("node-github");

  prefix = "GitHub |";

  repo_url = /\/?([^\/]+)\/([^\/?]+)/;

  issues_url = /\/?([^\/]+)\/([^\/]+)\/issues\/(\d+)/;

  commits_url = /\/?([^\/]+)\/([^\/]+)\/commit\/([^\/?]+)/;

  Plugin = (function() {
    function Plugin(bot, config) {
      this.bot = bot;
      this.config = config;
      this.linkToGithub = __bind(this.linkToGithub, this);
      this.githubDetails = __bind(this.githubDetails, this);
      this.teardown = __bind(this.teardown, this);
      this.setup = __bind(this.setup, this);
      this.__name = "github_watch";
      this.__author = "epochwolf";
      this.__version = "v0.0.1";
      this.__listeners = {
        "message_with_url:github.com": [this.githubDetails]
      };
      this.__commands = {
        gh: this.linkToGithub
      };
      this.__autoload = true;
    }

    Plugin.prototype.conn = function() {
      var github;

      github = new GitHubApi({
        version: "3.0.0",
        timeout: 5000
      });
      if (this.config.github_auth) {
        github.authenticate(this.config.github_auth);
      }
      return github;
    };

    Plugin.prototype.setup = function() {
      return console.log("github_watch plugin loaded");
    };

    Plugin.prototype.teardown = function() {
      return console.log("github_watch plugin unloaded");
    };

    Plugin.prototype.githubDetails = function(channel, who, message, url) {
      var issue_id, match, path, repo, sha, user, _,
        _this = this;

      path = url.path;
      if (match = path.match(issues_url)) {
        _ = match[0], user = match[1], repo = match[2], issue_id = match[3];
        return this.conn().issues.getRepoIssue({
          user: user,
          repo: repo,
          number: issue_id
        }, function(err, data) {
          var labels, login, number, state, title, _ref;

          if (err) {
            return _this.bot.say(channel, "" + prefix + " Error: " + err);
          } else {
            title = data.title, number = data.number, state = data.state;
            labels = data.labels.map(function(label) {
              return label.name;
            }).join(", ");
            login = (_ref = data.user) != null ? _ref.login : void 0;
            return _this.bot.say(channel, "" + prefix + " #" + number + " (" + state + "): " + title + " [" + labels + "]");
          }
        });
      } else if (match = path.match(commits_url)) {
        _ = match[0], user = match[1], repo = match[2], sha = match[3];
        console.log(match);
        return this.conn().repos.getCommit({
          user: user,
          repo: repo,
          sha: sha
        }, function(err, data) {
          var additions, author, deletions, file_count, total, _ref;

          if (err) {
            return _this.bot.say(channel, "" + prefix + " Error: " + err);
          } else {
            author = data.commit.author.name;
            file_count = data.files.length;
            message = data.commit.message;
            _ref = data.stats, total = _ref.total, additions = _ref.additions, deletions = _ref.deletions;
            return _this.bot.say(channel, "" + prefix + " " + author + " (" + file_count + " files: +" + additions + " -" + deletions + ") : " + message);
          }
        });
      } else if (match = path.match(repo_url)) {
        _ = match[0], user = match[1], repo = match[2];
        return this.conn().repos.get({
          user: user,
          repo: repo
        }, function(err, data) {
          var description, forks, full_name, has_issues, has_wiki, homepage, name, open_issues, stars;

          if (err) {
            return _this.bot.say(channel, "" + prefix + " Error: " + err);
          } else {
            name = data.name, full_name = data.full_name, description = data.description, open_issues = data.open_issues, homepage = data.homepage, has_issues = data.has_issues, has_wiki = data.has_wiki;
            forks = data.forks_count;
            stars = data.watchers_count;
            return _this.bot.say(channel, "" + prefix + " " + full_name + " (" + stars + "★ " + forks + "♆ " + open_issues + "☤) : " + description);
          }
        });
      }
    };

    Plugin.prototype.linkToGithub = function(channel, who, args) {
      var repo, user,
        _this = this;

      user = args[0], repo = args[1];
      return this.conn().repos.get({
        user: user,
        repo: repo
      }, function(err, data) {
        var description, forks, full_name, has_issues, has_wiki, homepage, name, open_issues, stars;

        if (err) {
          return _this.bot.say(channel, "" + prefix + " Error: " + err);
        } else {
          name = data.name, full_name = data.full_name, description = data.description, open_issues = data.open_issues, homepage = data.homepage, has_issues = data.has_issues, has_wiki = data.has_wiki;
          forks = data.forks_count;
          stars = data.watchers_count;
          return _this.bot.say(channel, "" + prefix + " https://github.com/" + user + "/" + repo + " (" + stars + "★ " + forks + "♆ " + open_issues + "☤) : " + description);
        }
      });
    };

    return Plugin;

  })();

  module.exports = Plugin;

}).call(this);