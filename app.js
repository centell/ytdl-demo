const process = require('process');
const fs = require('fs');
const ytdl = require('ytdl-core');

console.log(process.argv);

const url = process.argv[2];

const downloadVideo = async (url) => {
  const videoId = ytdl.getURLVideoID(url);
  const info = await ytdl.getInfo(videoId);
  const videoName = info.player_response.videoDetails.title;
  console.log(`${videoId}: ${videoName}`);

  ytdl(videoId).pipe(fs.createWriteStream(`./incoming/${videoName}.mp4`))
};

downloadVideo(url);