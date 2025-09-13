var videoBG = null;

window.addEventListener("load", function(){
    var video = document.createElement("video");
    video.id = "background-video";
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.style.animation = "bgIn 1.0s ease-in-out";
    var source = document.createElement("source");
    source.src = "../vid/Background.mp4";
    source.type = "video/mp4";
    video.appendChild(source);
    document.body.appendChild(video);
    videoBG = document.getElementById("background-video");
    videoBG.play();
},false)