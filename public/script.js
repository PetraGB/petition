var sigCanvas = document.getElementById("sigCanvas");
var sigCtx = sigCanvas.getContext("2d");

var submitSig = document.getElementById("submitSig");

var signing = false;

var startX;
var startY;
sigCanvas.addEventListener("mousedown", function(e) {
    signing = true;
    startX = e.pageX - sigCanvas.offsetLeft;
    startY = e.pageY - sigCanvas.offsetTop;
});

sigCanvas.addEventListener("mousemove", function(e) {
    var newX = e.pageX - sigCanvas.offsetLeft;
    var newY = e.pageY - sigCanvas.offsetTop;
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

submitSig.addEventListener("mousedown", function() {
    // turning canvas into data url
    var signature = sigCanvas.toDataURL();
    // hidden field for signature
    var signatureField = document.getElementById("signatureField");
    signatureField.value = signature;
});
