var module, require;

module.exports = function (grunt) {
    'use strict';

    // Configuration goes here
    grunt.initConfig({

        // Retrieve project's metadata
        pkg: grunt.file.readJSON('package.json'),

        mybanner:   '-------------------------------------\n' +
                    '         <%= pkg.name %>\n' +
                    'Copyright © <%= pkg.author.name %>  2015-<%= grunt.template.today("yyyy") %>\n' +
                    '-------------------------------------\n' +
                    '     Version: <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)',

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
                    dest: 'src/_processed/css/',
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
                    dest: 'src/_processed/css/',
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
                    cwd: 'src/_processed/css/',
                    src: ['**/*.scss.css'],
                    dest: 'src/_processed/css/',
                    ext: '.postcss.scss.css'
                }]
            }
        },

        // Minify CSS
        cssmin: {
            css: {
                options: {
                    //banner: '/*\n<%= mybanner %>\n*/\n',
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/_processed/css/',
                    src: ['**/*.postcss.css'],
                    dest: 'src/_processed/css/',
                    ext: '.min.css'
                }]
            },
            scss: {
                options: {
                    //banner: '/*\n<%= mybanner %>\n*/\n',
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/_processed/css/',
                    src: ['**/*.postcss.scss.css'],
                    dest: 'src/_processed/css/',
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
                    dest: 'src/_processed/js/',
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
                    cwd: 'src/_processed/html/',
                    src: ['**/*.processed.html'],
                    dest: 'src/_processed/html/',
                    ext: '.html',
                    filter: 'isFile'
                }]
            }
        },

        // Copies files from 3rd party sources to the `src` folder
        // Copies files from `src` folder to `dist` folder on production
        copy: {
            components: {
                files: [{
                    expand: true,
                    cwd: 'components/bootswatch/',
                    src: ['superhero/**'],
                    dest: 'src/scss/',
                    filter: function (dest) {
                        var output = grunt.task.current.data.files[0].dest + dest.replace(new RegExp('^' + this.cwd), '');
                        if (!grunt.file.isFile(dest)) { console.log('Not a file: ' + dest); return false; }
                        else if (grunt.file.exists(output)) { console.log('Already exists: ' + output); return false; }
                        else { return true; }
                    }
                }]
            },
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
                        'respond/dest/respond.src.js'
                    ],
                    dest: 'src/',
                    filter: function (dest) {
                        var output = grunt.task.current.data.files[0].dest + dest.replace(new RegExp('^' + this.cwd), '').replace(/^font-awesome\/(.*)\//, '$1/font-awesome/').replace(/^jquery\/dist\//, 'js/').replace(/^html5shiv\/dist\//, 'js/polyfill/').replace(/^respond\/dest\/respond.src.js/, 'js/polyfill/respond.js');
                        if (!grunt.file.isFile(dest)) { console.log('Not a file: ' + dest); return false; }
                        else if (grunt.file.exists(output)) { console.log('Already exists: ' + output); return false; }
                        else { return true; }
                    },
                    rename: function (dest, src) {
                        return dest + src.replace(/^font-awesome\/(.*)\//, '$1/font-awesome/').replace(/^jquery\/dist\//, 'js/').replace(/^html5shiv\/dist\//, 'js/polyfill/').replace(/^respond\/dest\/respond.src.js/, 'js/polyfill/respond.js');
                    }
                }]
            },
            process__fontawesome: {
                options: {
                    process: function (content, path) {
                        if (~path.indexOf('font-awesome.scss')) {
                            return content.replace(/@import "/g, '@import "font-awesome/');
                        } else if (~path.indexOf('_variables.scss')) {
                            return content.replace(/"\.\.\/fonts"/, '"../fonts/font-awesome"');
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
                        var strDepth = '../';
                        for (var i = path.match(/\//g).length - 2; i; i--) {
                            strDepth = strDepth + '../';
                        }

                        // RegExp to find an opening and closing custom tag
                        // The closing tag is mentioned twice; this helps the opening tag match with the first available closing tag (as opposed to the last found tag)
                        return content.replace(/<!--concat:css-->(?:(?!<!--\/concat-->)(?:.|\n))*<!--\/concat-->/g, '<link href="' + strDepth + 'css/master.min.css" rel="stylesheet">').replace(/<!--concat:js-->(?:(?!<!--\/concat-->)(?:.|\n))*<!--\/concat-->/g, '<script src="' + strDepth + 'js/master.min.js"></script>').replace(/<!--concat:polyfill-->(?:(?!<!--\/concat-->)(?:.|\n))*<!--\/concat-->/g, '<!--[if lt IE 9]><script src="' + strDepth + 'js/polyfill/master.min.js"></script><![endif]-->').replace(/<!--concat:css_bootswatch-->(?:(?!<!--\/concat-->)(?:.|\n))*<!--\/concat-->/g, '<link href="' + strDepth + 'css/master_bootswatch.min.css" rel="stylesheet">');
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'src/html/',
                    src: ['**'],
                    dest: 'src/_processed/html/',
                    ext: '.processed.html',
                    filter: 'isFile'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/_processed/',
                    src: [
                        'css/**/*.min.css',
                        '../fonts/**',
                        'html/**/*.html', '!html/**/*.processed.html',
                        '../images/**',
                        'js/**/*.min.js',
                        '../../LICENSE',
                        '../../README.md'
                    ],
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        return dest + src.replace(/^(\.\.\/)+/, '');
                    }
                }]
            }
        },

        // Merges all CSS files, JS files, and polyfill files into single files
        // Allows for fewer HTTP requests, and faster browser load speeds
        concat: {
            css: {
                files: [{
                    'src/_processed/css/master.min.css': [
                        'src/_processed/css/bootstrap.min.css',
                        'src/_processed/css/font-awesome.min.css'
                    ]
                }]
            },
            css_bootswatch: {
                files: [{
                    'src/_processed/css/master_bootswatch.min.css': [
                        'src/_processed/css/bootswatch.min.css',
                        'src/_processed/css/font-awesome.min.css'
                    ]
                }]
            },
            js: {
                files: [{
                    'src/_processed/js/master.min.js': [
                        'src/_processed/js/jquery.min.js',
                        'src/_processed/js/bootstrap.min.js'
                    ]
                }]
            },
            polyfill: {
                files: [{
                    'src/_processed/js/polyfill/master.min.js': [
                        'src/_processed/js/polyfill/html5shiv.min.js',
                        'src/_processed/js/polyfill/respond.min.js'
                    ]
                }]
            }
        },

        // Cleans directories which only contain minified files
        clean: {
            dist: ['dist'],
            postcss_css: ['!src/_processed/css/**/*.postcss.css'],
            postcss_scss: ['!src/_processed/css/**/*.postcss.scss.css'],
            processed: ['src/_processed/css/*'],
            css: ['src/_processed/css/*'],
            js: ['src/_processed/js/*'],
            html: ['src/_processed/html/*']
        },

        // Watches `src` files for changes, and performs appropriate tasks on-the-fly
        watch: {
            configFiles: {
                options: {
                    event: ['changed'],
                    reload: true
                },
                files: ['gruntfile.js']
            },
            css: {
                options: {
                    event: ['added', 'changed'],
                },
                files: ['src/css/**/*'],
                tasks: ['postcss:css', 'cssmin']
            },
            scss: {
                options: {
                    event: ['added', 'changed'],
                },
                files: ['src/scss/**/*.scss', 'src/scss/**/*.sass'],
                tasks: ['sass']
            },
            js: {
                options: {
                    event: ['added', 'changed'],
                },
                files: ['src/js/**/*'],
                tasks: ['uglify']
            },
            html: {
                options: {
                    event: ['added', 'changed'],
                },
                files: ['src/html/**/*'],
                tasks: ['copy:process__html']
            }
        },

    });

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


    // Register Grunt tasks
    //grunt.registerTask('default', ['Compilation-Tasks', 'watch']);

    grunt.registerTask('Distribute', [
        'clean:dist',
        'concat',
        'copy:dist'
    ]);

    grunt.registerTask('Compilation-Tasks', [
        'clean:processed',
        'Import-Missing-Assets',
        'Process-Files',
        'Minify-Processed'
    ]);

    grunt.registerTask('Import-Missing-Assets', [
        'copy:process__fontawesome',
        'copy:bower_components',
        'copy:bootstrap_assets',
        'copy:components'
    ]);

    grunt.registerTask('Process-Files', [
        'sass',
        'postcss',
        'copy:process__html'
    ]);

    grunt.registerTask('Minify-Processed', [
        'cssmin',
        'uglify',
        'concat',
        'minifyHtml'
    ]);

};
