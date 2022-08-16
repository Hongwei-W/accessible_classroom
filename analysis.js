import { postHandler, getHandler, formEncoding, accessible_classroom_general_gsheet, accessible_classroom_message_gsheet } from './features/utilitiesREST.js';
import {ConvertStringToHTML, removeAllChildNodes} from "./features/utilitiesDOM.js";
import {
    findGetParameter, rateMax, rateMin, rateRange, rateSlow,
    redColors,
    removeElements, speechRateRange,
    volumeRange,
    volumeSoft,
    volumeSoftDot, volumeWidth, volumeWidthLoud, volumeWidthMid, volumeWidthSoft,
    WPM
} from "./features/utilities.js";
import { SoundMeter } from "./features/soundmeter.js";
import { systemSettingsRetrieveHandler, systemSettingsSubmissionHandler } from "./features/chatSpeakout.js";
import {
    arrangeSpeakingDuration,
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

window.onbeforeunload = function() {
    chrome.tabs.sendMessage(tabId, {type: "close"}, function (response) {
        console.log(response.success);
    })
}


/* speech recognition */

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.continuous = 'true';

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
    }
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
const instantIndicator = document.querySelector("#instant #volume-indicator");

const constraints = window.constraints = {
    audio: true,
    video: false
};

let meterRefresh = null;
let meterStopWatch = null;
let speaking = false;
let meterValue = [];

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
            meterValue.push(soundMeter.slow * 10);
        }, 200);
        meterStopWatch = setInterval(() => {
            let instantVolume = soundMeter.instant.toFixed(2);
            if (instantVolume > 0.01 && !speaking) {
                if (!recognitionOn) {recognition.start();}
            }
        }, 100);
    });
}

const volumeMeterLow = document.querySelector("#instant.volume .suboptimal.low");
const volumeMeterMid = document.querySelector("#instant.volume .optimal.mid");
const volumeMeterHigh = document.querySelector("#instant.volume .suboptimal.high");
const volumeMeterSpace = document.querySelectorAll("#instant.volume .space");
const rateMeterLow = document.querySelector("#speechSpeed .suboptimal.low");
const rateMeterMid = document.querySelector("#speechSpeed .optimal.mid");
const rateMeterHigh = document.querySelector("#speechSpeed .suboptimal.high");
const rateMeterSpace = document.querySelectorAll("#speechSpeed .space");
window.setInterval(() => {
    if (meterValue.length != 0) {
        let val = Math.max.apply(null, meterValue);
        if (val < 0.1) {val = 0};
        instantMeter.value = (val).toFixed(2);
        instantValueDisplay.textContent = (val).toFixed(2) + " unit";
        const softRange = volumeWidth.soft;
        const rightRange = volumeWidth.mid;
        const loudRange = volumeWidth.loud;
        if (val == 0) {
            instantIndicator.textContent = "";
            // div meter
            volumeMeterLow.setAttribute("style", `width: ${softRange}% !important; height: 10px !important; background-color: #FEC40066`);
            volumeMeterMid.setAttribute("style", `width: ${rightRange}% !important; height: 10px !important; background-color: #29CC9766`);
            volumeMeterHigh.setAttribute("style", `width: ${loudRange}% !important; height: 10px !important; background-color: #FEC40066`);
            volumeMeterSpace[0].setAttribute("style", "width: 3% !important");
            volumeMeterSpace[1].setAttribute("style", "width: 3% !important");
        } else if (val > volumeRange.loud) {
            // text indicator
            instantIndicator.textContent = "too loud";
            instantIndicator.style.color = redColors[5];
            // div meter
            volumeMeterLow.setAttribute("style", `width: ${softRange}% !important; height: 10px !important; background-color: #FEC40066`);
            volumeMeterMid.setAttribute("style", `width: ${rightRange}% !important; height: 10px !important; background-color: #29CC9766`);
            volumeMeterHigh.setAttribute("style", `width: ${loudRange+3}% !important; height: 15px !important; background-color: #FEC400`);
            volumeMeterSpace[0].setAttribute("style", "width: 1.5% !important");
            volumeMeterSpace[1].setAttribute("style", "width: 1.5% !important");
        } else if (val > volumeRange.soft) {
            instantIndicator.textContent = "just right";
            instantIndicator.style.color = "#29CC97";

            volumeMeterLow.setAttribute("style", `width: ${softRange}% !important; height: 10px !important; background-color: #FEC40066`);
            volumeMeterMid.setAttribute("style", `width: ${rightRange+3}% !important; height: 15px !important; background-color: #29CC97`);
            volumeMeterHigh.setAttribute("style", `width: ${loudRange}% !important; height: 10px !important; background-color: #FEC40066`);
            volumeMeterSpace[0].setAttribute("style", "width: 1.5% !important");
            volumeMeterSpace[1].setAttribute("style", "width: 1.5% !important");
        } else {
            instantIndicator.textContent = "too soft";
            instantIndicator.style.color = redColors[5];

            volumeMeterLow.setAttribute("style", `width: ${softRange+3}% !important; height: 15px !important; background-color: #FEC400`);
            volumeMeterMid.setAttribute("style", `width: ${rightRange}% !important; height: 10px !important; background-color: #29CC9766`);
            volumeMeterHigh.setAttribute("style", `width: ${loudRange}% !important; height: 10px !important; background-color: #FEC40066`);
            volumeMeterSpace[0].setAttribute("style", "width: 1.5% !important");
            volumeMeterSpace[1].setAttribute("style", "width: 1.5% !important");
        }
        meterValue = [];
    }
}, 2000)

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
            // chatToggle.setAttribute("class", "fa-solid fa-toggle-off");
            chatToggle.textContent = "start";
            systemSettingsSubmissionHandler("chat_speakout_notify", false);
        } else {
            notifySpeakoutAdmin = true;
            // chatToggle.setAttribute("class", "fa-solid fa-toggle-on");
            chatToggle.textContent = "stop";
            systemSettingsSubmissionHandler("chat_speakout_notify", true);
        }
    })

    let ccAdmin = false;
    const ccToggle = document.getElementById("cc-toggle");
    ccToggle.addEventListener('click', function() {
        if (ccAdmin) {
            ccAdmin = false;
            ccToggle.textContent = "start";
            systemSettingsSubmissionHandler("cc_notify", false);
        } else {
            ccAdmin = true;
            ccToggle.textContent = "stop";
            systemSettingsSubmissionHandler("cc_notify", true);
        }
    })

    // set it to false (reset) when meeting starts
    systemSettingsSubmissionHandler("chat_speakout_notify", false);
    systemSettingsSubmissionHandler("cc_notify", false);
}

// no matter if is admin or not
let retrieve_chatSpeakoutNotify = setInterval(function () {
    systemSettingsRetrieveHandler();
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
        loopbackToggle.setAttribute("class", "fa-solid fa-toggle-off toggle align-middle");
        player.pause();
    } else {
        soundOn = true;
        loopbackToggle.setAttribute("class", "fa-solid fa-toggle-on toggle align-middle");
        player.play();
    }
})


/* etiquette submission */
console.log("etiquette submission initializing");

const inputEtiquette = document.getElementById("input-etiquette");
// const submitEtiquette = document.getElementById("submit-etiquette");
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
            let statusIndicateMsg = 'request submitted and is waiting for approval';
            submitEtiquetteIndicator(statusIndicateMsg);

        })
        .catch(function(error) {
            console.log(error);
            let statusIndicateMsg = 'system failure caused fail of submission';
            submitEtiquetteIndicator(statusIndicateMsg);

        })
}

inputEtiquette.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        if (inputEtiquette.value.trim() != '') {
            etiquetteSubmissionHandler();
        }
        else {
            console.log("fail");
            inputEtiquette.value = '';
            submitEtiquetteIndicator("cannot submit blank etiquette");
        }
    }
})

function submitEtiquetteIndicator(msg) {
    inputEtiquette.placeholder = msg;
    window.setTimeout(()=> {
        inputEtiquette.placeholder = "";
    }, 2000)
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

//used for developing
// document.getElementById('test').addEventListener('click', function () {
//     getHandler(accessible_classroom_general_gsheet + '?sheet=etiquette')
//         .then(function(data){
//         arrangeEtiquette(data);
//         })
//         .catch(function(error) {
//             console.log(error);
//         })
// })

let etiquetteDictionary = {};

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
            col_div.className = "etiquette-each";
            col_div.textContent = pending_list[i][3];
            col_div.style.color = "grey";
            let icon_div = document.createElement("div");
            icon_div.className = "etiquette-side"
            let icon_approve = document.createElement("i");
            icon_approve.className = "fa-solid fa-check fa-fw button";
            let icon_reject = document.createElement("i");
            icon_reject.className = "fa-solid fa-xmark fa-fw button";

            let line_breaker = document.createElement("div");
            if (i != pending_list.length-1) {
                line_breaker.className = "line-breaker";
            }
            icon_div.append(icon_reject, icon_approve);
            pendingEtiquetteRow.append(col_div, icon_div, line_breaker);
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

        let etiquette_div = document.createElement("div");
        etiquette_div.className= "etiquette-each";
        if (i != approved_list.length-1 && approved_list[i][2] == approved_list[i+1][2]) {
            etiquette_div.style.color = approvedEtiquetteRow.firstChild.style.color;

        } else {
            etiquette_div.style.color = redColors[Math.floor((reverseCounter/colorCoefficient))];
        }
        reverseCounter += 1;
        etiquette_div.textContent = approved_list[i][3];

        let icon_div = document.createElement("div");
        icon_div.className = "etiquette-side"
        let icon = document.createElement("i");
        icon.className = "fa-regular fa-bell fa-fw button";
        icon.style.color = "white";
        let span_count = document.createElement("span");
        span_count.className = "etiquette-count";
        span_count.textContent = approved_list[i][2];

        let line_breaker = document.createElement("div");
        if (i != approved_list.length-1) {
            line_breaker.className = "line-breaker";
        }

        icon_div.append(icon, span_count);
        // dummy_col_div.append(etiquette_div, icon_div)
        approvedEtiquetteRow.insertBefore(line_breaker, approvedEtiquetteRow.firstChild);
        approvedEtiquetteRow.insertBefore(icon_div, approvedEtiquetteRow.firstChild);
        approvedEtiquetteRow.insertBefore(etiquette_div, approvedEtiquetteRow.firstChild);
        icon.addEventListener('click', function (){
            clickTickXUpvoteHandler(icon, 'vote');
        });
    }

}


function clickTickXUpvoteHandler(node, operation) {
    const div = node.parentNode;
    const inputEtiquette = div.previousSibling;

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

    if (operation === "approve" || operation === "vote") {
        let notifications = new Array();
        notifications.push(inputEtiquette.textContent);
        let notificationsJson = JSON.stringify(notifications);
        chrome.tabs.sendMessage(tabId, {type: 'alert', content: notificationsJson}, function (response) {
            console.log(response.success);
        })
    }
}

/* message submission */

const speakLouderBtn = document.getElementById('speak-louder');
const speakSofterBtn = document.getElementById('speak-softer');
const speakFasterBtn = document.getElementById('speak-faster');
const speakSlowerBtn = document.getElementById('speak-slower');
let customiseMsgBtn = document.getElementById('customise-msg');
const msgSubmitStatusIndicator = document.getElementById('msg-submit-status-indication');
let msgContent = "For current speaker: please "

speakLouderBtn.addEventListener('click', function() {
    msgSubmissionHandler(msgContent + 'speak louder.');
});

speakSofterBtn.addEventListener('click', function () {
    msgSubmissionHandler(msgContent + 'speak softer.');
})

speakFasterBtn.addEventListener('click', function () {
    msgSubmissionHandler(msgContent + 'speak faster.');
})

speakSlowerBtn.addEventListener('click', function() {
    msgSubmissionHandler(msgContent + 'speak slower.');
});

customiseMsgBtn.addEventListener('click', function() {
    let row = customiseMsgBtn.parentNode;
    let newTextInput = document.createElement('input');
    row.removeChild(customiseMsgBtn);
    newTextInput.type = 'text';
    newTextInput.id = 'input-customise-msg';
    newTextInput.className = 'input text-input';
    newTextInput.name = 'input-customise-msg';
    row.appendChild(newTextInput);

    newTextInput.addEventListener('keyup', function (event){
        if (event.key === "Enter") {
            if (newTextInput.value.trim() != '') {
                newTextInput.placeholder = 'sent';
                msgSubmissionHandler(newTextInput.value);
                window.setTimeout(()=> {
                    row.removeChild(newTextInput);
                    row.appendChild(customiseMsgBtn);
                }, 2000)
            }
            else {
                console.log("fail");
                newTextInput.placeholder = 'send failed';
            }
        }
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
            // submitStatusIndicator(msgSubmitStatusIndicator, statusIndicateMsg);
        })
        .catch(function(error) {
            console.log(error);
            const statusIndicateMsg = 'Post failed';
            // submitStatusIndicator(msgSubmitStatusIndicator, statusIndicateMsg);
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
        if (data[i][1] === "For current speaker: please speak louder.") {
            console.log("adjusting... loud");
            let cur = volumeSoft.indexOf(volumeRange.soft);
            // set dot, bar background, and meter low
            if (cur == volumeSoft.length - 1) continue;
            volumeRange.soft = volumeSoft[cur+1];
            const html = document.getElementsByTagName("html")[0];
            html.style.setProperty("--soft", volumeRange.soft * 100 + "%");
            const meter = document.querySelector("#instant meter");
            meter.setAttribute("low", volumeRange.soft);
            html.style.setProperty("--dot", volumeSoftDot[volumeRange.soft]);
            // homemade meter
            let current = volumeWidthSoft.indexOf(volumeWidth.soft);
            if (current == volumeWidthSoft.length - 1) continue;
            volumeWidth.soft = volumeWidthSoft[current+1];
            volumeWidth.mid = volumeWidthMid[current+1];
            volumeWidth.loud = volumeWidthLoud[current+1];
            volumeMeterLow.setAttribute("style", `width: ${volumeWidth.soft}% !important;`);
            volumeMeterMid.setAttribute("style", `width: ${volumeWidth.mid}% !important;`);
            volumeMeterHigh.setAttribute("style", `width: ${volumeWidth.loud}% !important;`);
        }
        else if (data[i][1] === "For current speaker: please speak softer.") {
            console.log("adjusting... soft");
            let cur = volumeSoft.indexOf(volumeRange.soft);
            // set dot, bar background, and meter low
            if (cur == 0) continue;
            volumeRange.soft = volumeSoft[cur-1];
            const html = document.getElementsByTagName("html")[0];
            html.style.setProperty("--soft", volumeRange.soft * 100 + "%");
            const meter = document.querySelector("#instant meter");
            meter.setAttribute("low", volumeRange.soft);
            html.style.setProperty("--dot", volumeSoftDot[volumeRange.soft]);
            // homemade meter
            let current = volumeWidthSoft.indexOf(volumeWidth.soft);
            if (current == 0) continue;
            volumeWidth.soft = volumeWidthSoft[current-1];
            volumeWidth.mid = volumeWidthMid[current-1];
            volumeWidth.loud = volumeWidthLoud[current-1];
            volumeMeterLow.setAttribute("style", `width: ${volumeWidth.soft}% !important;`);
            volumeMeterMid.setAttribute("style", `width: ${volumeWidth.mid}% !important;`);
            volumeMeterHigh.setAttribute("style", `width: ${volumeWidth.loud}% !important;`);
        }

        else if (data[i][1] === "For current speaker: please speak faster.") {
            console.log("adjusting... fast");
            let cur = rateSlow.indexOf(speechRateRange.slow);
            // set bar background, and meter low
            if (cur == rateSlow.length - 1) continue;
            speechRateRange.slow = rateSlow[cur+1];
            const html = document.getElementsByTagName("html")[0];
            html.style.setProperty("--slow", (speechRateRange.slow - 60) + "%");
            const meter = document.querySelector("#speechSpeed meter");
            meter.setAttribute("low", speechRateRange.slow);
            // homemade meter: use variable `rateRange`
            let current = volumeWidthSoft.indexOf(rateRange.slow-60);
            if (current == volumeWidthSoft.length - 1) continue;
            rateRange.slow = volumeWidthSoft[current+1] + rateMin;
            rateRange.fast = rateMax - volumeWidthLoud[current+1];
            const slowWidth = volumeWidthSoft[current+1];
            const midWidth = volumeWidthMid[current+1];
            const fastWidth = volumeWidthLoud[current+1];
            console.log(slowWidth, midWidth, fastWidth);
            rateMeterLow.setAttribute("style", `width: ${slowWidth}% !important;`);
            rateMeterMid.setAttribute("style", `width: ${midWidth}% !important;`);
            rateMeterHigh.setAttribute("style", `width: ${fastWidth}% !important;`);
        }
        else if (data[i][1] === "For current speaker: please speak slower.") {
            console.log("adjusting... slow");
            let cur = rateSlow.indexOf(speechRateRange.slow);
            // set dot, bar background, and meter low
            if (cur == 0) continue;
            speechRateRange.slow = rateSlow[cur-1];
            const html = document.getElementsByTagName("html")[0];
            html.style.setProperty("--slow", (speechRateRange.slow - 60) + "%");
            const meter = document.querySelector("#speechSpeed meter");
            meter.setAttribute("low", speechRateRange.slow);
            // homemade meter
            let current = volumeWidthSoft.indexOf(rateRange.slow-60);
            if (current == 0) continue;
            rateRange.slow = volumeWidthSoft[current-1] + rateMin;
            rateRange.fast = rateMax - volumeWidthLoud[current-1];
            const slowWidth = volumeWidthSoft[current-1];
            const midWidth = volumeWidthMid[current-1];
            const fastWidth = volumeWidthLoud[current-1];
            rateMeterLow.setAttribute("style", `width: ${slowWidth}% !important;`);
            rateMeterMid.setAttribute("style", `width: ${midWidth}% !important;`);
            rateMeterHigh.setAttribute("style", `width: ${fastWidth}% !important;`);
        }

    }

    if (notifications.length !== 0) {
        console.log(notifications);
        // for (let i = 0; i < notifications.length; i++) {
        //     // chrome.runtime.sendMessage({type: 'msg_content', content: notifications[i]}, function (response) {
        //     //     console.log(response.success);
        //     // })
        //     // chrome.runtime.sendMessage({type: 'msg_html'}, function (response) {
        //     //     console.log(response.success);
        //     // })
        //     // alert(notifications[i]);
        // }

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
            durationSwitch.className = "fa-solid fa-toggle-off toggle align-middle";
        } else {
            durationAscend = true;
            durationSwitch.className = "fa-solid fa-toggle-on toggle align-middle";
        }
        durationRetrieveHandler("speaking_duration", arrangeSpeakingDuration, durationAscend)
            .then(() => {})
    })
    let updateUsageBar = window.setInterval(function () {
        durationRetrieveHandler("text_duration", sumDuration)
            .then(() => {
                let speakingPercentage = ((totalDuration.speaking / (totalDuration.speaking + totalDuration.text)) * 100).toFixed(2);
                let textPercentage = ((totalDuration.text / (totalDuration.speaking + totalDuration.text)) * 100).toFixed(2);
                let usageScale = (totalDuration.text / (totalDuration.speaking + totalDuration.text)).toFixed(2);
                const head_style = document.head.getElementsByTagName("style")[0]
                if (totalDuration.text !== 0 || totalDuration.speaking !== 0) {
                    document.getElementById("voice").innerText = speakingPercentage + "%";
                    document.getElementById("text").innerText = textPercentage + "%";
                    if (usageScale > 0.5) {
                        head_style.innerHTML = ".pie::before {transform: rotate(" + (usageScale - 0.5) +"turn); background-color: #FEC400;}";
                    } else {
                        head_style.innerHTML = ".pie::before {transform: rotate(" + usageScale + "turn);} background-color: #inherit;";
                    }
                }
            })
    }, 5000);

    let speakingFrequency = window.setInterval(function() {
        durationRetrieveHandler("speaking_duration", arrangeSpeakingDuration, durationAscend)
            .then(() => {})
    }, 5000)
}