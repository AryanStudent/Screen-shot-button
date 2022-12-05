const { app, BrowserWindow, ipcMain } = require('electron')
const {v4 : uuidv4 } =require('uuid');
const screenshare = require('screenshot-desktop');
const path = require('path')

var socket = require('socket.io-client')('117.99.191.98:5000')
var interval;

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  win.removeMenu();
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


ipcMain.on("start-share", function(event, arg) {

  var uuid = uuidv4();
  socket.emit("join-message", uuid);
  event.reply("uuid", uuid);

  interval = setInterval(function() {
      screenshot().then((img) => {
          var imgStr = new Buffer(img).toString('base64');

          var obj = {};
          obj.room = uuid;
          obj.image = imgStr;

          socket.emit("screen-data", JSON.stringify(obj));
      })
  }, 100)
})

ipcMain.on("stop-share", function(event, arg) {

  clearInterval(interval);
})