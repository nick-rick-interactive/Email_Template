// Import all necessary modules
var gulp      = require( 'gulp' ),
    gulpIf    = require( 'gulp-if' ),
    path      = require('path'),
    sass      = require( 'gulp-sass' ),
    jade      = require( 'gulp-jade' ),
    inlineCss = require( 'gulp-inline-css' ),
    assetPaths = require( 'gulp-assetpaths' ),
    bs        = require( 'browser-sync' ).create(),
    sequence  = require( 'run-sequence' ),
    imagemin  = require( 'gulp-imagemin' ),
    plumber   = require( 'gulp-plumber' ),
    rename    = require( 'gulp-rename' ),
    data      = require( 'gulp-data' ),
    pkg = require('./package.json'),
    dirs = pkg['configs'].directories;

var context = require( "./" + dirs.dev + '/vars.json');
var src = {
    jade:   dirs.dev + '/jade/*.jade',
    sass:   dirs.dev + '/sass/*.scss',
    img:    dirs.dev + "/img/**"
}

// Inliner task operations wrapped into a helper function
function inliner( srcFolder, srcFile, destFolder, destFile ) {
    console.log(destFile);
    return gulp.src( srcFolder + srcFile )
        .pipe( inlineCss({
            applyStyleTags:  false,
            removeStyleTags: false,
            applyLinkTags:   true,
            removeLinkTags:  true
        }))
        .pipe(gulpIf(destFile=='template.html',assetPaths({
            newDomain: 'www.thenewdomain.com',
            oldDomain: 'img/',
            docRoot : "./",
            filetypes : ['jpg','jpeg','png'],
            templates: true
        })))
        .pipe( rename( destFile ) )
        .pipe( gulp.dest( destFolder ) );
}

// Task: Compile stylesheet.sass and save it as stylesheet.css
gulp.task( 'sass', function() {
    gulp.src( src.sass )
        .pipe( plumber() )                 // report errors w/o stopping Gulp
        .pipe( sass() )
        .pipe( rename( 'main.css' ) )
        .pipe( gulp.dest( dirs.prod + "/css" ) );
});

// Task: Crunch and copy images
gulp.task('copy:images', function () {
    return gulp.src( src.img )
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest( dirs.prod + "/img"))
});

// Task: Render template.html populated with data and save it as preview.html
gulp.task( 'render', function() {
    return gulp.src( src.jade )
        .pipe(data(function(file) {
            return context;
        }))
        .pipe( jade() )
        .pipe( rename( 'preview.html' ) )
        .pipe( gulp.dest( dirs.prod ) );
});

// Task: Inline CSS into template.html and and save it to prod/
gulp.task( 'inlineTemplate', function() {
    return inliner( dirs.prod + "/", 'preview.html', dirs.prod + "/template/", 'template.html' );
});

// Task: Inline CSS into preview.html, save it as dev/index.html, and refresh
gulp.task( 'inlinePreview', function() {
    return inliner( dirs.prod + "/", 'preview.html', dirs.prod + "/", 'index.html' )
        .pipe( bs.reload( { stream: true } ) );
});

// Task: Start server and watchers
gulp.task( 'serve', function() {
    bs.init({
        proxy: 'http://localhost:63342/' + path.basename(__dirname) + '/' + dirs.prod + '/index.html'
    });

    // watchers to compile css and render template on file changes
    gulp.watch( dirs.dev + '/sass/stylesheet.scss', [ 'sass' ] );
    gulp.watch( dirs.dev + '/jade/index.jade', [ 'render' ] );
    gulp.watch( dirs.dev + '/img', [ 'copy:images' ] );

    // watchers to inline both preview and template whenever above get updated
    gulp.watch( dirs.prod + '/css/main.css', [ 'inlinePreview', 'inlineTemplate' ] );
    gulp.watch( dirs.prod + '/preview.html', [ 'inlinePreview', 'inlineTemplate' ] );
});

// Task: Default (run everything once, in sequence, and start server)
gulp.task( 'default', function() {
    sequence(  'sass', 'copy:images', 'render', 'inlinePreview', 'inlineTemplate', 'serve' );
});