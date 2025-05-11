const express= require('express')
const router= express.Router()
const VIDEOS= require('../controllers/videos.controller')
const { upload }= require('../configs/multer.config')



router.get("/video-stream/:filename", VIDEOS.handleGetOfflineVideoStream)

router.post("/video-transcoding", upload.single('video'), VIDEOS.handleVideoResolution )

router.post("/video-transcoding-ww", upload.single('video'), VIDEOS.handleVideoResolutionWithWorkerThreads )



module.exports= router