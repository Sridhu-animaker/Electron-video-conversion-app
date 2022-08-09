const electron = require("electron");
const ffmpeg = require("fluent-ffmpeg");

const { app, BrowserWindow, ipcMain } = electron;

let mainWindow;
app.on("ready", () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true, // without this being true require won't work in script.js
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/src/index.html`);
});

ipcMain.on("video:added", (event, videos) => {
  // Performing fetch single video details fetch inside promise

  // ====> CODE
  //   const promise = new Promise((resolve, reject) => {
  //     ffmpeg.ffprobe(videos[0].path, (err, metadata) => {
  //       resolve(metadata);
  //     });
  //   });
  //
  //   promise.then((metadata) => {
  //     console.log(metadata);
  //   });
  // <==== CODE

  //   Handling fetch data for the multiple videos
  const promises = videos.map((video) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(video.path, (err, metadata) => {
        // Adding two more key datas to video
        video.duration = metadata.format.duration;
        video.format = "avi";
        resolve(video);
      });
    });
  });

  //  This Promise.all() will be called only after all the promises are resolved
  Promise.all(promises).then((metadata) =>
    mainWindow.webContents.send("metadata:complete", metadata)
  );
});
