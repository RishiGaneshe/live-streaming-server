const path= require('path')


exports.handleGetHtmlVideoPage= async(req, res)=>{
    try{
        const file= path.resolve(__dirname, '..', 'pages', 'A.html')
        return res.status(200).sendFile(file)
    }catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message : 'Internal Server Error'})
    }
}


exports.handleGetHtmlVideoUploadPage= async(req, res)=>{
    try{
        const file= path.resolve(__dirname, '..', 'pages', 'sendVideo.html')
        return res.status(200).sendFile(file)
    }catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message : 'Internal Server Error'})
    }
}


exports.handleGetHtmlm3u8VideoPage= async(req, res)=>{
    try{
        const file= path.resolve(__dirname, '..', 'pages', 'm3u8.video.html')
        return res.status(200).sendFile(file)
    }catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message : 'Internal Server Error'})
    }
}


exports.handleGetWebCamUploadPage= async(req, res)=>{
    try{
        const file= path.resolve(__dirname, '..', 'pages', 'WebCam.html')
        return res.status(200).sendFile(file)
    }catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message : 'Internal Server Error'})
    }
}