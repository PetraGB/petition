var sigCanvas = document.getElementById("sigCanvas");
var sigCtx = sigCanvas.getContext("2d");

var signing = false;

var startX;
var startY;
sigCanvas.addEventListener("mousedown", function(e) {
    signing = true;
    startX = e.clientX - sigCanvas.offsetLeft;
    startY = e.clientY - sigCanvas.offsetTop;
});

sigCanvas.addEventListener("mousemove", function(e) {
    var newX = e.clientX - sigCanvas.offsetLeft;
    var newY = e.clientY - sigCanvas.offsetTop;
    if (signing == true) {
        sigCtx.beginPath();
        sigCtx.strokeStyle = "black";
        sigCtx.lineWidth = 3;
        sigCtx.moveTo(startX, startY);
        sigCtx.lineTo(newX, newY);
        sigCtx.stroke();
    }
    startX = newX;
    startY = newY;
});

sigCanvas.addEventListener("mouseup", function() {
    signing = false;
});
sigCanvas.addEventListener("mouseleave", function() {
    signing = false;
});