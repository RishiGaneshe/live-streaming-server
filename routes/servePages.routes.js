const express= require('express')
const router= express.Router()
const PAGES= require('../controllers/htmlpages.controller')


router.get("/get-videos", PAGES.handleGetHtmlVideoPage)

router.get("/post-video", PAGES.handleGetHtmlVideoUploadPage)

router.get("/m3u8-video", PAGES.handleGetHtmlm3u8VideoPage)

router.get("/web-cam", PAGES.handleGetWebCamUploadPage)


module.exports= router