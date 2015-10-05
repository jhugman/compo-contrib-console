
let _ = require('underscore')
let plugin = require('..').plugin 

let consoleCommands = plugin.extensionPoints['console.command']
let lineParsers = plugin.extensionPoints['console.line']

module.exports = class Repl {
  constructor () {
    
  }

  evaluateLine (line, println) {
    let parsers = lineParsers.array
    for (let i=parsers.length - 1; i >= 0; i--) {
      let parser = parsers[i]
      let result = parser(line, println)
      if (result !== undefined) {
        return Promise.resolve(result)
      }
    }
    return Promise.reject(new Error('SYNTAX_ERROR'))
  }

  evaluateLineWithTokens (line, println) {   
    let tokens = line.split(/\s+/g),
        firstWord = tokens.shift(),
        parsers = consoleCommands.object, // keyed by firstWord
        parser = parsers[firstWord]

    if (parser) {
      if (parser.secondWord) {
        let secondWord = tokens.shift()
        parser = _.findWhere(consoleCommands.array, { firstWord: firstWord, secondWord: secondWord })
      }
    }

    if (parser) {
      return parser(tokens, println) || null
    }
  }
}