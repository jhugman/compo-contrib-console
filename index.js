// Not quite sure what to do with this file. 

const FIRST_WORD = 'console.command'

let PROMPT = ' >> ',
    PROMPT_PADDING = '... ',
    ERR_PADDING = 'ERR '

let readline = require('readline')

let completer = function (line) {
  return [];
};

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: completer
})

let startup = (println) => {
  let startups = exports.plugin.extensionPoints['console.startup'].array
    .map((s) => {
      try {
        return s(println)
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
  
  let plugin = exports.plugin
  let doingEval = plugin.repl.evaluateLine(line, println)
  
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
  exports.unload()
  process.exit(0)
}

exports.unload = () => {
  console.log()
  println('Goodbye')
  rl.close()
  rl = null
}

rl.
  on('line', answerThis).
  on('SIGINT', quit)

setTimeout(() => {
  startup(println)
    .then(() => {
      println('Type ? for a list of commands')
      prompt()
    })
}, 1)
