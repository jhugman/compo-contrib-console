
let me = 'Computer',
    you = 'new friend'

exports.hello = function (tokens, println) {
  me = tokens[0] || me
  println('hello ' + you)
}

exports.iam = function (tokens, println) {
  you = tokens[0] || you
  println('hello ' + you + '… i am ' + me)
}

