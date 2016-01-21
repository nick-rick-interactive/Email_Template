# HTML5 Banner Setup<br/>

#### This repository will get you up and running with a basic layout for a <a href="https://www.doubleclickbygoogle.com/" target="_blank">DoubleClick</a> banner set.
###### It utilizes Gulp to create banner sets from a template, copy existing completed banners to a new size, and compiling.

You must install <a href="https://www.npmjs.com" target="_blank">NPM</a> to generate banners<br/><br/>

### Start by installing the Node Modules needed

    npm install

### <a href="http://sass-lang.com/" target="_blank">Jade</a><br/>

The html for the banners is generated with Jade mark up.

### <a href="http://coffeescript.org/" target="_blank">Coffeescript</a><br/>

The javascript is generated using coffeescript.  A basic banner class utilizing polite load is added to the project to extend into the Banner's class.

### <a href="http://sass-lang.com//" target="_blank">SASS</a><br/>

Sass is used for all css.  A Cross Browser CSS3 mixin file (<a href="https://github.com/matthieua/sass-css3-mixins" target="_blank">matthieua/sass-css3-mixins</a>) and basic banner additional mixins are added to the project to get you started

### <a href="http://sass-lang.com//" target="_blank">Gulp</a><br/>

Gulp is setup to use 3 main functions<br/><br/>

##### new-banner<br/>
This will generate the template files needed to create a banner.  Use the "banner" argument to send the folder naming convention.  Each variable for --banner needs to separated by a * in the following order:<br/>
    
    (--banner)
    Prefix          REQUIRED
    Width           REQUIRED
    Height          REQUIRED
    Exp-Width       REQUIRED FOR EXPANDING AND FLOATING UNITS
    Exp-Height      REQUIRED FOR EXPANDING AND FLOATING UNITS
    Offset-X        OPTIONAL FOR EXPANDING UNITS
    Offset-Y        OPTIONAL FOR EXPANDING UNITS
    
The code should look similar to the following:

    gulp new-banner --banner=Banner*728*90

Which will output the folder (Banner_728x90)
    
<br/><br/>
This will generate the Jade, Coffeescript and SASS files to start your project

##### copy-banner<br/>
This will copy the files from one banner to a new banner size.  Each variable for --banner and --newBanner needs to separated by a * in the following order:<br/>
                         
    (--banner)
    Prefix          REQUIRED
    Width           REQUIRED
    Height          REQUIRED
    Exp-Width       REQUIRED FOR EXPANDING AND FLOATING UNITS
    Exp-Height      REQUIRED FOR EXPANDING AND FLOATING UNITS
         
    (--newBanner)
    Prefix          REQUIRED
    Width           REQUIRED
    Height          REQUIRED
    Exp-Width       REQUIRED FOR EXPANDING AND FLOATING UNITS
    Exp-Height      REQUIRED FOR EXPANDING AND FLOATING UNITS
    
The code should look similar to the following:

    gulp new-banner --banner=Banner*728*90 --newBanner=Banner*300*250

Which will copy the folder (Banner_728x90) to the new folder (Banner_300x250) and rename all the files and sizes.
    
<br/>
A duplicate banner set will be generated in the new size and an empty dist folder

##### build (Default)<br/>
This will compile the Jade, Coffeescript and SASS files to a minified JS file, an normal JS file, a CSS file and HTML file using the banner size as the naming convention in the argument sent.  It will then package the distrbution files into a zip in the dist folder and a "zipped" folder in the main directory.

    gulp --banner=Banner_728x90
    
or

    gulp build --banner=Banner_728x900
    
<br/>
This will compile all the code in the 728x90 folder.  It will also compress all images added to _img and zip up the CSS, HTML, minified JS and all images into a zip archive.

##### package<br/>
This compile, shrink and zip all units with the given prefix argument

    gulp package --prefix=Banner
    
<br/>
This will compile (build) all the code in any folder that has the prefix of "Banner".
