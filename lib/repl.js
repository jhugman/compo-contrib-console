
let _ = require('underscore')
let plugin = require('..').plugin 

let consoleCommands = plugin.extensionPoints['console.command']
let lineParsers = plugin.extensionPoints['console.line']

class Repl {
  constructor () {
    this.repl = new GameRepl(
      plugin.extensionPoints['console.command'],
      plugin.extensionPoints['console.command.token']
    )
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
    return Promise.resolve(this.repl.gameEvaluateLine(println, line))
  }
}



let stopWords = new Set(['a', 'the', 'with', 'to'])

class GameRepl {

  constructor (commandsEP, argsEP, stopWordsEP) {
    commandsEP.onAdd((cmd) => {
      cmd.tokens = this.tokenize(cmd.command)
      delete this._sortedCommands
    })
    commandsEP.onRemove((cmd) => {
      delete this._sortedCommands
    })
    this.commandsEP = commandsEP
    this.argsEP = argsEP
  }

  get commands () {
    let s = this._sortedCommands
    if (s) {
      return s
    }
    this._sortedCommands = s = this.commandsEP.array
    s.sort((a, b) => {
      let delta
      delta = b.tokens.length - a.tokens.length
      return delta
    })
    return s
  }

  tokenize (line) {
    return line.split(/\s+/).filter((t) => t && !stopWords.has(t))
  }

  gameEvaluateLine (output, line) {
    // output is not used at all in the parser, 
    // so it's upto the client of the parser what to pass in.
    let ctx = {
      args: [],
      consumed: [],
      evalContext: output,
    }

    let tokens = this.tokenize(line)
    let command = this._matchCommand(tokens, ctx)
    
    if (!_.isFunction(command)) {
      // TODO better error handling.
      return
    }

    let args = ctx.args

    // I wish ...rest operators worked.
    // command(output, ...args, tokens)
    args.unshift(output)
    args.push(tokens)

    // the command is contributed from someplace else, so 
    // we should be careful handling it.
    try {
      command.apply(null, args)
      return true
    } catch (e) {
      console.error(e.stack)
    }
    

  }

  _undo (ctx, tokens) {
    ctx.consumed.reverse().forEach((t) => {
      tokens.unshift(t)
    })
  }

  _appendArray(array, extender) {
    for (let ex of extender) {
      array.push(ex)
    }
    return array
  }

  _matchCommand (tokens, ctx) {
    let commands = this.commands

    return commands.find((command) => {
      let stashedConsumed = ctx.consumed
      ctx.consumed = []
      ctx.args = []

      let commandTokens = command.tokens
      // console.log('testing ' + command.line)  
      for (let commandToken of commandTokens) {
        let success = true
        // console.log('\ttokens', tokens)
        let arg = this._matchArg(commandToken, tokens, ctx)
        if (arg) {
          // console.log('\t', commandToken, 'matches', arg)
          ctx.args.push(arg)
        } else if (commandToken.indexOf(tokens[0]) === 0) {
          // console.log('\t' + commandToken + ' matches user token')
          ctx.consumed.push(tokens.shift())
        } else {
          // console.log('\t\'' + tokens[0] + '\' does not match \'' + commandToken + '\'')
          this._undo(ctx, tokens)
          ctx.consumed = stashedConsumed
          return
        }
      }
      ctx.consumed = this._appendArray(stashedConsumed, ctx.consumed)
      return command
    })
  }

  _matchArg (commandToken, tokens, ctx) {
    let matchers = this.argsEP.object
    let argMatcher = matchers[commandToken]
    if (!argMatcher) {
      return
    }

    // command.line are really token types
    // get ITEM
    // so we want to check the item store
    // but don't want to do all this string parsing
    // for each thing we want to reference in the language.
    // so allow upto three words as ids or shortnames.
    let tokenIndex, 
        max = Math.max(10, tokens.length - 1)
    
    let consumed = [],
        evalContext = ctx.evalContext
    let arg
    
    for (tokenIndex = 0; tokenIndex < max && !arg; tokenIndex++) {
      consumed.push(tokens[tokenIndex])
      let id = consumed.join(' ')
      arg = argMatcher(id, evalContext)
    }

    if (arg) {
      tokens.splice(0, tokenIndex)
      if (ctx) {
        this._appendArray(ctx.consumed, consumed)
      }
    } else {
      //console.log('\t' + consumed.join(' ') + ' did not match ' + commandToken)
    }
    return arg
  }
}

module.exports = {
  Repl,
  GameRepl,
}