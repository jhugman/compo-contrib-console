
let me = 'Computer',
    you = 'new friend'

exports.hello = function (println, tokens) {
  me = tokens[0] || me
  println('hello ' + you)
}

exports.iam = function (println, tokens) {
  you = tokens[0] || you
  println('hello ' + you + '… i am ' + me)
}

