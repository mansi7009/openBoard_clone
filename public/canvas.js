let canvas = document.querySelector("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let penciltoolCont = document.querySelector(".pencil-tool-cont");
let pencilColor = document.querySelectorAll(".pencil-color");
let eraserWidthEle = document.querySelector(".eraser-width");
let pencilWidthEle = document.querySelector(".pencil-width");
let Eraser = document.querySelector(".eraser");
let download = document.querySelector(".download");
let upload_ = document.querySelector(".upload");

let undoredotracker = [];  // data 
let track = 0;  // keep the track of current operation/action from undoredo array
let undo = document.querySelector(".undo");
let redo = document.querySelector(".redo");

let EraserFlag = false;
let mouseDown = false;

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilColor.value;
let eraserWidth = eraserWidthEle.value;
//API - application protocol interface
let tool = canvas.getContext("2d");
// tool.clearRect(0, 0, canvas.width, canvas.height);
tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

//mousedown -> start new path,mousemove fill the path ( or graphics)
canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    // beginPath({

    //     color : EraserFlag? eraserColor:penColor,
    //     width: EraserFlag? eraserWidth: penWidth
    // });
    let data = {
        x: e.clientX,
        y: e.clientY
    }
    //send data to server
    socket.emit("beginPath", data);
});

canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;

    //updating the current operation in array
    let url = canvas.toDataURL();
    undoredotracker.push(url);
    // console.log(undoredotracker[track]);
    track = undoredotracker.length - 1;
    // console.log(track +" uhusahcsa");
});

canvas.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        let data = {
            x: e.clientX,
            y: e.clientY,
            color: EraserFlag ? eraserColor : penColor,
            width: EraserFlag ? eraserWidth : penWidth
        }
        socket.emit("drawStroke",data);
    }
})

function beginPath(strokeObj) {
    tool.beginPath();
    tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y);
    tool.stroke();
}

pencilColor.forEach((colorEle) => {
    colorEle.addEventListener("click", (e) => {
        let color = colorEle.classList[1];
        console.log(color);
        penColor = color;
        tool.strokeStyle = penColor;
    })
});

pencilWidthEle.addEventListener("change", (e) => {
    penWidth = pencilWidthEle.value;
    tool.lineWidth = penWidth;
});

eraserWidthEle.addEventListener("change", (e) => {
    eraserWidth = eraserWidthEle.value;
    tool.lineWidth = eraserWidthEle;
});

Eraser.addEventListener("click", (e) => {
    EraserFlag = !EraserFlag;
    if (EraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    } else {
        tool.strokeStyle = penColor;
        tool.lineWidth = eraserWidth;
    }
});

download.addEventListener("click", (e) => {
    let url = canvas.toDataURL();
    console.log(url);
    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

undo.addEventListener("click", (e) => {
    if (track > 0) track--;
    let trackObj = {
        trackValue: track,
        undoredotracker : undoredotracker
    }
    // console.log(undoredotracker);
    socket.emit("redoUndo",trackObj);
    // undoRedoCanvas(trackObj);
});

redo.addEventListener("click", (e) => {
    // console.log(e.target.value)
    if (track < undoredotracker.length - 1)
        track++;
    let trackObj = {
        trackValue: track,
        undoredotracker
    }
    // console.log(undoredotracker[track]);
    // undoRedoCanvas(trackObj);
    socket.emit("redoUndo",trackObj);
});

function undoRedoCanvas(trackObj) {
    track = trackObj.trackValue;
    undoredotracker = trackObj.undoredotracker;
    
    let url = undoredotracker[track];
    // console.log(track);
    // console.log(trackObj);
    // console.log(url+ "==========/=====sncjkskjchsac");
    let img = new Image();  // new image reference element
    img.src = url;
    // console.log(img.src);
    img.addEventListener("load",()=>{
        tool.clearRect(0, 0, canvas.width, canvas.height);
        tool.drawImage(img, 0, 0, canvas.width, canvas.height,0,0,canvas.width,canvas.height);
    })
    // img.onload = () => {
    //     tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    // }
}

// recieved the data from server
socket.on("beginPath",(data)=>{
    beginPath(data);
});

socket.on("drawStroke",(data)=>{
    drawStroke(data);
});

socket.on("redoUndo",(data)=>{
    undoRedoCanvas(data);
})
