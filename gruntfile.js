// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

  // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  grunt.initConfig({

    // get the configuration info from package.json ----------------------------
    // this way we can use things like name and version (pkg.name)
    pkg: grunt.file.readJSON('package.json'),

    // all of our configuration will go here

        // configure jshint to validate js files -----------------------------------
    jshint: {
      options: {
        reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
      },

      // when this task is run, lint the Gruntfile and all js files in src
      build: ['Gruntfile.js', 'js/*.js']
    },


    // compile less stylesheets to css -----------------------------------------
    less: {
      build: {
        files: {
          'css/style.css': 'css/style.less'
        }
      }
    },

    // configure watch to auto update ----------------
    watch: {
      
      // for stylesheets, watch css and less files 
      // only run less and cssmin stylesheets: { 
      files: ['css/*.css', 'css/*.less'], 
      tasks: ['less'] ,

      // for scripts, run jshint 
      scripts: { 
        files: 'js/*.js', tasks: ['jshint'] 
      } 
    }

  });

  // ===========================================================================
  // LOAD GRUNT PLUGINS ========================================================
  // ===========================================================================

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');


};
