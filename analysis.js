/* retrieve parameter */
function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

const isAdmin = (findGetParameter("admin") === 'true');
const name = findGetParameter("name");

if (!isAdmin) {
    let admin_elements = document.getElementsByClassName("admin");
    for (var i = admin_elements.length - 1; i >= 0; --i) {
        admin_elements[i].remove();
    }
}

/* html variables */

const instantMeter = document.querySelector('#instant meter');
const instantValueDisplay = document.querySelector('#instant .value');

const constraints = window.constraints = {
    audio: true,
    video: false
};


/* sound meter */

let meterRefresh = null;

function SoundMeter(context) {
    this.context = context;
    this.instant = 0.0;
    this.script = context.createScriptProcessor(2048, 1, 1);
    const that = this;
    this.script.onaudioprocess = function(event) {
        const input = event.inputBuffer.getChannelData(0);
        let i;
        let sum = 0.0;
        let clipcount = 0;
        for (i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
            if (Math.abs(input[i]) > 0.99) {
                clipcount += 1;
            }
        }
        that.instant = Math.sqrt(sum / input.length);
    };
}

SoundMeter.prototype.connectToSource = function(stream, callback) {
    console.log('SoundMeter connecting');
    try {
        this.mic = this.context.createMediaStreamSource(stream);
        this.mic.connect(this.script);
        // necessary to make sample run, but should not be.
        this.script.connect(this.context.destination);
        if (typeof callback !== 'undefined') {
            callback(null);
        }
    } catch (e) {
        console.error(e);
        if (typeof callback !== 'undefined') {
            callback(e);
        }
    }
};

function handleSoundMeterSuccess(stream) {
    // Put variables in global scope to make them available to the
    // browser console.
    window.stream = stream;
    const soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
    soundMeter.connectToSource(stream, function(e) {
        if (e) {
            alert(e);
            return;
        }
        meterRefresh = setInterval(() => {
            instantMeter.value = instantValueDisplay.innerText =
                soundMeter.instant.toFixed(2);
        }, 200);
    });
}

function handleSoundMeterError(error) {
    console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}


console.log('Requesting local stream');

try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audioContext = new AudioContext();
} catch (e) {
    alert('Web Audio API not supported.');
}

navigator.mediaDevices
    .getUserMedia(constraints)
    .then(handleSoundMeterSuccess)
    .catch(handleSoundMeterError);



/* sound loop back */
var soundOn = false;
const toggle = document.getElementById("loopback-toggle");
const player = document.getElementById('player');

console.log("loopback initializing")

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

navigator.mediaDevices.getUserMedia(constraints).then(handleLoopbackSuccess).catch(handleLoopbackError);

toggle.addEventListener("click", function (){
    if (soundOn) {
        soundOn = false;
        toggle.setAttribute("class", "fa-solid fa-toggle-off");
        player.pause();
    } else {
        soundOn = true;
        toggle.setAttribute("class", "fa-solid fa-toggle-on");
        player.play();
    }
})

var vm = new Vue({
    el: "#app",
    data: {
        values: [
            [ "/index.jsp", 100, 1000 ],
            [ "/home.jsp", 70, 2000 ],
            [ "/admin.jsp", 30, 3000 ],
            [ "/test/a.jsp", 5, 8000 ],
            [ "/test/b.jsp", 50, 5000 ],
            [ "/test/c.jsp", 1, 10000 ],
            [ "/test/d.jsp", 1, 1000 ]
        ],
        colors: function(data) {
            if (data[2] <= 3000) {
                return '#497eff';
            } else if (data[2] <= 7000) {
                return '#ffdd26';
            } else {
                return '#ff4f55';
            }
        },
        styles: {
            titleFontSize: 15,
            titleFontWeight: 'bold'
        }
    },
    methods: {
        onClickEvent: function(obj, e) {
            console.log(obj.data);
        }
    }
});

/* etiquette submission */
const inputEtiquette = document.getElementById("inputEtiquette");
const submitEtiquette = document.getElementById("submit-etiquette");


function etiquette_submission_handler() {
    console.log("submit etiquette by etiquette_submission_handler");
}

submitEtiquette.addEventListener("click", function() {
    if (inputEtiquette.value != '') {
        etiquette_submission_handler();
    }
})
