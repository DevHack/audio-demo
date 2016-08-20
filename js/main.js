/**
 * Created by debayan.das on 19-07-2016.
 */
// Globals
import WebAudio from "./web-audio"

console.log("beginning of mainjs")
var iFrameSource = "baserootsco/playerdev.html?tc=y";
var isDirty = false;
var currentPageNumber;
var requestedPageNumber = null;
var iframe;


// Ready
$(document).ready(function() {
    var urlBase="";
    var audioSeq = ["audio1.mp3", "audio2.mp3"];
    var startTime;
    var isStarted = false;
    var totalStart = 0;
    var totalEnd=0;
    //-------------------- code for Kyle's method that doesn't want to work on mobile devices
    var audioDiv = $('#audiofiles');
    var tempId=0;

    for(var i=0; i < audioSeq.length; i++) {
        audioDiv.append('<audio id="player'+i+'" controls preload>\n<source src="'+urlBase+audioSeq[i]+'" type="audio/mpeg">\n</audio>');
        var temp = $('#player'+i);

        temp.on("playing", function() {
            if (isStarted === false) {
                totalStart = 0;
                totalEnd = 0;
                isStarted = true;
                startTime = Date.now();
                console.log("start time")
            }
            totalStart += (Date.now() - startTime);
            console.log("start " + (Date.now() - startTime))
        });

        temp.on("ended", function() {
            totalEnd += Date.now() - startTime;
            console.log("end " + (Date.now() - startTime))
            if (++tempId < audioSeq.length) {
                var temp2= $('#player'+ tempId);
                temp2[0].play();
            } else {
                console.log("total play time is "+ (totalEnd - totalStart) +"ms");
                var endTime = Date.now();
                var time = endTime - startTime;
                console.log("Total in seconds player 2 " + time + "ms")
                console.log("delay is: "+(time - (totalEnd - totalStart))+"ms");
                alert("delay is: "+(time - (totalEnd - totalStart))+"ms");
                tempId = 0;
                isStarted = false;
            }
        });
    }

    //---------------------------Debayan's code for ipad
    var audioLoadStartTime = null,
        audioLoadEndTime = null,
        audioLoadTotalTime = null,
        startIndex = 0,
        sound = {},
        gainNode,
        myAudioContext,
        webAudioPlugin = true;

    if (typeof AudioContext !== 'undefined') {
        myAudioContext = new AudioContext();
    } else if (typeof webkitAudioContext !== 'undefined') {
        myAudioContext = new webkitAudioContext();
    } else {
        webAudioPlugin = false;
    }

    if (webAudioPlugin) {
        if (typeof myAudioContext.createGainNode === "undefined") {
            gainNode = myAudioContext.createGain();
        }
        else {
            gainNode = myAudioContext.createGainNode();
        }
    };
    var x = new WebAudio();
    x.setAudioContext();
    x.setAudioFiles(audioSeq);
    $("#loadAllFiles").on("click", function(){
        x.loadAudioFiles();
    });
    $("#playAudio").on("click", function(){
        startIndex = 0 ;
        x.playAudio(startIndex, completeCallBack);
    });
    function completeCallBack(){
        if(startIndex < audioSeq.length){
            x.playAudio(++startIndex, completeCallBack);
        }else{
            alert("complete");
        }
    }
    var playList = {}, currentID;
    function playAudio(index , onComplete){
        if (webAudioPlugin) {
            currentID = audioSeq[index];
            if (typeof sound[audioSeq[index]] !== "undefined") {
                var source = myAudioContext.createBufferSource();
                source.buffer = sound[audioSeq[index]];
                source.connect(gainNode);
                gainNode.connect(myAudioContext.destination);
                playList[currentID] = source;
                playList[currentID].totalDuration = sound[audioSeq[index]].duration * 1000;
                if (typeof source.start !== "undefined") {
                    source.start(0);
                }
                else {
                    source.noteOn(0);
                }

                sound[currentID].presentTime = myAudioContext.currentTime;

                if (typeof onComplete !== "undefined") {
                    playList[currentID].onCompleteFn = onComplete;
                    playList[currentID].onComplete = setTimeout(function () {
                        playList[currentID].onCompleteFn();
                    }, playList[currentID].totalDuration);
                }
            }
        }
    }

    function loadAudioFiles(index){
        if(startIndex < audioSeq.length){
            var request = new XMLHttpRequest();
            request._soundName = urlBase+audioSeq[index];
            sourcePath = urlBase+audioSeq[index];
            request.open('GET', sourcePath, true);
            request.responseType = 'arraybuffer';
            request.classer = this;
            temp = this;
            request.addEventListener('load', function(e){
                currentSoundComplete(e,request);
            });
            request.addEventListener('error', function(e){
                currentSoundComplete(e ,request);
            });
            request.send();
        }else{
            audioLoadEndTime = Date.now();
            alert("sound load complete in "+(audioLoadEndTime - audioLoadStartTime));
        }

    }

    function currentSoundComplete(event, soundTag){
        myAudioContext.decodeAudioData(soundTag.response,onAudioDecoded);
    }

    function onAudioDecoded(buffer,soundTag){
        sound[audioSeq[startIndex]] = buffer;
        startIndex++;
        loadAudioFiles(startIndex);
        soundTag = undefined;
    }
});

