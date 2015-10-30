compo-plugin-console
--------------------
A plugin providing a console for compo applications.

The plugin starts a shell on `stdout`.

* The `console.command` extension point accepts extensions
  - `firstWord`: a string
  - `secondWord`: a string
  - `function`: function (output, tokens)
  - `description`: a message to show in `help`.
* a single command: `help`