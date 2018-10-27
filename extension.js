const vscode = require('vscode')
const fs = require('fs')

function activate (context) {
  let disposable = vscode.commands.registerCommand('extension.goToSpec', function () {
    if (!vscode.workspace.name) {
      return
    }

    const activeFile = vscode.window.activeTextEditor
    if (!activeFile) {
      return
    }

    const openedFilename = activeFile.document.fileName
    const isCodeFile = /(.*(\/.*\/))(.*)(\.\w+)$/

    const openedFile = openedFilename.match(isCodeFile)

    if (!openedFile) {
      return
    }

    const path = openedFile[1]
    const lastPath = openedFile[2]
    const filenameWithoutExtension = openedFile[3]
    const filenameExtension = openedFile[4]

    const isSpecFile = /(\.|_|-)(spec|test)\./
    if (!isSpecFile.test(openedFile)) {
      const sufixSpecs = ['.spec', '.test', '_spec', '_test', '-spec', '-test']

      const sufixToOpen = sufixSpecs.map(spec => `${path}${filenameWithoutExtension}${spec}${filenameExtension}`)
        .filter(spec => fs.existsSync(spec))
      if (sufixToOpen.length > 0) {
        vscode.workspace.openTextDocument(vscode.Uri.file(sufixToOpen[0]))
          .then(vscode.window.showTextDocument)
      } else {
        const fileToOpen = `**${lastPath}${filenameWithoutExtension}_spec${filenameExtension}`
        vscode.workspace.findFiles(fileToOpen, '**/node_modules/**')
          .then(files => {
            vscode.workspace.openTextDocument(vscode.Uri.file(files[0].fsPath))
              .then(vscode.window.showTextDocument)
          })
      }
    } else {
      const sufixSpecs = ['.spec', '.test', '_spec', '_test', '-spec', '-test']
      let fileToOpen = openedFilename
      sufixSpecs.forEach(spec => { fileToOpen = fileToOpen.replace(spec, '') })
      if (fs.existsSync(fileToOpen)) {
        vscode.workspace.openTextDocument(vscode.Uri.file(fileToOpen))
          .then(vscode.window.showTextDocument)
      } else {
        fileToOpen = `**${lastPath}${filenameWithoutExtension}${filenameExtension}`.replace('_spec', '')
        vscode.workspace.findFiles(fileToOpen, '**/node_modules/**')
          .then(files => {
            vscode.workspace.openTextDocument(vscode.Uri.file(files[0].fsPath))
              .then(vscode.window.showTextDocument)
          })
      }
    }
  })

  context.subscriptions.push(disposable)
}

exports.activate = activate

function deactivate () {}

exports.deactivate = deactivate
