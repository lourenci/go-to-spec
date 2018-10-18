const vscode = require('vscode')
const path = require('path')

const patterns = {
  'f': '(.+)', // Filename
  'e': '(\\.\\w+)' // File extension
}
const patternRegex = /\{(\w)\}/g

const {specFilePattern} = vscode.workspace.getConfiguration('goToSpec')
const specFileRegex = RegExp(specFilePattern.replace(patternRegex, (_, param) => patterns[param] || ''))

function getCodeFilename(specFilename) {
  const matches = specFilename.match(specFileRegex)
  return `${matches[1]}${matches[2]}`
}

function getSpecFilename(codeFilename) {
  const fileExt = path.extname(codeFilename)
  const finenameWithoutExension = path.basename(codeFilename, fileExt)
  return specFilePattern.replace(patternRegex, (_, param) => {
    switch(param) {
      case 'f':
        return finenameWithoutExension
      case 'e':
        return fileExt
      default:
        return ''
    }
  })
}

function activate (context) {
  let disposable = vscode.commands.registerCommand('extension.goToSpec', async function () {
    if (!vscode.workspace.name) {
      return
    }

    const activeFile = vscode.window.activeTextEditor
    if (!activeFile) {
      return
    }

    const openedFilePath = activeFile.document.fileName
    const openedFilename = path.basename(openedFilePath)

    let filenameToOpen
    if (specFileRegex.test(openedFilename)) {
      // We are in a spec file
      filenameToOpen = getCodeFilename(openedFilename)
    } else {
      // We are in a code file
      filenameToOpen = getSpecFilename(openedFilename)
    }
    try {
      const [fileToOpen] = await vscode.workspace.findFiles(`**/${filenameToOpen}`, '**/node_modules/**', 1)
      if (!fileToOpen) {
        return
      }
      const document = await vscode.workspace.openTextDocument(fileToOpen)
      return vscode.window.showTextDocument(document)
    } catch (err) {}
  })

  context.subscriptions.push(disposable)
}

exports.activate = activate

function deactivate () {}

exports.deactivate = deactivate
