
let main = require('..')
let plugin = main.addon
let _ = require('underscore')

// BUG: we don't have access to this yet
let oneWordCommands = plugin.extensionPoints['console.command']

module.exports = class Repl {
  constructor () {
    // 
  }

  evaluateLine (line, println) {   
    let tokens = line.split(/\s+/g),
        firstWord = tokens.shift(),
        parsers = oneWordCommands.object, // keyed by firstWord
        parser = parsers[firstWord]
    if (parser) {
      if (parser.secondWord) {
        let secondWord = tokens.shift()
        parser = _.findWhere(oneWordCommands.array, { firstWord: firstWord, secondWord: secondWord})

      }
    }

    if (parser) {
      return parser(tokens, println) || true
    }
  }
}