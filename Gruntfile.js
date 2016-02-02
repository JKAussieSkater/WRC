// JSLint Configuration (to suppress unnecessary warnings)
/*jslint node: true */

module.exports = function (grunt) {
    'use strict';

    // Register Grunt tasks
    grunt.registerTask('default', ['Compilation-Tasks', 'watch']);

    grunt.registerTask('Distribute', ['copy:dist']);
    grunt.registerTask('Clean-Distribute', [
        'clean:dist',
        'Distribute'
    ]);

    grunt.registerTask('Compilation-Tasks', [
        'Assemble-Banner',
        'clean:tmp',
        'Import-Missing-Assets',
        'Process-Files',
        'Minify-Processed'
    ]);
    grunt.registerTask('Import-Missing-Assets', [
        'copy:process__fontawesome',
        'copy:bower_components',
        'copy:bootstrap_assets'
    ]);
    grunt.registerTask('Process-Files', [
        'sass',
        'postcss', 'clean:sass_scss',
        'copy:process__html',
        'copy:gather_nontext'
    ]);
    grunt.registerTask('Minify-Processed', [
        'cssmin', 'clean:postcss_css', 'clean:postcss_scss',
        'uglify',
        'concat',
        'minifyHtml', 'clean:copy_process__html', 'copy:process__tmp_html'
    ]);

    grunt.registerTask('Assemble-Banner', function () {
        /*jslint regexp: true */
        var pkg = grunt.file.readJSON('package.json'),
            strBanner,
            strName = pkg.description.replace(/\.(?:\n|.)*/, ''),
            strCopyright = 'Copyright © ' + pkg.author.name + ' ',
            strLicense = 'License: ',
            strVersion = 'Version: ' + pkg.version + ' ',
            blnOddName = strName.length % 2 !== 0, // true if odd, false if even
            strYears = pkg.meta.initial_version.date.year,
            strLength,
            strPrefix,
            intLongest;
        /*jslint regexp: false */

        if (pkg.meta.initial_version.date.year !== pkg.meta.current_version.date.year) {
            strYears = pkg.meta.initial_version.date.year + '-' + pkg.meta.current_version.date.year;
        }

        if (((strCopyright + strYears).length % 2 !== 0) === blnOddName) {
            strCopyright = strCopyright + strYears;
        } else {
            strCopyright = strCopyright + ' ' + strYears;
        }

        if (((strLicense + pkg.license).length % 2 !== 0) === blnOddName) {
            strLicense = strLicense + pkg.license;
        } else {
            strLicense = strLicense + ' ' + pkg.license;
        }

        if (((strVersion + '(' + pkg.meta.current_version.date.full + ')').length % 2 !== 0) === blnOddName) {
            strVersion = strVersion + '(' + pkg.meta.current_version.date.full + ')';
        } else {
            strVersion = strVersion + ' ' + '(' + pkg.meta.current_version.date.full + ')';
        }

        intLongest = Math.max(strName.length, strCopyright.length, strLicense.length, strVersion.length);

        for (strLength = ''; strLength.length !== intLongest; 0) {
            strLength = strLength + '-';
        }

        for (strPrefix = intLongest / 2 + strName.length / 2; strName.length !== strPrefix; 0) {
            strName = ' ' + strName;
        }
        for (strPrefix = intLongest / 2 + strCopyright.length / 2; strCopyright.length !== strPrefix; 0) {
            strCopyright = ' ' + strCopyright;
        }
        for (strPrefix = intLongest / 2 + strLicense.length / 2; strLicense.length !== strPrefix; 0) {
            strLicense = ' ' + strLicense;
        }
        for (strPrefix = intLongest / 2 + strVersion.length / 2; strVersion.length !== strPrefix; 0) {
            strVersion = ' ' + strVersion;
        }

        /*jslint white: true */
        strBanner = strLength + '\n' +
                    strName + '\n' +
                    strCopyright + '\n' +
                    strLicense + '\n' +
                    strLength + '\n' +
                    strVersion;
        /*jslint white: false */

        // Display banner in console
        console.log('<pre><tt>' + strBanner + '</tt></pre>');

        // Write banner to some place
        grunt.file.write('src/embed/banner.html', '<style>/*\n' + strBanner + '\n*/</style>');
    });

    grunt.registerTask('end-watch', function () { process.exit(1); });

    // Load Grunt plugins
    require('time-grunt')(grunt);
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-minify-html');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-sass');

    // Configuration goes here
    grunt.initConfig({

        // Copies files from 3rd party sources to the `src` folder (without replacing existing files)
        // Copies files from `src` folder to `dist` folder on production
        copy: {
            bootstrap_assets: {
                files: [{
                    expand: true,
                    cwd: 'bower_components/bootstrap-sass/assets/',
                    src: [
                        'stylesheets/bootstrap/**',
                        'stylesheets/_bootstrap.scss',
                        'fonts/bootstrap/**',
                        'javascripts/bootstrap.js'
                    ],
                    dest: 'src/',
                    filter: function (dest) {
                        var output = grunt.task.current.data.files[0].dest + dest.replace(new RegExp('^' + this.cwd), '').replace(/^stylesheets\//, 'scss/').replace(/^scss\/_/, 'scss/').replace(/^javascripts\//, 'js/');

                        /*jslint white: true */
                        if (!grunt.file.isFile(dest)) { console.log('Not a file: ' + dest); return false; }
                        else if (grunt.file.exists(output)) { console.log('Already exists: ' + output); return false; }
                        else { return true; }
                    },
                    rename: function (dest, src) {
                        return dest + src.replace(/^stylesheets\//, 'scss/').replace(/^scss\/_/, 'scss/').replace(/^javascripts\//, 'js/');
                    }
                }]
            },
            bower_components: {
                files: [{
                    expand: true,
                    cwd: 'bower_components/',
                    src: [
                        'font-awesome/scss/_**',
                        '!font-awesome/scss/_variables.scss',
                        'font-awesome/fonts/**',
                        'jquery/dist/jquery.js',
                        'html5shiv/dist/html5shiv.js',
                        'respond/dest/respond.src.js',
                        'bootswatch/superhero/**/*.scss'
                    ],
                    dest: 'src/',
                    filter: function (dest) {
                        /*jslint regexp: true */
                        var output = grunt.task.current.data.files[0].dest + dest.replace(new RegExp('^' + this.cwd), '').replace(/^font-awesome\/(.*)\//, '$1/font-awesome/').replace(/^jquery\/dist\//, 'js/').replace(/^html5shiv\/dist\//, 'js/polyfill/').replace(/^respond\/dest\/respond\.src\.js/, 'js/polyfill/respond.js').replace(/^bootswatch\//, 'scss/bootswatch/');
                        /*jslint regexp: false */

                        /*jslint white: true */
                        if (!grunt.file.isFile(dest)) { console.log('Not a file: ' + dest); return false; }
                        else if (grunt.file.exists(output)) { console.log('Already exists: ' + output); return false; }
                        else { return true; }
                    },
                    rename: function (dest, src) {
                        /*jslint regexp: true */
                        return dest + src.replace(/^font-awesome\/(.*)\//, '$1/font-awesome/').replace(/^jquery\/dist\//, 'js/').replace(/^html5shiv\/dist\//, 'js/polyfill/').replace(/^respond\/dest\/respond\.src\.js/, 'js/polyfill/respond.js').replace(/^bootswatch\//, 'scss/bootswatch/');
                    }
                }]
            },
            process__fontawesome: {
                options: {
                    process: function (content, path) {
                        if (/font-awesome\.scss/i.test(path)) {
                            return content.replace(/@import ('|")/g, '@import $1font-awesome/');
                        } else if (/_variables\.scss/i.test(path)) {
                            return content.replace(/('|")\.\.\/fonts\1/, '$1../fonts/font-awesome$1');
                        }
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'bower_components/font-awesome/scss/',
                    src: [
                        'font-awesome.scss',
                        '_variables.scss'
                    ],
                    dest: 'src/scss/',
                    filter: function (dest) {
                        var output = grunt.task.current.data.files[0].dest + dest.replace(new RegExp('^' + this.cwd), '').replace(/^_/, 'font-awesome/_');

                        /*jslint white: true */
                        if (!grunt.file.isFile(dest)) { console.log('Not a file: ' + dest); return false; }
                        else if (grunt.file.exists(output)) { console.log('Already exists: ' + output); return false; }
                        else { return true; }
                    },
                    rename: function (dest, src) {
                        return dest + src.replace(/^_/, 'font-awesome/_');
                    }
                }]
            },
            process__html: {
                options: {
                    process: function (content, path) {
                        var i, strDepth = '../';

                        /*jslint plusplus: true */
                        for (i = path.match(/\//g).length - 2; i; i--) {
                            strDepth = strDepth + '../';
                        }
                        /*jslint plusplus: false */

                        // Super-dooper code to parse <style></style> attribute if it's within the <head></head> attribute,
                        // and strips any commented code, newlines & tab spaces. Basically my simple RegEx CSS Minifier.
                        /*jslint regexp: true */
                        content = content.replace(/(<head>)((?:(?!<(?:style|\/head)>)(?:.|\n))*)(?:(<\/head>)|(<style>)((?:(?!<(?:\/style|\/head)>)(?:.|\n))*)(?:(<\/head>)|(<\/style>)((?:(?!<\/head>)(?:.|\n))*)(<\/head>)))/i, '$1$2$3$4' + content.match(/<head>(?:(?!<(?:style|\/head)>)(?:.|\n))*(?:<\/head>|<style>(?:(?!<(?:\/style|\/head)>)(?:.|\n))*(?:<\/head>|<\/style>(?:(?!<\/head>)(?:.|\n))*<\/head>))/i)[0].replace(/<head>(?:(?!<(?:style|\/head)>)(?:.|\n))*(?:<\/head>|<style>((?:(?!<(?:\/style|\/head)>)(?:.|\n))*)(?:<\/head>|<\/style>(?:(?!<\/head>)(?:.|\n))*<\/head>))/i, '$1').replace(/\n\s+/g, '').replace(/\/\*(?:(?!\*\/)(?:.|\n))*\*\//g, '') + '$6$7$8$9');
                        /*jslint regexp: false */

                        // Replaces <!--embed:xyz--><!--/embed--> tags with the `src/embed/xyz` code
                        // Then converts all references to `/tmp/` into relative paths
                        /*jslint regexp: true */
                        content = content.replace(/<!--embed:((?:(?!\/?-->).)+)(?:\/-->|-->(?:(?!<!--\/embed-->).|\n)*<!--\/embed-->)/g, function (match, $1) {return grunt.file.read('src/embed/' + $1); }).replace(/\/tmp\//g, strDepth);
                        /*jslint regexp: false */

                        if (/data-toggle=('|")popover\1/i.test(content)) {
                            content = content.replace(/<!--activate\/-->/i, grunt.file.read('src/embed/activate/template.html')).replace(/\/\/activate:bootstrap-popover\.js\/\//i, grunt.file.read('src/embed/activate/bootstrap-popover.js'));
                        }

                        if (/data-toggle=('|")tooltip\1/i.test(content)) {
                            content = content.replace(/<!--activate\/-->/i, grunt.file.read('src/embed/activate/template.html')).replace(/\/\/activate:bootstrap-tooltip\.js\/\//i, grunt.file.read('src/embed/activate/bootstrap-tooltip.js'));
                        }

                        // Discards any code requests for unused features
                        /*jslint regexp: true */
                        return content.replace(/\n?\/\/activate:.+\/\/(\n)?/gi, '$1');
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'src/html/',
                    src: ['**'],
                    dest: 'tmp/html/',
                    ext: '.processed.html',
                    filter: 'isFile'
                }]
            },
            process__tmp_html: {
                options: {
                    process: function (content) {
                        /*jslint regexp: true */
                        return content.replace(/<style>\/\*((?:(?!\*\/<\/style>)(?:.|\n))*)\*\/<\/style>/gi, '<!--$1-->');
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'tmp/html/',
                    src: ['**'],
                    dest: 'tmp/html/',
                    filter: 'isFile'
                }]
            },
            gather_nontext: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: [
                        'fonts/**',
                        'images/**'
                    ],
                    dest: 'tmp/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'tmp/',
                    src: [
                        'css/**',
                        'fonts/**',
                        'html/**/*.html', '!html/**/*.processed.html',
                        'images/**',
                        'js/**/*.min.js',
                        '../LICENSE',
                        '../README.md'
                    ],
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        return dest + src.replace(/^(\.\.\/)+/, '');
                    }
                }]
            }
        },

        // Compiles Sass files into CSS files
        sass: {
            scss: {
                options: {
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/scss/',
                    src: [
                        '**/*.scss',
                        '**/*.sass'
                    ],
                    dest: 'tmp/css/',
                    ext: '.scss.css'
                }]
            }
        },

        // Enhances CSS in order to be compatible with more browsers
        postcss: {
            css: {
                options: {
                    map: true,
                    processors: [
                        require('autoprefixer')({browsers: 'last 2 versions'})
                    ]
                },
                files: [{
                    expand: true,
                    cwd: 'src/css/',
                    src: ['**/*.css'],
                    dest: 'tmp/css/',
                    ext: '.postcss.css'
                }]
            },
            scss: {
                options: {
                    map: true,
                    processors: [
                        require('autoprefixer')({browsers: 'last 2 versions'})
                    ]
                },
                files: [{
                    expand: true,
                    cwd: 'tmp/css/',
                    src: ['**/*.scss.css'],
                    dest: 'tmp/css/',
                    ext: '.postcss.scss.css'
                }]
            }
        },

        // Minify CSS
        cssmin: {
            css: {
                options: {
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'tmp/css/',
                    src: ['**/*.postcss.css'],
                    dest: 'tmp/css/',
                    ext: '.min.css'
                }]
            },
            scss: {
                options: {
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'tmp/css/',
                    src: ['**/*.postcss.scss.css'],
                    dest: 'tmp/css/',
                    ext: '.min.css'
                }]
            }
        },

        // Minify JavaScript
        uglify: {
            js: {
                options: {
                    //banner: '/*\n<%= mybanner %>\n*/\n',
                    preserveComments: false,
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/js/',
                    src: ['**/*.js'],
                    dest: 'tmp/js/',
                    ext: '.min.js'
                }]
            }
        },

        // Minify HTML
        minifyHtml: {
            html_minified: {
                options: {
                    conditionals: true
                },
                files: [{
                    expand: true,
                    cwd: 'tmp/html/',
                    src: ['**/*.processed.html'],
                    dest: 'tmp/html/',
                    ext: '.html',
                    filter: 'isFile'
                }]
            }
        },

        // Merges all CSS files, JS files, and polyfill files into single files
        // Allows for fewer HTTP requests, and faster browser load speeds
        concat: {
            css: {
                files: [{
                    'tmp/css/master.min.css': [
                        'tmp/css/bootstrap.min.css',
                        'tmp/css/font-awesome.min.css'
                    ]
                }]
            },
            css_bootswatch: {
                files: [{
                    'tmp/css/master_bootswatch.min.css': [
                        'tmp/css/bootswatch.min.css',
                        'tmp/css/font-awesome.min.css'
                    ]
                }]
            },
            js: {
                files: [{
                    'tmp/js/master.min.js': [
                        'tmp/js/jquery.min.js',
                        'tmp/js/bootstrap.min.js'
                    ]
                }]
            },
            polyfill: {
                files: [{
                    'tmp/js/polyfill/master.min.js': [
                        'tmp/js/polyfill/html5shiv.min.js',
                        'tmp/js/polyfill/respond.min.js'
                    ]
                }]
            }
        },

        // Cleans directories which only contain minified files
        clean: {
            dist: ['dist'],
            sass_scss: [
                'tmp/css/**/*.scss.css',
                'tmp/css/**/*.scss.css.map',
                '!tmp/css/**/*.postcss.scss.css',
                '!tmp/css/**/*.postcss.scss.css.map'
            ],
            postcss_css: [
                'tmp/css/**/*.postcss.css',
                'tmp/css/**/*.postcss.css.map'
            ],
            postcss_scss: [
                'tmp/css/**/*.postcss.scss.css',
                'tmp/css/**/*.postcss.scss.css.map'
            ],
            copy_process__html: ['tmp/html/**/*.processed.html'],
            tmp: ['tmp/*'],
            tmp_css: ['tmp/css/*'],
            tmp_js: ['tmp/js/*'],
            tmp_html: ['tmp/html/*']
        },

        // Watches `src` files for changes, and performs appropriate tasks on-the-fly
        watch: {
            Gruntfile: {
                options: {
                    event: ['changed'],
                    spawn: false,
                    reload: true
                },
                files: ['gruntfile.js'],
                tasks: ['end-watch']
            },
            package_json: {
                options: {
                    event: ['added', 'changed']
                },
                files: ['package.json'],
                tasks: ['Assemble-Banner']
            },
            css: {
                options: {
                    event: ['added', 'changed']
                },
                files: ['src/css/**'],
                tasks: ['postcss:css', 'cssmin:css', 'clean:postcss_css']
            },
            scss: {
                options: {
                    event: ['added', 'changed']
                },
                files: ['src/scss/**/*.scss', 'src/scss/**/*.sass'],
                tasks: ['sass', 'postcss:scss', 'clean:sass_scss', 'cssmin:scss', 'clean:postcss_scss', 'concat']
            },
            js: {
                options: {
                    event: ['added', 'changed']
                },
                files: ['src/js/**'],
                tasks: ['uglify']
            },
            html: {
                options: {
                    event: ['added', 'changed']
                },
                files: ['src/html/**', 'src/embed/**'],
                tasks: ['copy:process__html', 'minifyHtml', 'clean:copy_process__html', 'copy:process__tmp_html']
            }
        }

    });
};
