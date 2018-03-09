// Copyright (C) 2007-2017, GoodData(R) Corporation. All rights reserved.

const copyConfig = {
    expand: true,
    cwd: './src',
    src: ['**/*.{scss,eot,woff,ttf,svg}']
};

const babelConfig = {
    expand: true,
    cwd: './src',
    src: ['**/*.{jsx,js}', '!**/test/*'],
    ext: '.js'
};

module.exports = (grunt) => {
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-babel');

    grunt.initConfig({
        clean: {
            prepublish: ['./lib', './es']
        },

        babel: {
            prepublish: {
                options: {
                    babelrc: false,
                    presets: [
                        'env',
                        'react',
                        'stage-2'
                    ],
                    plugins: [
                        'lodash'
                    ]
                },
                files: [
                    Object.assign({}, babelConfig, { dest: './lib' })
                ]
            },
            prepublishEs: {
                files: [
                    Object.assign({}, babelConfig, { dest: './es' })
                ]
            }
        },

        copy: {
            prepublish: {
                files: [
                    Object.assign({}, copyConfig, { dest: './lib' }),
                    Object.assign({}, copyConfig, { dest: './es' })
                ]
            }
        }
    });

    grunt.registerTask('prepublish', [
        'clean:prepublish',
        'babel',
        'copy'
    ]);
};
