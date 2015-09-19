
let _ = require('underscore')
let plugin = require('..').plugin 

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
        parser = _.findWhere(oneWordCommands.array, { firstWord: firstWord, secondWord: secondWord })
      }
    }

    if (parser) {
      let result = parser(tokens, println)
      return Promise.resolve(result)
    } else {
      return Promise.reject(new Error('SYNTAX_ERROR'))
    }
  }
}