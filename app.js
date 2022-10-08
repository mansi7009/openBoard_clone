const express = require('express'); //access
const socket = require('socket.io');
const app = express(); //initialize the app and server ready
app.use(express.static("public"));  // index.html is the static file which will be renderred 
let port = process.env.PORT ||  8080;
let server = app.listen(port,(e)=>{
    console.log("listening to port"+ port);
})

let io = socket(server);

io.on("connection",(socket)=>{
    console.log("socket connection established");  // socket boradcasts the data to all the connected nodes
    // received data
    socket.on("beginPath",(data)=>{
        //now broadcast it
        io.sockets.emit("beginPath",data);
    });
    
    socket.on("drawStroke",(data)=>{
        io.sockets.emit("drawStroke",data);
    })
    socket.on("redoUndo",(data)=>{
        io.sockets.emit("redoUndo",data);
    })
});




