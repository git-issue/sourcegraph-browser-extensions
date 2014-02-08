/*global module*/
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var userConfig = {
    prodURL: 'https://sourcegraph.com',
    devURL: 'https://localhost:3000',
    /*global process*/
    dev: process.env.DEV,
    buildDir: 'build',
  };
  userConfig.url = userConfig.dev ? userConfig.devURL : userConfig.prodURL;

  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),
    clean: [
      '<%= buildDir %>',
    ],
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
    copy: {
      build: {
        files: [
          {
            src: ['*.js', '*.css', '*.png', '*.html', '!Gruntfile.js'],
            dest: '<%= buildDir %>',
            expand: true
          },
          {
            src: ['../bower_components/bootstrap-sass/dist/css/bootstrap.min.css'],
            dest: '<%= buildDir %>',
            expand: true,
            flatten: true,
          },
        ]
      }
    },
    manifest: {
      'name': 'Sourcegraph<%= dev ? " DEV" : "" %>',
      'description': 'Shows you how to use libraries on GitHub by annotating code and displaying usage examples from Sourcegraph',
      'icons': {'128': 'icon_128.png'},
      'manifest_version': 2,
      'content_scripts': [
        {
          'matches': ['https://github.com/*'],
          'css': ['github.css'],
          'js': ['common.js', 'github.js']
        }
      ],
      'permissions': [
        'storage',
        '<%= url %>/'
      ],
      'options_page': 'options.html'
    },
    compress: {
      publish: {
        options: {
          archive: '<%= buildDir %>/sourcegraph-chrome-ext-<%= pkg.version %>.zip'
        },
        files: [
          {src: ['<%= buildDir %>/**/*']}
        ]
      }
    },
    watch: {
      src: {
        tasks: ['build', 'reload_chrome_extension'],
        files: ['*.js', '*.css'],
      },
    },
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  grunt.registerTask('manifest', 'Generate manifest.json', function () {
    var manifest = grunt.config('manifest');
    manifest.version = grunt.config('pkg.version');
    grunt.file.write(grunt.config('buildDir') + '/manifest.json', JSON.stringify(manifest, null, 2));
  });

  grunt.registerTask('process', 'Process JS files for substitutions', function() {
    var file = grunt.config('buildDir') + '/github.js';
    var tmpl = grunt.file.read(file);
    grunt.file.write(file, grunt.template.process(tmpl, {
      data: {
        url: grunt.config('url'),
        dev: grunt.config('dev'),
      }
    }));
  });

  grunt.registerTask('reload_chrome_extension', function() {
    var done = this.async();
    /*global require*/
    var exec = require('child_process').exec;
    exec('chromium-browser http://reload.extensions', function(err) {
      if (err) {
        grunt.log.writeln(err);
        done(false);
      } else done();
    });
  });

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['clean', 'jshint:src', 'manifest', 'copy:build', 'process:build']);
  grunt.registerTask('publish', ['build', 'compress:publish']);
  grunt.registerTask('w', ['build:src', 'watch:src']);
};
