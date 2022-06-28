const player = document.getElementById('player');

const constraints = window.constraints = {
    audio: true,
    video: false
};

function handleLoopbackSuccess(stream) {
    const audioTracks = stream.getAudioTracks();
    console.log('Got stream with constraints:', constraints);
    console.log('Using audio device: ' + audioTracks[0].label);
    stream.oninactive = function() {
        console.log('Stream ended');
    };
    window.stream = stream; // make variable available to browser console
    player.srcObject = stream;
}

function handleLoopbackError(error) {
    const errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
    document.getElementById('errorMsg').innerText = errorMessage;
    console.log(errorMessage);
}