
let me = 'Computer',
    you = 'new friend'

exports.hello = function (output, tokens) {
  me = tokens[0] || me
  output.log('hello ' + you)
}

exports.iam = function (output, tokens) {
  you = tokens[0] || you
  output.log('hello ' + you + '… i am ' + me)
}

