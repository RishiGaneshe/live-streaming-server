const ffmpeg = require('fluent-ffmpeg')
const { ffmpegPath, ffmpegProbeLinuxPath, ffmpegProbe, ffmpegLinuxPath}= require('./domain.config')

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffmpegProbe)


module.exports = ffmpeg
