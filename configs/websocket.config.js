const { spawn } = require('child_process')
const { rtmp_live_server_name, rtmp_domain_name, ffmpegPath, ffmpegLinuxPath }= require('./domain.config')



exports.handleWebSocketConnection= async(wss)=>{
    try{
        wss.on('connection', function connection(ws) {
            console.log('🔌 WebSocket connected')
           
            const ffmpeg = spawn(ffmpegPath, [
                '-fflags', 'nobuffer',
                '-flags', 'low_delay',
                '-strict', 'experimental',
                '-re',
                '-i', '-',                             // Input from stdin
                '-c:v', 'libx264',                     // Video codec
                '-preset', 'ultrafast',
                '-tune', 'zerolatency',
                '-pix_fmt', 'yuv420p',
                '-profile:v', 'main',
                '-g', '30',                            // GOP size, tune for your FPS
                '-keyint_min', '30',
                '-sc_threshold', '0',
                '-c:a', 'aac',                         // Audio codec
                '-b:a', '128k',
                '-ar', '44100',
                '-f', 'flv',
                `${rtmp_domain_name}/live/teacher123`
              ])

              ffmpeg.stderr.on('data', (data) => {
                console.log('FFmpeg stderr:', data.toString())
              })
            
              ffmpeg.on('close', code => {
                console.log(`[FFmpeg] Process exited with code ${code}`)
              })
            
              ws.on('message', function incoming(data) {
                if (ffmpeg.stdin.writable) {
                  ffmpeg.stdin.write(data)
                }
              })
            
              ws.on('close', () => {
                console.log('[WS] Client disconnected')
                if (!ffmpeg.killed) {
                  ffmpeg.stdin.end()
                  ffmpeg.kill('SIGINT')
                }
              })
            
              ws.on('error', (err) => {
                console.error('[WS] Error:', err)
                if (!ffmpeg.killed) {
                  ffmpeg.stdin.end()
                  ffmpeg.kill('SIGINT')
                }
              })
        })

    }catch(err){
        console.log(err)
    }
}