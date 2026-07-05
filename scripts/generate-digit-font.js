#!/usr/bin/env node
/**
 * Generate a subsetted Fira Sans typeface JSON for specific digit(s).
 * Keeps the same font family / extrusion look as the original demo.
 *
 * Usage: node scripts/generate-digit-font.js 7
 *        node scripts/generate-digit-font.js 42
 */

const fs = require('fs')
const path = require('path')
const opentype = require('opentype.js')

const chars = process.argv[2]
if (!chars || !/^\d+$/.test(chars)) {
  console.error('Usage: node scripts/generate-digit-font.js <digits>')
  process.exit(1)
}

const ttfPath = path.join(__dirname, '../fonts/FiraSans-Thin.ttf')
const outPath = path.join(__dirname, '../public/bold.blob')
const referencePath = path.join(__dirname, '../public/bold.blob.reference')

const font = opentype.parse(fs.readFileSync(ttfPath).buffer)
const scale = 100000 / ((font.unitsPerEm || 2048) * 72)
const round = Math.round

const glyphs = {}
for (const char of chars) {
  const glyph = font.charToGlyph(char)
  const token = { ha: round(glyph.advanceWidth * scale), x_min: 0, x_max: 0, o: '' }

  glyph.path.commands.forEach(command => {
    let type = command.type.toLowerCase()
    if (type === 'c') type = 'b'
    token.o += type + ' '
    if (command.x !== undefined && command.y !== undefined) {
      token.o += round(command.x * scale) + ' ' + round(command.y * scale) + ' '
    }
    if (command.x1 !== undefined && command.y1 !== undefined) {
      token.o += round(command.x1 * scale) + ' ' + round(command.y1 * scale) + ' '
    }
    if (command.x2 !== undefined && command.y2 !== undefined) {
      token.o += round(command.x2 * scale) + ' ' + round(command.y2 * scale) + ' '
    }
  })

  glyphs[char] = token
}

const output = {
  glyphs,
  familyName: 'Fira Sans Eight',
  ascender: 1299,
  descender: -368,
  underlinePosition: -104,
  underlineThickness: 69,
  boundingBox: { yMin: -486, xMin: -965, yMax: 1458, xMax: 1889 },
  resolution: 1000,
  original_font_information: {
    format: 0,
    copyright: 'Digitized data copyright 2012-2016, The Mozilla Foundation and Telefonica S.A.',
    fontFamily: 'Fira Sans Eight',
    fontSubfamily: 'Regular',
    fullName: 'Fira Sans Eight',
    postScriptName: 'FiraSans-Eight'
  },
  cssFontWeight: 'normal',
  cssFontStyle: 'normal'
}

// Preserve the original subset as reference for digit "4"
if (!fs.existsSync(referencePath) && fs.existsSync(outPath)) {
  const current = JSON.parse(fs.readFileSync(outPath, 'utf8'))
  if (Object.keys(current.glyphs).join('') === '4') {
    fs.copyFileSync(outPath, referencePath)
  }
}

const reference = fs.existsSync(referencePath)
  ? JSON.parse(fs.readFileSync(referencePath, 'utf8'))
  : null

if (reference) {
  for (const char of chars) {
    if (reference.glyphs[char]) {
      glyphs[char] = reference.glyphs[char]
    }
  }
}

fs.writeFileSync(outPath, JSON.stringify({ ...output, glyphs }))
console.log(`Wrote ${outPath} with glyph(s): ${chars.split('').join(', ')}`)
