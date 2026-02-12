// Build plugins
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
// Serve plugins
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload';

import pkg from "./package.json";

const production = !process.env.ROLLUP_WATCH;

const banner = `
/**
 * Copyright (C) ${new Date().getFullYear()} by Videsk - All Rights Reserved
 * @name ${pkg.name}
 * @author Videsk
 * @license ${pkg.license}
 * Written by ${pkg.author}
 * Build ${Date.now()}
 *
 * ${pkg.description}
 *
*/`;

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
                shell: true
            });
            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

function outputName(name) {
    return production ? name : 'public/bundle.js';
}

function addToBuild(options) {
    return production && options;
}

export default {
    input: 'src/index.js',
    output: [
        {
            file: outputName(pkg.browser),
            format: 'umd',
            name: pkg.umdName,
            esModule: false,
            sourcemap: !production,
            banner,
            strict: false,
        },
        addToBuild({
            file: pkg.module,
            format: 'es',
            sourcemap: !production,
            banner,
        }),
    ],
    plugins: [
        resolve({
            browser: true
        }),
        commonjs(),
        replace({ 'process.env.NODE_ENV': JSON.stringify( 'production' ) }),
        // In dev mode, call `npm run start` once
        // the bundle has been generated
        !production && serve(),
        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        !production && livereload('public'),
        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),
    ],
    watch: {
        clearScreen: false
    }
}
