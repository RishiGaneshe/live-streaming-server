const express= require('express')
const path= require('path')
const OfflineVideos= require('./routes/offileneVideos.routes')
const Pages= require('./routes/servePages.routes')
const { handleRTMPfunctions }= require('./configs/rtmp.config')
const { WebSocketServer } = require('ws')
const http = require('http')
const { handleWebSocketConnection }= require('./configs/websocket.config')



const app= express()
const server= http.createServer(app)
const wss = new WebSocketServer({
    server, 
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
})

const PORT= 7010

handleRTMPfunctions()
handleWebSocketConnection(wss)

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use('/videos', express.static(path.join(__dirname, 'videos')))

app.use("/", Pages)
app.use("/", OfflineVideos)


server.listen(PORT,()=>{   
    console.log(`Server started on ${PORT}` )
})


