// Not quite sure what to do with this file. 

const FIRST_WORD = 'console.command'

let PROMPT = ' >> ',
    PROMPT_PADDING = '... ',
    ERR_PADDING = 'ERR '
function plugin () {
  return exports.plugin
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

let prompt = function () {
  rl.setPrompt(PROMPT, PROMPT.length)
  rl.prompt(true)
}

let println = (line) => {
  console.log(PROMPT_PADDING + line)
}

function answerThis (chunk) {
  if (chunk.match(/^\s*$/)) {
    prompt()
    return
  }

  let line = chunk.replace(/^\s*(.*)\s*$/, '$1')
  let doingEval = plugin().repl.evaluateLine(line, println)
  
  doingEval.then((x) => {
    prompt()
  })
  .catch((err) => {
    if (err.message === 'SYNTAX_ERROR') {
      console.log(ERR_PADDING + 'Not recognized: ' + line)
    } else {
      console.log(ERR_PADDING + e.message)
      console.log(e.stack)
    }
    prompt()
  })
}

let quit = function () {
  console.log('\n' + PROMPT_PADDING + 'Goodbye')
  rl.pause()
  process.exit(0)
}

rl.
  on('line', answerThis).
  on('SIGINT', quit)

prompt()