import { parse, Font, Glyph, Path } from 'opentype.js'
import fetch from 'node-fetch'

export function generateSvgFromChar(char: string, font: Font) : string {
    const aGlyph: Glyph = font.charToGlyph(char)
    const aPath: Path = aGlyph.getPath(0, 0, 72) // x, y, font size in pixels
    return aPath.toSVG(14)
}
  
// TODO move to a lookup service
const roboto_regular = "https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmEU9fChc9.ttf"
const knownFonts: { [key: string]: string; } = {
  "Roboto" : roboto_regular,
  "Roboto-Regular": roboto_regular
}
  
export function getFont(fontName: string) : Promise<ArrayBuffer> {
  const url = knownFonts[fontName]
  return fetch(url)
    .then(response => response.blob())
    .then((data) => data.arrayBuffer())
}

export function svgsForRoboto(characters: Array<string>, callback: (a: Array<string>) => any) {
  getFont('Roboto')
    .then((ttf) => {
        const font: Font = parse(ttf)
        const svgs = characters.map((c) => generateSvgFromChar(c, font))
        callback(svgs)
  });
}

const fs = require('fs');

export function generateJson(selection: string, filename: string) {
  const characters = selection.split('')

  function writeJSON(svgs: Array<string>) {
    let dict: { [name : string]: string } = {}
    characters.forEach((c, i) => {
      dict[c] = svgs[i]
    })
    let data = JSON.stringify(dict)
    let result = `
      const dict = ${data}
      export { dict }
    `
    fs.writeFileSync(filename, result);
  }

  svgsForRoboto(characters, writeJSON)
}

generateJson('AaGgOoXx.:8R', 'src/index.ts')