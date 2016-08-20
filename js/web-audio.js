/**
 * Created by debayan.das on 20-07-2016.
 */
export default class WebAudio{
    constructor(){
        this._soundNodes = {};
        this._audioContext = null;
        this._gainNode = null;
        this._isWebAudioEnabled = true;
        this._audioFiles = [];
        this._playList = {};
    }
    setAudioFiles(audioFiles){
        this._audioFiles = audioFiles;
    }
    setAudioContext(){
        if (typeof AudioContext !== 'undefined') {
            this._audioContext = new AudioContext();
        } else if (typeof webkitAudioContext !== 'undefined') {
            this._audioContext = new webkitAudioContext();
        } else {
            this._isWebAudioEnabled = false;
        }
        this.setGainNode();
    }
    setGainNode(){
        if (typeof this._audioContext.createGainNode === "undefined") {
            this._gainNode = this._audioContext.createGain();
        }
        else {
            this._gainNode = this._audioContext.createGainNode();
        }
    }
    loadAllAudioFiles(){
        if(this._audioFiles.length === 0){
            throw new Error("audio file list is empty");
        }
        this.loadAudioFileFromIndex(0);
    }
    loadAudioFileFromIndex(index){
        if(index < this._audioFiles.length){
            let request = new XMLHttpRequest();
            this._soundName = this._audioFiles[index];
            request.open('GET', request._soundName, true);
            request.responseType = 'arraybuffer';
            request.addEventListener('load', (e) =>{
                this.currentSoundComplete(e,request);
            });
            request.addEventListener('error', (e) =>{
                console.error("Error loading audioFile "+ this._soundName);
                console.error("Error message "+ e.message);
                this.currentSoundComplete(e ,request);
            });
            request.send();
        }else{
            console.info("all files loaded!")
        }
    }
    currentSoundComplete(event, soundTag){
        this._audioContext.decodeAudioData(soundTag.response,this.onAudioDecoded);
    }
    onAudioDecoded(buffer,soundTag){
        this._soundNodes[this._soundName] = buffer;
        let currentSoundIndex = this._audioFiles.indexOf(this._soundName);
        this.loadAudioFileFromIndex(++currentSoundIndex);
        soundTag = undefined;
    }

    completeCallBack() {
        if (startIndex < audioSeq.length) {
            playAudio(++startIndex, completeCallBack);
        } else {
            alert("complete");
        }
    }
    playAudio(index , onComplete){
        let currentAudioFile = this._audioFiles[index];
        if (typeof this._soundNodes[currentAudioFile] !== "undefined") {
            var source = this._audioContext.createBufferSource();
            source.buffer = this._soundNodes[currentAudioFile];
            source.connect(this._gainNode);
            this._gainNode.connect(this._audioContext.destination);
            this._playList[currentAudioFile] = source;
            this._playList[currentID].totalDuration = this._soundNodes[currentAudioFile].duration * 1000;
            source.start ? source.start(0):source.noteOn(0);
            this._soundNodes[currentAudioFile].presentTime = this._audioContext.currentTime;

            if (typeof onComplete !== "undefined") {
                this._playList[currentAudioFile].onCompleteFn = onComplete;
                this._playList[currentAudioFile].onComplete = setTimeout(function () {
                    this._playList[currentAudioFile].onCompleteFn();
                },this._playList[currentAudioFile].totalDuration);
            }
        }
    }
}