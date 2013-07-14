/*global module:false*/
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        curly: false,
        eqeqeq: true,
        eqnull: true,
        es5: true,
        forin: true,
        indent: 2,
        latedef: false,
        noarg: true,
        quotmark: 'single',
        undef: true,
        unused: true,
        trailing: true,
        white: false,
        browser: true,
        devel: true,
        globals: {
          chrome: true,
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['*.js']
      }
    },
    less: {
      src: {
        files: {
          'github.css': [
            'github.less',
          ],
        }
      }
    },
    watch: {
      src: {
        tasks: ['build', 'reload_chrome_extension'],
        files: ['*.js', '*.less'],
      },
    },
  });

  grunt.registerTask('reload_chrome_extension', function() {
    var done = this.async();
    /*global require*/
    var exec = require('child_process').exec;
    exec('chromium http://reload.extensions', function(err) {
      if (err) {
        grunt.log.writeln(err);
        done(false);
      } else done();
    });
  });

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['less:src', 'jshint:src']);
  grunt.registerTask('w', ['build:src', 'watch:src']);
};
