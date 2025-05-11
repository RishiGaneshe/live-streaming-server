const path= require('path')
const fs= require('fs')
const ffmpeg= require('../configs/ffmpeg.config')
const { Worker }= require('worker_threads')
const Piscina= require('piscina')


const piscina= new Piscina({
    filename: path.resolve(__dirname, '..', 'workers', 'transcodeWorker.js' ),
    maxThreads: 4
})


exports.handleGetOfflineVideoStream= async(req, res)=>{
    try{
        const filePath= path.resolve(__dirname, '..','videos', req.params.filename)
        if(!fs.existsSync(filePath)){
            return res.status(404).json({ success: false, message : 'File not found'})
        }

        const stat= fs.statSync(filePath)
        const fileSize= stat.size
        const range= req.headers.range
            if (!range || !range.startsWith('bytes=')) {
                return res.status(416).send('Range header missing or malformed')
            }

        const [startStr, endStr] = range.replace(/bytes=/, '').split('-')
        const start = parseInt(startStr, 10)
        const end = endStr ? parseInt(endStr, 10) : fileSize - 1

            if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
                return res.status(416).send('Range Not Satisfiable')
            }
        
        const chunkSize = end - start + 1
        const stream = fs.createReadStream(filePath, { start, end })

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        })

        stream.pipe(res).on('error', (err) => {
            console.error('Stream error:', err)
            res.status(500).end('Stream failed')
        })

    }catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message : 'Internal Server Error'})
    }
}


exports.handleVideoResolution= async(req, res)=>{
    try{
        const inputPath = req.file.path
        const filename = path.parse(req.file.filename).name
        const outputDir = path.join(__dirname, '..', 'videos', filename)

        fs.mkdirSync(outputDir, { recursive: true })
        const resolutions = [
            { name: '240p', width: 426, height: 240, bitrate: '500k' },
            { name: '360p', width: 640, height: 360, bitrate: '800k' },
            { name: '480p', width: 854, height: 480, bitrate: '1400k' },
            { name: '720p', width: 1280, height: 720, bitrate: '2800k' },
            { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' }
        ]

        const transcodeResolution = (res) =>
            new Promise((resolve, reject) => {
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
                    '-hls_segment_filename', path.join(outputDir, `${res.name}_%03d.ts`).replace(/\\/g, '/')
                  ])
                  
                .output(outputPlaylist)
                .on('end', resolve)
                .on('error', reject)
                .run()
            })

        for (const res of resolutions) {
            console.log("Transcoding Start.")
            await transcodeResolution(res)
        }

        let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n'
        resolutions.forEach(res => {
            const resolutionText = `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(res.bitrate) * 1000},RESOLUTION=${res.width}x${res.height}\n${res.name}.m3u8\n`
            masterPlaylist += resolutionText
        })
          
        fs.writeFileSync(path.join(outputDir, 'master.m3u8'), masterPlaylist)
        console.log('Video transcoded successfully')

        return res.status(201).json({ success: true, message: 'Video transcoded successfully', playlist_url: `/videos/${filename}/master.m3u8` })

    }catch(err){
        console.error(err)
        return res.status(500).json({ success: false, message: 'Transcoding failed' })
    }
}


exports.handleVideoResolutionWithWorkerThreads= async(req, res)=>{
    try{
        const inputPath = req.file.path
        const filename = path.parse(req.file.filename).name
        const outputDir = path.join(__dirname, '..', 'videos', filename)

        fs.mkdirSync(outputDir, { recursive: true })

        const result= await piscina.run({ inputPath, filename, outputDir })

        if (result.status === 'done') {
            console.log('Video transcoded successfully')
            return res.status(201).json({ success: true, message: 'Video transcoded successfully', playlist_url: result.playlist })
        } else {
            return res.status(500).json({ success: false, message: 'Unknown error during transcoding' })
        }

    }catch(err){
        console.error('Main thread error:', err)
        return res.status(500).json({ success: false, message: 'Transcoding failed' })
    }
}