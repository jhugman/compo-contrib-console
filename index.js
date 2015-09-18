// Not quite sure what to do with this file. 

const FIRST_WORD = 'console.command'

let PROMPT = " >> ",
    PROMPT_PADDING = "... "

function plugin () {
  return exports.addon
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

  let line = chunk.replace(/^\s*(.*)\s*$/, "$1")
  let doingEval = plugin().repl.evaluateLine(line, println)
  if (doingEval) {
    if (doingEval.then) {
      doingEval
        .then(() => {
          prompt()
        })
        .catch((e) => {
          console.error(e.message, '\n', e.stack)
        })
      return
    }
  } else {
    console.log(PROMPT_PADDING + 'ERRROR: ' + line)
  }
  // do whatever async stuffs here, then prompt
  prompt()
}

let quit = function () {
  console.log("\n" + PROMPT_PADDING + "Goodbye")
  rl.pause()
}

rl.
  on("line", answerThis).
  on("SIGINT", quit)

prompt()