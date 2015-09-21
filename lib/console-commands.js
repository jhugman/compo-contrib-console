let plugin = require('..').plugin
let ep = plugin.extensionPoints['console.command']

let _ = require('underscore')

exports.help = function (tokens, println) {
  let commands = ep.array

  if (tokens.length) {
    commands = _.filter(commands, (cmd) => cmd.firstWord === tokens[0])
  }

  commands = _.sortBy(commands, (a, b) => {
    let str = a.firstWord 
    if (a.secondWord) {
      str += '.' + a.secondWord
    }
    return str
  })

  _.each(commands, (cmd) => {
    let line = [cmd.firstWord]
    if (cmd.secondWord) {
      line.push(cmd.secondWord)
    } else {
      line.push('')
    }
    if (cmd.description) {
      line.push(cmd.description)
    }
    println('\t' + line.join('\t'))
  })

}

