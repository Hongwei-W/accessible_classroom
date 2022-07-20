import { postHandler, getHandler, formEncoding, accessible_classroom_general_gsheet, accessible_classroom_message_gsheet } from './features/utilitiesREST.js';
import { removeAllChildNodes } from "./features/utilitiesDOM.js";
import {findGetParameter, redColors, removeElements, WPM} from "./features/utilities.js";
import { SoundMeter } from "./features/soundmeter.js";
import { chatSpeakoutNotifyRetrieveHandler, chatSpeakoutNotifySubmissionHandler } from "./features/chatSpeakout.js";
import {
    arrangeSpeakingDuration,
    recentSpokenRetrieveHandler,
    totalDuration
} from "./features/speakDuration.js";
import {
    durationRetrieveHandler,
    durationSubmissionHandler,
    startStopwatch,
    stopStopwatch, sumDuration
} from "./features/speakDuration.js";
import {Stopwatch} from "./features/stopwatch.js";
/* retrieve parameter */

const isAdmin = (findGetParameter("admin") === 'true');
const name = findGetParameter("name");
const tabId = parseInt(findGetParameter('tabId'));

export {name, tabId};

if (!isAdmin) {removeElements(document.getElementsByClassName("admin"));}

chrome.tabs.sendMessage(tabId, {type: "initialize", expectingStatus: 'on'}, function (response) {
    console.log(response.success);
});


/* speech recognition */

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.lang = 'en-US';

let recognitionOn = false;

recognition.onstart = function() {
    console.log('Voice recognition activated. Try speaking into the microphone.');
    recognitionOn = true;
    startStopwatch();
}

recognition.onspeechend = function() {
    console.log('You were quiet for a while so voice recognition turned itself off.');
    recognitionOn = false;
}

recognition.onerror = function(event) {
    if(event.error == 'no-speech') {
        console.log('No speech was detected. Try again.');
        recognitionOn = false;
    };
}

recognition.onresult = function(event) {

    let current = event.resultIndex;
    let transcript = event.results[current][0].transcript;
    console.log(transcript);
    stopStopwatch(transcript.split(' ').length);
}


/* sound meter */

const instantMeter = document.querySelector('#instant meter');
const instantValueDisplay = document.querySelector('#instant .value');

const constraints = window.constraints = {
    audio: true,
    video: false
};

let meterRefresh = null;
let meterStopWatch = null;
let speaking = false;

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
            instantMeter.value = (soundMeter.slow).toFixed(2);
            instantMeter.value = (soundMeter.slow * 20).toFixed(2);
        }, 200);
        meterStopWatch = setInterval(() => {
            let instantVolume = soundMeter.instant.toFixed(2);
            if (instantVolume > 0.01 && !speaking) {
                if (!recognitionOn) {recognition.start();}
            }
        }, 100);
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



if (isAdmin) {

    /* Set "notify speakout" */

    let notifySpeakoutAdmin = false;
    const chatToggle = document.getElementById("chat-toggle");
    chatToggle.addEventListener("click", function () {
        if (notifySpeakoutAdmin) {
            notifySpeakoutAdmin = false;
            chatToggle.setAttribute("class", "fa-solid fa-toggle-off");
            chatSpeakoutNotifySubmissionHandler(false);
        } else {
            notifySpeakoutAdmin = true;
            chatToggle.setAttribute("class", "fa-solid fa-toggle-on");
            chatSpeakoutNotifySubmissionHandler(true);
        }
    })

    chatSpeakoutNotifySubmissionHandler(false);
}

// no matter if is admin or not
let retrieve_chatSpeakoutNotify = setInterval(function () {
    chatSpeakoutNotifyRetrieveHandler();
}, 1000)

//use in developing
// document.getElementById('chatSpeakoutNotify').addEventListener('click', function () {
//     chatSpeakoutNotifyRetrieveHandler();
// })


/* sound loop back */
let soundOn = false;
const loopbackToggle = document.getElementById("loopback-toggle");
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

loopbackToggle.addEventListener("click", function (){
    if (soundOn) {
        soundOn = false;
        loopbackToggle.setAttribute("class", "fa-solid fa-toggle-off");
        player.pause();
    } else {
        soundOn = true;
        loopbackToggle.setAttribute("class", "fa-solid fa-toggle-on");
        player.play();
    }
})


/* etiquette submission */
console.log("etiquette submission initializing");

const inputEtiquette = document.getElementById("input-etiquette");
const submitEtiquette = document.getElementById("submit-etiquette");
const promptEtiquette = document.getElementById("prompt-etiquette");
const pendingEtiquetteRow = document.getElementById("pending-etiquette-row");
const approvedEtiquetteRow = document.getElementById("approved-etiquette-row");

function etiquetteSubmissionHandler() {

    let details = {
        'sheet': 'etiquette',
        'etiquetteSuggested': inputEtiquette.value,
        'isPending': true,
        'isRejected': false,
        'upvote': 0,
        'operation': 'submit'
    }
    let formBody = formEncoding(details);

    postHandler(accessible_classroom_general_gsheet, formBody)
        .then(function(data){
            console.log(data);
            inputEtiquette.value = '';
            let statusIndicateMsg = 'Submit Succeeded, etiquette pending';
            submitStatusIndicator(promptEtiquette, statusIndicateMsg);

        })
        .catch(function(error) {
            console.log(error);
            let statusIndicateMsg = 'Submit failed, please try again';
            submitStatusIndicator(promptEtiquette, statusIndicateMsg);

        })
}

submitEtiquette.addEventListener("click", function() {
    if (inputEtiquette.value != '') {
        etiquetteSubmissionHandler();
    }
})

function submitStatusIndicator(node, successMsg) {

    let original_content = node.textContent;
    node.textContent = successMsg;
    let interval = window.setTimeout(function() {
            node.textContent = original_content;
        },
        2000)
}


/* retrieve etiquette from gsheet */

let retrieve_etiquette_from_gsheet = setInterval(function () {
    getHandler(accessible_classroom_general_gsheet + '?sheet=etiquette')
        .then(function(data){
        arrangeEtiquette(data);
        })
        .catch(function(error) {
            console.log(error);
        })
}, 2000)

// used for developing
// document.getElementById('test').addEventListener('click', function () {
//     getHandler(accessible_classroom_general_gsheet + '?sheet=etiquette')
//         .then(function(data){
//         arrangeEtiquette(data);
//         })
//         .catch(function(error) {
//             console.log(error);
//         })
// })

function arrangeEtiquette(data) {
    let pending_list = new Array();
    let approved_list = new Array();

    let data_len = data.length;
    for (let i = 1; i < data_len; i++) {
        if (data[i][1] && data[i][5] == false) {
            pending_list.push(data[i]);
        } else if (data[i][1] == false) {
            approved_list.push(data[i])
        }
    }

    if (isAdmin) {
        removeAllChildNodes(pendingEtiquetteRow);

        for (let i = 0; i < pending_list.length; i++) {

            let col_div = document.createElement("div");
            col_div.className = "col-auto etiquette-each";
            let span_etiquette = document.createElement("span");
            span_etiquette.className = "etiquette-sentence";
            span_etiquette.textContent = pending_list[i][3];
            let icon_approve = document.createElement("i");
            icon_approve.className = "fa-solid fa-check";
            let icon_reject = document.createElement("i");
            icon_reject.className = "fa-solid fa-xmark";

            col_div.append(span_etiquette, icon_approve, icon_reject);
            pendingEtiquetteRow.appendChild(col_div);
            icon_approve.addEventListener('click', function (){
                clickTickXUpvoteHandler(icon_approve, 'approve');
            });
            icon_reject.addEventListener('click', function (){
                clickTickXUpvoteHandler(icon_reject, 'reject');
            });
        }

    }

    removeAllChildNodes(approvedEtiquetteRow);

    let colorCoefficient = Math.ceil(approved_list.length / redColors.length);
    let reverseCounter = 0;
    for (let i = approved_list.length-1; i >= 0; i--) {

        let col_div = document.createElement("div");
        col_div.className= "col-auto etiquette-each";
        if (i != approved_list.length-1 && approved_list[i][2] == approved_list[i+1][2]) {
            col_div.style.backgroundColor = approvedEtiquetteRow.firstChild.style.backgroundColor;
            col_div.style.borderColor = approvedEtiquetteRow.firstChild.style.borderColor;
            // colorCoefficient = Math.ceil(i / redColors.length);
        } else {
            col_div.style.backgroundColor = redColors[Math.floor((reverseCounter/colorCoefficient))];
            col_div.style.borderColor = redColors[Math.floor((reverseCounter/colorCoefficient))];
            // reverseCounter += 1;
        }
        reverseCounter += 1;

        let span_etiquette = document.createElement("span");
        span_etiquette.className = "etiquette-sentence";
        span_etiquette.textContent = approved_list[i][3];
        span_etiquette.style.color = "white";
        let icon = document.createElement("i");
        icon.className = "fa-regular fa-bell";
        icon.style.color = "white";
        let span_count = document.createElement("span");
        span_count.className = "etiquette-count";
        span_count.textContent = approved_list[i][2];
        span_count.style.color = "white";

        col_div.append(span_etiquette, icon, span_count);
        approvedEtiquetteRow.insertBefore(col_div, approvedEtiquetteRow.firstChild);
        icon.addEventListener('click', function (){
            clickTickXUpvoteHandler(icon, 'vote');
        });
    }

}


function clickTickXUpvoteHandler(node, operation) {
    const div = node.parentNode;
    const inputEtiquette = div.querySelector(".etiquette-sentence");

    let details = {
        'sheet': 'etiquette',
        'etiquetteSuggested': inputEtiquette.textContent,
        'operation': operation
    }
    let formBody = formEncoding(details);

    postHandler(accessible_classroom_general_gsheet, formBody)
        .then(function (data) {
            console.log(data);
        })
        .catch(function (error) {
            console.log((error))
        })
}

/* message submission */

const speakLouderBtn = document.getElementById('speak-louder');
const speakSlowerBtn = document.getElementById('speak-slower');
const customiseMsgBtn = document.getElementById('customise-msg');
const msgSubmitStatusIndicator = document.getElementById('msg-submit-status-indication');

speakLouderBtn.addEventListener('click', function() {
    msgSubmissionHandler("For current speaker: please speak louder");
});

speakSlowerBtn.addEventListener('click', function() {
    msgSubmissionHandler("For current speaker: please speak slower");
});

customiseMsgBtn.addEventListener('click', function() {
    let row = customiseMsgBtn.parentNode.parentNode.parentNode
    let newRowDiv = document.createElement('div');
    newRowDiv.className = "row";
    let newTextInputDiv = document.createElement('div');
    newTextInputDiv.className = "col-7 offset-4";
    let newTextInput = document.createElement('input');
    newTextInput.type = 'text';
    newTextInput.id = 'input-customise-msg';
    newTextInput.class = 'input text-input';
    newTextInput.name = 'input-customise-msg';
    newTextInputDiv.appendChild(newTextInput);
    let newSendBtnDiv =  document.createElement('div');
    newSendBtnDiv.className = "col-1";
    let newSendBtn = document.createElement('i');
    newSendBtn.className = "fa fa-paper-plane";
    newSendBtn.id = 'submit-etiquette';
    newSendBtn.setAttribute("aria-hidden", "true");
    newSendBtnDiv.appendChild(newSendBtn)
    newRowDiv.append(newTextInputDiv, newSendBtnDiv);
    row.append(newRowDiv);

    newSendBtn.addEventListener('click', function (){
        if (newTextInput.value != '') {
            msgSubmissionHandler(newTextInput.value);
        }
        row.removeChild(newRowDiv);
    })
})

function msgSubmissionHandler(msg) {
    console.log('start submit ' + msg);
    let details = {
        'msg': msg
    }
    let formBody = formEncoding(details);

    postHandler(accessible_classroom_message_gsheet, formBody)
        .then(function(data){
            console.log(data);
            const statusIndicateMsg = 'Post succeeded';
            submitStatusIndicator(msgSubmitStatusIndicator, statusIndicateMsg);
        })
        .catch(function(error) {
            console.log(error);
            const statusIndicateMsg = 'Post failed';
            submitStatusIndicator(msgSubmitStatusIndicator, statusIndicateMsg);
        })
}

let retrieve_msg_from_gsheet = setInterval(function () {
    msgRetrieveHandler();
}, 1000)

// use in developing
// document.getElementById('msg').addEventListener('click', function () {
//     msgRetrieveHandler();
// })

function msgRetrieveHandler() {
    getHandler(accessible_classroom_message_gsheet)
        .then(function(data){
            arrange_msg(data);
        })
        .catch(function(error) {
            console.log(error);
        });
}

let timestemps = new Array();

function arrange_msg(data) {
    let len = data.length;
    let notifications = new Array();
    for (let i = 1; i < len; i++) {
        let timestamp = data[i][0];
        if (timestemps.includes(timestamp)) {
            continue;
        }
        timestemps.push(data[i][0]);
        notifications.push(data[i][1]);
    }

    if (notifications.length !== 0) {
        let notificationsJson = JSON.stringify(notifications);
        // chrome.runtime.sendMessage({type: 'msg', content: notificationsJson}, function (response) {
        //     console.log(response.success);
        // })
        chrome.tabs.sendMessage(tabId, {type: 'alert', content: notificationsJson}, function (response) {
            console.log(response.success);
        })
    }
}

/* listeners -- from contentScript or background script */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        /* receive what typed into chat from content script */
        if (request.type === "chatText") {
            try {
                let chat = request.num_words;
                let speechTime = (chat) / WPM["slow"] * 3600;

                durationSubmissionHandler(speechTime, 'text_duration')
                sendResponse({success: true});
            }
            catch (e) {
                console.log(e);
                sendResponse({success: false});
            }
        }
    }
);

let durationAscend = false;

if (isAdmin) {
    /* retrieve speaking duration */
    const durationSwitch = document.getElementById("durationToggle");
    durationSwitch.addEventListener("click", function() {
        if (durationAscend) {
            durationAscend = false;
            durationSwitch.className = "fa-solid fa-toggle-off";
        } else {
            durationAscend = true;
            durationSwitch.className = "fa-solid fa-toggle-on";
        }
        durationRetrieveHandler("speaking_duration", arrangeSpeakingDuration, durationAscend)
            .then(() => {})
    })
    let updateUsageBar = window.setInterval(function () {
        durationRetrieveHandler("text_duration", sumDuration)
            .then(() => {
                let speakingPercentage = ((totalDuration.speaking / (totalDuration.speaking + totalDuration.text)) * 100).toFixed(2);
                let textPercentage = ((totalDuration.text / (totalDuration.speaking + totalDuration.text)) * 100).toFixed(2);
                let usageScale = (totalDuration.speaking / (totalDuration.speaking + totalDuration.text)).toFixed(2);
                if (totalDuration.text !== 0 || totalDuration.speaking !== 0) {
                    document.getElementById("voice").innerText = "Voice " + speakingPercentage + "%";
                    document.getElementById("text").innerText = "Text " + textPercentage + "%";
                    document.getElementById("usage").value = usageScale;
                }
            })
    }, 5000);

    let speakingFrequency = window.setInterval(function() {
        durationRetrieveHandler("speaking_duration", arrangeSpeakingDuration, durationAscend)
            .then(() => {})
    }, 5000)
}
