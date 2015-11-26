// Not quite sure what to do with this file. 

const FIRST_WORD = 'console.command'

let PROMPT = ' >>',
    PROMPT_PADDING = '   ',
    ERR_PADDING = '………'

let Table = require('cli-table');

let output, tableOutput = (header, rows) => {
  header = header || {}
  header.chars = header.chars || {'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': ''}
  let table = new Table(header);
  table.push.apply(table, rows)
  let string = table.toString()
  string.split('\n').forEach((line) => {
    output.log(line)
  })
}

output = {
  log: console.log.bind(console, PROMPT_PADDING),
  error: console.error.bind(console, ERR_PADDING),
  table: tableOutput,
}

let readline = require('readline')

let completer = function (line) {
  return [];
};

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: completer
})

let startup = (output) => {
  let startups = exports.plugin.extensionPoints['console.startup'].array
    .map((s) => {
      try {
        return s(output)
      } catch (e) {
        console.error('console.startup failed', e.stack)
      }
    })

  return Promise.all(startups)
}

let prompt = () => {
  if (!rl) {
    return
  }

  rl.setPrompt(PROMPT + ' ', PROMPT.length + 1)
  rl.prompt(true)
}


function answerThis (chunk) {
  if (chunk.match(/^\s*$/)) {
    prompt()
    return
  }

  let line = chunk.replace(/^\s*(.*)\s*$/, '$1')
  
  let plugin = exports.plugin
  let doingEval = plugin.repl.evaluateLine(output, line)
  
  doingEval.then((x) => {
    prompt()
  })
  .catch((err) => {
    if (err.message === 'SYNTAX_ERROR') {
      output.error('Not recognized:', line)
    } else {
      output.error(e.message)
      output.error(e.stack)
    }
    prompt()
  })
}

let quit = function () {
  exports.unload()
  process.exit(0)
}

exports.unload = () => {
  console.log()
  output.log('Goodbye')
  rl.close()
  rl = null
}

rl.
  on('line', answerThis).
  on('SIGINT', quit)

setTimeout(() => {
  startup(output)
    .then(() => {
      output.log('Type ? for a list of commands')
      prompt()
    })
}, 1)
