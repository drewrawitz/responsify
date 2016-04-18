/****************************
 * Variables
 ****************************/

  // Include gulp
  var gulp = require('gulp');

  // Include our plugins
  var autoprefixer = require('gulp-autoprefixer'),
      sass         = require('gulp-sass'),
      sourcemaps   = require('gulp-sourcemaps'),
      browserSync  = require('browser-sync'),
      reload       = browserSync.reload,
      minifycss    = require('gulp-minify-css'),
      jshint       = require('gulp-jshint'),
      uglify       = require('gulp-uglify'),
      concat       = require('gulp-concat'),
      imagemin     = require('gulp-imagemin'),
      header       = require('gulp-header'),
      plumber      = require('gulp-plumber'),
      notify       = require('gulp-notify'),
      clean        = require('gulp-clean'),
      runSequence  = require('run-sequence'),
      revHash      = require('gulp-rev-hash'),
      replace      = require('gulp-replace'),
      package      = require('./package.json'),
      bower        = require('./bower.json'),
      util         = require('gulp-util');

  // Define some project variables
  var destApp    = 'public',
      srcApp     = 'src',
      destCSS    = destApp + '/assets/css',
      destJS     = destApp + '/assets/js',
      destFonts  = destApp + '/assets/fonts',
      destImages = destApp + '/assets/img',
      srcSASS    = srcApp + '/assets/scss',
      srcJS      = srcApp + '/assets/js',
      srcFonts   = srcApp + '/assets/fonts',
      srcImages  = srcApp + '/assets/img';

  // Banner that gets injected at the top of my assets
  var banner = [
    '/*!\n' +
    ' * <%= package.title %>\n' +
    ' * <%= package.url %>\n' +
    ' * @author <%= package.author %> <<%= package.email %>>\n' +
    ' * @version <%= package.version %>\n' +
    ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
    ' */',
    '\n'
  ].join('');


/****************************
 * Styles Task
 ****************************/

  gulp.task('styles:dev', function() {
    return gulp.src(srcSASS+'/style.scss')
      .pipe(plumber())
      .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer('last 2 version'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(destCSS))
  });

  gulp.task('styles:prod', function() {
    return gulp.src(srcSASS+'/style.scss')
      .pipe(plumber())
      .pipe(sass())
      .pipe(autoprefixer('last 2 version'))
      .pipe(minifycss())
      .pipe(header(banner, { package : package }))
      .pipe(gulp.dest(destCSS))
  });


/****************************
 * Scripts Task
 ****************************/

  gulp.task('scripts:dev', function() {
    return gulp.src([
        '!'+srcJS+'/bower/jquery/*.js',
        ''+srcJS+'/bower/**/*.js',
        ''+srcJS+'/main.js'
      ])
      .pipe(concat('scripts.js'))
      .pipe(gulp.dest(destJS))
  });

  gulp.task('scripts:prod', function() {
    return gulp.src([
        '!'+srcJS+'/bower/jquery/*.js',
        ''+srcJS+'/bower/**/*.js',
        ''+srcJS+'/main.js'
      ])
      .pipe(concat('scripts.js'))
      .pipe(uglify())
      .pipe(header(banner, { package : package }))
      .pipe(gulp.dest(destJS))
  });

  gulp.task('lint', ['scripts:dev'], function() {
    gulp.src(''+srcJS+'/main.js')
      .pipe(jshint())
      .pipe(notify(function (file) {
        if (file.jshint.success) {
          return false;
        }

        var errors = file.jshint.results.map(function (data) {
          if (data.error) {
            return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
          }
        }).join("\n");
        return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors;
      }));
  });

/****************************
 * Images Task
 ****************************/

  gulp.task('images', function() {
    return gulp.src(srcImages+'/**/*')
      .pipe(imagemin({
          progressive: true,
          svgoPlugins: [{removeViewBox: false}]
        }))
      .pipe(gulp.dest(destImages));
  });

/****************************
 * Clean / Copy Files
 ****************************/

  gulp.task('clean', function () {
    return gulp.src(destApp, {read: false})
      .pipe(clean());
  });

  // Copy Files
  gulp.task('copy', [
      'copy:html',
      'copy:fonts',
      'copy:jquery'
  ]);

  gulp.task('copy:html', function() {
    var jquery_version = bower.dependencies.jquery.replace(/[^\d.-]/g, '');

    return gulp.src(srcApp+'/*.html')
      .pipe(replace(/{{JQUERY_VERSION}}/g, jquery_version))
      .pipe(revHash({assetsDir: destApp}))
      .pipe(gulp.dest(destApp));
  });

  gulp.task('copy:fonts', function() {
    return gulp.src(srcFonts+'/*.*')
      .pipe(gulp.dest(destFonts));
  });

  gulp.task('copy:jquery', function() {
    return gulp.src(srcJS+'/bower/jquery/*.js')
      .pipe(gulp.dest(destJS+'/bower/jquery/'));
  });

/****************************
 * Gulp Web Server
 ****************************/

gulp.task('webserver', function() {
  gulp.src('public')
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});

/****************************
 * Live Reload Server
 ****************************/

  // Start Live Reload Server
  function startBrowserSync() {
    if (browserSync.active) {
      return;
    }

    log('Starting Development Server');

    var options = {
      server: {
        baseDir: './public'
      },
      files: [
        srcApp + '/**/*.*',
        '!' + srcSASS + '/**/*.scss',
        destCSS + '/**/*.css'
      ],
      ghostMode: {
        clicks: true,
        forms: true,
        scroll: true
      },
      notify: false
    };

    browserSync(options);
  };


/****************************
 * Build/Dev Tasks
 ****************************/

  gulp.task('default', ['watch']);

  gulp.task('dev', function(cb) {
    runSequence('clean', ['styles:dev', 'scripts:dev', 'images'], 'copy',cb);
  });

  gulp.task('build', function(cb) {
    runSequence('clean', ['styles:prod', 'scripts:prod', 'images'], 'copy',cb);
  });


/****************************
 * Watcher
 ****************************/

  // Watch Task
  gulp.task('watch', ['dev'], function() {

    // Start up the browser with our development site
    startBrowserSync();

    // Watch .scss files
    gulp.watch(srcSASS+'/**/*.scss', ['styles:dev']);

    // Watch .js files
    gulp.watch(srcJS+'/**/*.js', ['lint']);

    // Watch .html files
    gulp.watch(srcApp+'/*.html', ['copy:html']);

    // Watch image files
    gulp.watch(srcImages+'/**/*', ['images']);

  });


/****************************
 * Logger
 ****************************/

  function log(msg, color) {
    color = typeof color !== 'undefined' ? color : 'blue';

    if (typeof(msg) === 'object') {
      for (var item in msg) {
        if (msg.hasOwnProperty(item)) {
          util.log(util.colors[color](msg[item]));
        }
      }
    } else {
      util.log(util.colors[color](msg));
    }
  }
