import React from 'react';

const mix = require('laravel-mix');

mix.js('resources/js/app.jsx', 'public/js').react()
    .react() // React támogatás, ha szükséges
    .sass('resources/sass/app.scss', 'public/css')
    .version();
