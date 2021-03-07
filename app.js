const fs = require('fs');
const request = require('request');
const process = require('process');
const ytdl = require('ytdl-core');

const url = process.argv[2];
const quality = process.argv[3];

if (!url) {
  console.log('required url.');
  return;
}

if (!quality) {
  console.log('required quality. ex)highestaudio');
  return;
}

const downloadVideo = async (url) => {
  const videoId = ytdl.getURLVideoID(url);
  const info = await ytdl.getInfo(videoId);
  const videoName = info.player_response.videoDetails.title;
  console.log('VIDEO NAME:', `${videoId}: ${videoName}`);

  const list = info.formats.map(i => ({
    mimeType: i.mimeType,
    hasVideo: i.hasVideo,
    hasAudio: i.hasAudio,
    qualityLabel: i.qualityLabel,
    itag: i.itag,
    quality: i.quality,
    audioQuality: i.audioQuality,
    container: i.container,
    bitrate: i.bitrate,
    audioBitrate: i.audioBitrate,
  })).filter(f => f.audioQuality === 'AUDIO_QUALITY_MEDIUM');
  console.log(list);

  // Download Video
  const format = ytdl.chooseFormat(info.formats, { quality });

  const options = {
    filePath: `./incoming/${videoName}-${format.itag}.${format.container}`,
    targetUrl: format.url,
  }

  getInstallerFile(options)
};

// Download File
const getInstallerFile = ({ filePath, targetUrl}) => {
  console.log(`Download ${filePath}:`);
  let received_bytes = 0;
  let total_bytes = 0;

  const outStream = fs.createWriteStream(filePath);

  request
    .get(targetUrl)
    .on('error', function(err) {
      console.log(err);
    })
    .on('response', function(data) {
      total_bytes = parseInt(data.headers['content-length']);
    })
    .on('data', function(chunk) {
      received_bytes += chunk.length;
      showDownloadingProgress(received_bytes, total_bytes);
    })
    .pipe(outStream);
}

const showDownloadingProgress = (received, total) => {
  const percentage = ((received * 100) / total).toFixed(2);
  process.stdout.write(`${percentage}% | ${received}/${total} bytes\n`);
}


downloadVideo(url).then(r => console.log(r));
