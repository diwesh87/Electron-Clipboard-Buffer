const electron = require('electron'); //import electron
const path = require('path'); //import path

const {app, clipboard, globalShortcut, Menu, Tray} = electron

const STACK_SIZE = 5 // Set stack size to 5
const ITEM_MAX_LENGTH = 20 // Set max length to be shown


function addToStack(item, stack) {
  return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, stack.length - 1) : stack)
} // function to add an item to stack

function formatItem(item){
    return item && item.length > ITEM_MAX_LENGTH ? item.substr(0, ITEM_MAX_LENGTH) + '...' : item
} // Function to beautify the name shown in context menu for system tray icon

function formatMenuTemplateForStack(stack){
  return stack.map((item, i) => {
    return {
      label: `Copy: ${formatItem(item)}`,
      click: _ => clipboard.writeText(item),
      accelerator: `CmdorCtrl+Alt+${i + 1}`
    }
  })
} // function to set the context menu stack

function checkClipboardForChange(clipboard, onChange) {
  let cache = clipboard.readText() // Initialize with whatever is in the clipboard
  let latest // Define to compare the latest item and the cache
  setInterval(_ => { // Check on a regular interval for new additions
    latest = clipboard.readText() // read the latest value
    if(latest != cache) { // Check if the latest is not the same as cache( means new value is added )
      cache = latest // update cache to the latest
      onChange(cache) //refresh
    }
  })
}

function registerShortcuts(globalShortcut, clipboard, stack) {
  globalShortcut.unregisterAll()
  for(let i=0; i < STACK_SIZE; ++i) {
    globalShortcut.register(`CmdorCtrl+Alt+${i + 1}`, _ => {
      clipboard.writeText(stack[i])
    })
  }
}

app.on('ready', _ => {
  let stack = [] //Initialize an empty array to store list of stacks
  const tray = new Tray(path.join('src', 'trayIcon.png')) //Initialize the tray icon
  tray.setContextMenu(Menu.buildFromTemplate([{ label: '<Empty>', enabled: false}])) // Set the tray context menu

  checkClipboardForChange(clipboard, text => {
    stack = addToStack(text, stack)
    tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(stack))) // Set the context Menu for the tray icon using a custom function
    registerShortcuts(globalShortcut, clipboard, stack)
  }) // Call to the action function
})

app.on('will-quit', _ => {
  globalShortcut.unregisterAll()
})