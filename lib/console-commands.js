let plugin = require('..').plugin
let ep = plugin.extensionPoints['console.command']

let _ = require('underscore')

exports.help = function (output, tokens) {
  // TODO, expose help <parser> for each console.line parser we have.
  let commands = ep.array

  commands = _.sortBy(commands, (a, b) => {
    return a.line < b.line
  })

  _.each(commands, (cmd) => {
    let line = [cmd.command]
    if (cmd.description) {
      line.push(cmd.description)
    }
    output.log('\t' + line.join('\t'))
  })

}

