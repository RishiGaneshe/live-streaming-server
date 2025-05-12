const NodeMediaServer = require('node-media-server')
const { ffmpegPath, hlsPath, hlsPathLinux, ffmpegLinuxPath }= require('./domain.config')


const config = {
        rtmp: {
          port: 1936,
          chunk_size: 60000,
          gop_cache: true,
          ping: 30,
          ping_timeout: 60
        },
        http: {
          port: 5000,  
          allow_origin: '*',
          mediaroot: './media'
        },
        auth: {
          play: false,     
          publish: false, 
          secret: 'supersecret' 
        },
        trans: {
          ffmpeg: ffmpegPath,
          tasks: [
            {
              app: 'live',
              hls: true,
              hlsFlags: '[hls_time=1:hls_list_size=2:hls_flags=delete_segments+omit_endlist]',
              hlsKeep: true,
              hlsPath: hlsPath,
              vc: null,
              ac: null,
              rtmp: true,
              hlsVariant: []
            }
          ]
        }
  }


exports.handleRTMPfunctions=async ()=>{
  try{
      const nms = new NodeMediaServer(config)

      // nms.on('prePublish', async (id, StreamPath, args) => {
      //   const session = nms.getSession(id);
      //   const streamKey = StreamPath.split('/').pop()
        
      //   console.log(`[RTMP PUBLISH] ID=${id} StreamKey=${streamKey} Args=`, args)
      
      //   const validKeys = ['mystream', 'teacher123', 'event_stream'];
      
      //   if (!validKeys.includes(streamKey)) {
      //     console.log('[AUTH REJECTED] Invalid stream key')
      //     session.reject()
      //   }
      // })

      nms.run()
    }catch(err){
      console.log('error in the RTMP config functions', err)
    }
}
  
