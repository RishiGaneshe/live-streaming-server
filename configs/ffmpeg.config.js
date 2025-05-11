const ffmpeg = require('fluent-ffmpeg')

ffmpeg.setFfmpegPath('C:/Program Files/ffmpeg-7.1.1-essentials_build/bin/ffmpeg.exe')
ffmpeg.setFfprobePath('C:/Program Files/ffmpeg-7.1.1-essentials_build/bin/ffprobe.exe')

module.exports = ffmpeg
