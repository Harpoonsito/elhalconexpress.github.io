const purgecss = require('@fullhuman/postcss-purgecss');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  parser: 'postcss-safe-parser', // ← parser tolerante
  plugins: [
    require('autoprefixer'),
    isProd && purgecss({
      content: ['./**/*.html', './js/**/*.{js,ts,jsx,tsx,vue,svelte}'],
      defaultExtractor: content => content.match(/[A-Za-z0-9-_:/%.]+/g) || [],
      safelist: [
        'show', 'collapse', 'collapsing',
        /(modal|tooltip|popover|offcanvas)(-|$)/,
        /(col|row|g|gy|gx)-.*/,
        /(bg|text|border|m|p|gap|justify|align|float|d|position)-.*/,
      ],
      fontFace: true,
      keyframes: true,
      variables: true,
    })
  ].filter(Boolean)
};
