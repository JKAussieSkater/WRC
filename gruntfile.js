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
                        '**/*.sass',
                        '**/*.scss'
                    ],
                    dest: 'src/css/origin/',
                    ext: '.css'
                }]
            }
        },

        // Enhances CSS in order to be compatible with more browsers
        postcss: {
            css_origin: {
                options: {
                    map: true,
                    processors: [
                        require('autoprefixer')({browsers: 'last 2 versions'})
                    ]
                },
                dist: {
                    files: [{
                        expand: true,
                        cwd: 'src/css/origin/',
                        src: ['**/*.css'],
                        dest: 'src/css/origin/'
                    }]
                }
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
                    cwd: 'src/css/origin/',
                    src: ['**/*.css'],
                    dest: 'src/css/',
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
                    cwd: 'src/js/origin/',
                    src: ['**/*.js'],
                    dest: 'src/js/',
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
                    cwd: 'src/html/_minified/',
                    src: ['**'],
                    dest: 'src/html/_minified/',
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
                    filter: 'isFile',
                    rename: function (dest, src, cwd) {
                        var output = dest + src;
                        //Copies but doesn't replace existing files
                        if (grunt.file.exists(output)) {
                            console.log('Not replacing existing file: ' + output);
                            return '.DELETE/' + src;
                        } else {
                            return output;
                        }
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
                    filter: 'isFile',
                    rename: function (dest, src, cwd) {
                        //Renames folders
                        var output = dest + src.replace(/^stylesheets\//, 'scss/').replace(/^scss\/_/, 'scss/').replace(/^javascripts\//, 'js/origin/');
                        //Copies but doesn't replace existing files
                        if (grunt.file.exists(output)) {
                            console.log('Not replacing existing file: ' + output);
                            return '.DELETE/' + src;
                        } else {
                            return output;
                        }
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
                    filter: 'isFile',
                    rename: function (dest, src, cwd) {
                        //Renames folders
                        var output = dest + src.replace(/^font-awesome\/(.*)\//, '$1/font-awesome/').replace(/^jquery\/dist\//, 'js/origin/').replace(/^html5shiv\/dist\//, 'js/origin/polyfill/').replace(/^respond\/dest\/respond.src.js/, 'js/origin/polyfill/respond.js');
                        //Copies but doesn't replace existing files
                        if (grunt.file.exists(output)) {
                            console.log('Not replacing existing file: ' + output);
                            return '.DELETE/' + src;
                        } else {
                            return output;
                        }
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
                    filter: 'isFile',
                    rename: function (dest, src, cwd) {
                        //Renames folders
                        var output = dest + src.replace(/^_/, 'font-awesome/_');
                        //Copies but doesn't replace existing files
                        if (grunt.file.exists(output)) {
                            console.log('Not replacing existing file: ' + output);
                            return '.DELETE/' + src;
                        } else {
                            return output;
                        }
                    }
                }]
            },
            process_html: {
                options: {
                    process: function (content, path) {
                        var strDepth = '../';
                        for (var i = path.match(/\//g).length - 2; i; i--) {
                            strDepth = strDepth + '../';
                        }
                        // RegExp to find an opening and closing custom tag
                        // The closing tag is mentioned twice; this helps the opening tag match with the first available closing tag (as opposed to the last found tag)
                        return content.replace(/<!--concat:css-->(?:(?!<!--\/concat-->)(?:.|\n))*<!--\/concat-->/g, '<link href="' + strDepth + 'css/master.min.css" rel="stylesheet">').replace(/<!--concat:js-->(?:(?!<!--\/concat-->)(?:.|\n))*<!--\/concat-->/g, '<link href="' + strDepth + 'js/master.min.js" rel="stylesheet">').replace(/<!--concat:polyfill-->(?:(?!<!--\/concat-->)(?:.|\n))*<!--\/concat-->/g, '<!--[if lt IE 9]><link href="' + strDepth + 'js/polyfill/master.min.js" rel="stylesheet"><![endif]-->').replace(/<!--concat:css_bootswatch-->(?:(?!<!--\/concat-->)(?:.|\n))*<!--\/concat-->/g, '<link href="' + strDepth + 'css/master_bootswatch.min.css" rel="stylesheet">');
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'src/html/',
                    src: ['**', '!_minified/**'],
                    dest: 'src/html/_minified/',
                    filter: 'isFile'
                }]
            },
            css_origin: {
                files: [{
                    expand: true,
                    cwd: 'src/css/',
                    src: [
                        '**',
                        '!origin/**',
                        '!**/*.min.css',
                        '!**/*.min.css.map'
                    ],
                    dest: 'src/css/origin/',
                    filter: 'isFile',
                    rename: function (dest, src, cwd) {
                        //Copies but doesn't replace existing files
                        var output = dest + src;
                        if (grunt.file.exists(output)) {
                            console.log('Not replacing existing file: ' + output);
                            return '.DELETE/' + src;
                        } else {
                            return output;
                        }
                    }
                }]
            },
            js_origin: {
                files: [{
                    expand: true,
                    cwd: 'src/js/',
                    src: [
                        '**',
                        '!origin/**',
                        '!**/*.min.js',
                        '!**/*.min.js.map'
                    ],
                    dest: 'src/js/origin/',
                    filter: 'isFile',
                    rename: function (dest, src, cwd) {
                        //Copies but doesn't replace existing files
                        var output = dest + src;
                        if (grunt.file.exists(output)) {
                            console.log('Not replacing existing file: ' + output);
                            return '.DELETE/' + src;
                        } else {
                            return output;
                        }
                    }
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: [
                        'css/**',
                        '!css/origin/**',
                        'fonts/**',
                        'html/_minified/**',
                        'images/**',
                        'js/**',
                        '!js/origin/**',
                        '../LICENSE',
                        '../README.md'
                    ],
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        return dest + src.replace(/^html\/_minified/, 'html');
                    }
                }]
            }
        },

        // Merges all CSS files, JS files, and polyfill files into single files
        // Allows for fewer HTTP requests, and faster browser load speeds
        concat: {
            css: {
                files: [{
                    'dist/css/master.min.css': [
                        'src/css/bootstrap.min.css',
                        'src/css/font-awesome.min.css'
                    ]
                }]
            },
            css_bootswatch: {
                files: [{
                    'dist/css/master_bootswatch.min.css': [
                        'src/css/bootswatch.min.css',
                        'src/css/font-awesome.min.css'
                    ]
                }]
            },
            js: {
                files: [{
                    'dist/js/master.min.js': [
                        'src/js/jquery.min.js',
                        'src/js/bootstrap.min.js'
                    ]
                }]
            },
            polyfill: {
                files: [{
                    'dist/js/polyfill/master.min.js': [
                        'src/js/polyfill/html5shiv.min.js',
                        'src/js/polyfill/respond.min.js'
                    ]
                }]
            }
        },

        // Cleans directories which only contain minified files
        clean: {
            dot_delete: {src: ['.DELETE']},
            dist: {
                src: ['dist']
            },
            css_minified: {
                src: ['src/css/*', '!src/css/origin/**']
            },
            js_minified: {
                src: ['src/js/*', '!src/js/origin/**']
            },
            html_minified: {
                src: ['src/html/_minified/**']
            }
        },

        // Watches `src` files for changes, and performs appropriate tasks on-the-fly
        watch: {
            configFiles: {
                options: {
                    reload: true
                },
                files: ['gruntfile.js']
            },
            scss: {
                files: ['src/scss/**/*.sass', 'src/scss/**/*.scss'],
                tasks: ['sass:scss']
            },
            css: {
                files: [
                    'src/css/**/*',
                    '!src/css/**/*.min.css',
                    '!src/css/**/*.min.css.map',
                    '!src/css/origin/**'
                ],
                tasks: ['copy:css_origin', 'clean:css_minified']
            },
            css_origin: {
                files: ['src/css/origin/**/*.css'],
                tasks: ['postcss:css_origin', 'cssmin:css']
            },
            js: {
                files: [
                    'src/js/**/*',
                    '!src/js/**/*.min.js',
                    '!src/js/**/*.min.js.map',
                    '!src/js/origin/**'
                ],
                tasks: ['copy:js_origin', 'clean:js_minified']
            },
            js_origin: {
                files: ['src/js/origin/**/*.js'],
                tasks: ['uglify:js']
            }
        },

        // Create directory template
        mkdir: {
            src: {
                options: {
                    create: [
                        'src/js',
                        'src/css',
                        'src/html',
                        'src/image'
                    ]
                }
            },
            dist: {
                options: {
                    create: [
                        'dist/js',
                        'dist/css',
                        'dist/html',
                        'dist/image'
                    ]
                }
            },
            test: {
                options: {
                    create: ['test']
                }
            },
            docs: {
                options: {
                    create: ['docs/image']
                }
            }
        }

    });

    // Load Grunt plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-minify-html');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-sass');


    // Register Grunt tasks
    grunt.registerTask('default', ['Compilation-Tasks', 'watch']);

    grunt.registerTask('Make-Directories', ['mkdir:docs']);

    grunt.registerTask('Distribute', [
        'clean:dist',
        'concat',
        'copy:dist'
    ]);

    grunt.registerTask('Compilation-Tasks', [
        'Import-Missing-Assets',
        'Pre-Minify-Cleanup',
        'Preprocess-Sass-CSS',
        'Minify-SRC'
    ]);

    grunt.registerTask('Import-Missing-Assets', [
        'copy:process__fontawesome',
        'copy:bower_components',
        'copy:bootstrap_assets',
        'copy:components',
        'clean:dot_delete'
    ]);

    grunt.registerTask('Pre-Minify-Cleanup', [
        'copy:css_origin',
        'clean:css_minified',
        'copy:js_origin',
        'clean:js_minified',
        'clean:html_minified',
        'clean:dot_delete'
    ]);

    grunt.registerTask('Preprocess-Sass-CSS', [
        'sass:scss',
        'postcss:css_origin'
    ]);

    grunt.registerTask('Minify-SRC', [
        'cssmin',
        'uglify',
        'copy:process_html',
        'minifyHtml'
    ]);

};
