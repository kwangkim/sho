#! /usr/bin/env node
var Remarkable = require("remarkable");
var fs = require("fs");
var hljs = require("highlight.js");
var jade = require("jade");

var md = new Remarkable({
  html: true,
  linkify: true,
  breaks: true,
  highlight: function(str, lang) {
    return lang ? hljs.highlight(lang, str).value : str;
  }
});

module.exports = function(sourceFile, destFile, minutes) {
  var mdSource = fs.readFileSync(sourceFile, "UTF-8");
  var html = md.render(mdSource)
  var jadeLocals = {slides: html.split("<hr>"), minutes: minutes};
  var output = jade.renderFile(__dirname + "/template.jade", jadeLocals);
  fs.writeFileSync(destFile, output);
};

if (require.main === module) {
  var argv = require("minimist")(process.argv.slice(2));
  if (argv.help) return console.log("Usage: sho [input.md] [output.html] [--watch] [--minutes <minutes>]");
  var sourceFile = argv._[0] || "slides.md";
  var destFile = argv._[1] || sourceFile.split(".")[0] + ".html";
  var minutes = argv.minutes === true ? undefined : parseInt(argv.minutes)
  if (minutes) console.log("Including " + minutes + " minute timer in output");
  var render = function() {
    module.exports(sourceFile, destFile, minutes);
    console.log("Generated " + destFile);
  };
  render();
  if (argv.watch) fs.watch(sourceFile, render);
}
