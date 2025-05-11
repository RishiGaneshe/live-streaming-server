const { parentPort, workerData }= require('worker_threads')
const path= require('path')
const fs= require('fs')
const ffmpeg = require('../configs/ffmpeg.config')


const resolutions = [
            { name: '240p', width: 426, height: 240, bitrate: '500k' },
            { name: '360p', width: 640, height: 360, bitrate: '800k' },
            { name: '480p', width: 854, height: 480, bitrate: '1400k' },
            { name: '720p', width: 1280, height: 720, bitrate: '2800k' },
            { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' }
        ]

function transcodeResolution(inputPath, outputDir, res) {
    return new Promise((resolve, reject) => {
        const outputPlaylist = path.join(outputDir, `${res.name}.m3u8`)
        ffmpeg(inputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .addOption('-preset', 'fast')
        .addOption('-crf', '23')
        .size(`${res.width}x${res.height}`)
        .outputOptions([
            '-hls_time', '10',
            '-hls_list_size', '0',
            '-hls_segment_filename', path.posix.join(outputDir, `${res.name}_%03d.ts`)
        ])
            
        .output(outputPlaylist)
        .on('end', resolve)
        .on('error', reject)
        .run()
    })
}

module.exports= async( { inputPath, filename, outputDir })=>{
    try {
        console.log('Video Transcoding Starts.')
        await Promise.all(resolutions.map(res => transcodeResolution(inputPath, outputDir, res)))

        let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n'
        resolutions.forEach(res => {
          const resolutionText = `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(res.bitrate.replace('k', '')) * 1000},RESOLUTION=${res.width}x${res.height}\n${res.name}.m3u8\n`
          masterPlaylist += resolutionText
        })
    
        fs.writeFileSync(path.join(outputDir, 'master.m3u8'), masterPlaylist)
        return { status: 'done', playlist: `/videos/${filename}/master.m3u8` }

      } catch (err) {
        console.error(`Transcoding failed.`, err.message)
        return { status: 'false', message: `Transcoding failed.` }
      }
}

