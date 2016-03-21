// Import all necessary modules
var gulp      = require( 'gulp' ),
    gulpIf    = require( 'gulp-if' ),
    path      = require( 'path'),
    fs        = require( 'fs'),
    email     = require( 'gulp-email'),
    sass      = require( 'gulp-sass' ),
    jade      = require( 'gulp-jade' ),
    inlineCss = require( 'gulp-inline-css' ),
    assetPaths = require( 'gulp-assetpaths' ),
    gutil     = require( 'gulp-util' ),
    bs        = require( 'browser-sync' ).create(),
    sequence  = require( 'run-sequence' ),
    imagemin  = require( 'gulp-imagemin' ),
    plumber   = require( 'gulp-plumber' ),
    beep      = require( 'beepbeep' ),
    rename    = require( 'gulp-rename' ),
    data      = require( 'gulp-data' ),
    htmlReplace      = require( 'gulp-html-replace' ),
    htmlClean      = require( 'gulp-htmlclean' ),
    pkg = require('./package.json'),
    dirs = pkg['configs'].directories;

var context = require( "./" + dirs.dev + '/vars.json');
var src = {
    jade:   dirs.dev + '/jade/*.jade',
    sass:   dirs.dev + '/sass/*.scss',
    img:    dirs.dev + "/img/**"
}

//Plumber Hanlder
var onError = function (err) {
    beep([0, 0, 0]);
    gutil.log(gutil.colors.red(err));
};

// Inliner task operations wrapped into a helper function
function inliner( srcFolder, srcFile, destFolder, destFile ) {
    return gulp.src( srcFolder + srcFile )
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe( inlineCss({
            applyStyleTags:  false,
            removeStyleTags: false,
            applyLinkTags:   true,
            removeLinkTags:  false
        }))
        .pipe(gulpIf(destFile=='template.html',assetPaths({
            newDomain: context.imageUrl,
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
        .pipe(plumber({
            errorHandler: onError
        }))
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
        .pipe(plumber({
            errorHandler: onError
        }))
        /*.pipe(data(function(file) {
            return JSON.stringify(context);
        }))*/
        .pipe( jade({
            data: JSON.parse( fs.readFileSync("./" + dirs.dev + '/vars.json', { encoding: 'utf8' }) )
        }) )
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

gulp.task( 'email', function() {
    sequence(  'strip-email', 'send-email' );
});

gulp.task( 'strip-email', function() {
    return gulp.src([dirs.prod + "/template/template.html"])
        .pipe(htmlReplace({
            'css': '',
            'js': ''
        }))
        .pipe(htmlClean())
        .pipe( gulp.dest( dirs.prod + "/template/template_stripped.html") );
});

gulp.task( 'send-email', function() {
    var templateContent = fs.readFileSync(dirs.prod + "/template/template_stripped.html", encoding = "utf8");
    var stripOptions = {
        include_script : false,
        include_style : false,
        compact_whitespace : true,
        include_attributes : { 'alt': true }
    };
    var emailOptions = {
        user: pkg['configs'].mailgun.user,
        url: pkg['configs'].mailgun.url,
        form: {
            from: 'Email Test <email.tester@gmail.com>',
            to: 'Tester <nick.rick.interactive@gmail.com>',
            /*cc: 'Regis Messac <regis.messac@gmail.com>',
             bcc: 'John Smith <john.smith@gmail.com>',*/
            subject: context.name+' Test',
            text: htmlReplace(templateContent, stripOptions)
        }
    }
    return gulp.src([dirs.prod + "/template/template_stripped.html"])
        .pipe(email(emailOptions));
});