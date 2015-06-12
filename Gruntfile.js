var fs = require('fs');
var mkdirp = require('mkdirp');

var setCasherMachin = function (moduleName,path,contents){
  var SETTINGS = {
      patchFile: path,
      statCasheFile:null,
      statCurrentFile:null,
      linkDir:function (moduleName){
        var dir = moduleName.split('/'),
          jsName = dir[dir.length -1],
          dirPast = '';

        if (dir.length == 1) {

          fs.writeFileSync('target/.cashe/'+ dir[0] +'.js', contents);
        } else {
          for (var i = 0; i < dir.length -1; i++) {
            dirPast += "/"+dir[i];
          }
          mkdirp.sync('target/.cashe/'+dirPast, function (err) {
            if (err) console.error(err)
          });
          fs.writeFileSync('target/.cashe/'+ dirPast +'/'+ jsName +'.js', contents);
        }
      }
    },
    API = {
      currentFileStat: function(){
        SETTINGS.statCurrentFile = fs.statSync(SETTINGS.patchFile).mtime;
      },
      checkStat: function(){
        API.currentFileStat();
        if(SETTINGS.statCasheFile >= SETTINGS.statCurrentFile) {
          console.log("/*****");
          console.log(moduleName);
          console.log("this file have old change");
        } else {
          fs.writeFileSync('target/.cashe/' +moduleName +".js", contents);
          console.log("/*****");
          console.log(moduleName);
          console.log("this file have NEW !! change");
        }
      }
    };

  try {
    SETTINGS.statCasheFile = fs.statSync('target/.cashe/' +moduleName +".js").mtime;
    API.checkStat();
  } catch(err) {
    if ( err.code == "ENOENT") {
      SETTINGS.linkDir(moduleName);
      SETTINGS.statCasheFile = fs.statSync('target/.cashe/' +moduleName +".js").mtime;

      API.checkStat();
    }
  }
};
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      compile: {
        options: {
          baseUrl: "app/scripts/",
          name: "main.js",
          out: "app/scripts/app.js",
          onBuildWrite: function (moduleName, path, contents) {
            setCasherMachin(moduleName, path, contents);
            return contents;
          }
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-requirejs');


  grunt.registerTask('default', ['requirejs']);

};
