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
const tabId = parseInt(findGetParameter('tabId'));

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


const accessible_classroom_system_status =
    'https://script.google.com/macros/s/AKfycbwIp83wddV0IFmjMS-PznvZQziwWKcGFqTPJKUBrTtlLlC8qcqgbFGuwZfvBbxssGFW/exec';

/* Set "notify speakout" */
if (isAdmin) {
// chrome.tabs.sendMessage(tabId, {type: "listener"}, function(response) {
//     console.log((response.success));
// });
    var notifySpeakoutAdmin = false;
    const chatToggle = document.getElementById("chat-toggle");
    chatToggle.addEventListener("click", function () {
        if (notifySpeakoutAdmin) {
            notifySpeakoutAdmin = false;
            chatToggle.setAttribute("class", "fa-solid fa-toggle-off");
            chatSpeakoutNotifySubmissionHandler(false);
            // chrome.tabs.sendMessage(tabId, {type: "listener", expectingStatus: 'off'}, function (response) {
            //     console.log((response.success));
            // });
        } else {
            notifySpeakoutAdmin = true;
            chatToggle.setAttribute("class", "fa-solid fa-toggle-on");
            chatSpeakoutNotifySubmissionHandler(true);
            // chrome.tabs.sendMessage(tabId, {type: "listener", expectingStatus: 'on'}, function (response) {
            //     console.log((response.success));
            // });
        }
    })

    chatSpeakoutNotifySubmissionHandler(false);

    function chatSpeakoutNotifySubmissionHandler(val) {
        console.log("submit chat needed to speak out request ");

        var details = {
            'sheet': "Chat-Speakout-Notify",
            'setting': val,
        }
        let formBody = formEncoding(details);

        postHandler(accessible_classroom_system_status, formBody)
            .then(function(data){
                console.log(data);
            })
            .catch(function(error) {
                console.log(error);
            })
    }
}

// no matter if is admin or not
// TODO uncomment these
// retrieve_chatSpeakoutNotify = setInterval(function () {
//     msgRetrieveHandler();
// }, 1000)

var notifySpeakout = false;
document.getElementById('chatSpeakoutNotify').addEventListener('click', function () {
    chatSpeakoutNotifyRetrieveHandler();
})

function chatSpeakoutNotifyRetrieveHandler() {
    console.log('start retrieve chatSpeakoutNotify setting');
    let url = accessible_classroom_system_status + '?sheet=Chat-Speakout-Notify';
    getHandler(url)
        .then(function(data){
            if (data.status == 'success') {
                console.log('setting retrieve from sheet [' + data.setting + ']');
                console.log('local setting [' + notifySpeakout + ']');
                if (data.setting == true && notifySpeakout == false) {
                    console.log('now turning on');
                    chrome.tabs.sendMessage(tabId, {type: "listener", expectingStatus: 'on'}, function (response) {
                        console.log((response.success));
                    });
                    notifySpeakout = true;
                } else if (data.setting == false && notifySpeakout == true) {
                    console.log('now turning off');
                    chrome.tabs.sendMessage(tabId, {type: "listener", expectingStatus: 'off'}, function (response) {
                        console.log((response.success));
                    });
                    notifySpeakout = false;
                }
            } else {
               throw "app script gives status=false error";
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}


/* sound loop back */
var soundOn = false;
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

// var vm = new Vue({
//     el: "#app",
//     data: {
//         values: [
//             [ "/index.jsp", 100, 1000 ],
//             [ "/home.jsp", 70, 2000 ],
//             [ "/admin.jsp", 30, 3000 ],
//             [ "/test/a.jsp", 5, 8000 ],
//             [ "/test/b.jsp", 50, 5000 ],
//             [ "/test/c.jsp", 1, 10000 ],
//             [ "/test/d.jsp", 1, 1000 ]
//         ],
//         colors: function(data) {
//             if (data[2] <= 3000) {
//                 return '#497eff';
//             } else if (data[2] <= 7000) {
//                 return '#ffdd26';
//             } else {
//                 return '#ff4f55';
//             }
//         },
//         styles: {
//             titleFontSize: 15,
//             titleFontWeight: 'bold'
//         }
//     },
//     methods: {
//         onClickEvent: function(obj, e) {
//             console.log(obj.data);
//         }
//     }
// });

/* etiquette submission */
console.log("etiquette submission initializing");

const inputEtiquette = document.getElementById("input-etiquette");
const submitEtiquette = document.getElementById("submit-etiquette");
const promptEtiquette = document.getElementById("prompt-etiquette");
const accessible_classroom_etiquette_gsheet =
    'https://script.google.com/macros/s/AKfycbyuSO33246tkA66JHx55e1H356Uyth0yqwnOtP3TrSMk0JPMJiVVns_t6eIQyG4_0PK/exec';
const pendingEtiquetteRow = document.getElementById("pending-etiquette-row");
const approvedEtiquetteRow = document.getElementById("approved-etiquette-row");

function etiquetteSubmissionHandler() {
    console.log("submit etiquette by etiquetteSubmissionHandler");

    var details = {
        'etiquetteSuggested': inputEtiquette.value,
        'isPending': true,
        'isRejected': false,
        'upvote': 0,
        'operation': 'submit'
    }
    let formBody = formEncoding(details);

    postHandler(accessible_classroom_etiquette_gsheet, formBody)
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

function formEncoding(details) {
    var formBody = [];

    for (let property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }

    formBody = formBody.join("&");
    return formBody;
}

function postHandler(url, formBody) {
    return fetch (url, {
        body: formBody,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
        method: 'POST'
    }).then(response => response.json())
}

submitEtiquette.addEventListener("click", function() {
    console.log(inputEtiquette.value);
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

function getHandler(url) {
    return fetch (url, {
        method: 'GET'
    }).then(response => response.json())
}

// TODO uncomment these
// retrieve_etiquette_from_gsheet = setInterval(function () {
//     console.log('get etiquette start');
//     getHandler(accessible_classroom_etiquette_gsheet)
//         .then(function(data){
//         arrange_etiquette(data);
//         })
//         .catch(function(error) {
//             console.log(error);
//         })
// }, 2000)


function arrange_etiquette(data) {
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

    for (let i = 0; i < approved_list.length; i++) {

        let col_div = document.createElement("div");
        col_div.className= "col-auto etiquette-each";
        let span_etiquette = document.createElement("span");
        span_etiquette.className = "etiquette-sentence";
        span_etiquette.textContent = approved_list[i][3];
        let icon = document.createElement("i");
        icon.className = "fa-regular fa-bell";
        let span_count = document.createElement("span");
        span_count.className = "etiquette-count";
        span_count.textContent = approved_list[i][2];

        col_div.append(span_etiquette, icon, span_count);
        approvedEtiquetteRow.appendChild(col_div);
        icon.addEventListener('click', function (){
            clickTickXUpvoteHandler(icon, 'vote');
        });
    }

}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}



function clickTickXUpvoteHandler(node, operation) {
    const div = node.parentNode;
    const inputEtiquette = div.querySelector(".etiquette-sentence");
    console.log("submit " + operation);

    var details = {
        'etiquetteSuggested': inputEtiquette.textContent,
        'operation': operation
    }
    let formBody = formEncoding(details);

    postHandler(accessible_classroom_etiquette_gsheet, formBody)
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
const accessible_classroom_message_gsheet =
    'https://script.google.com/macros/s/AKfycbwoCR3wKZlhQbNN24unWFyAxcOSW_zDXkA4AEVzcccJLDIXFO9KhsjY_p5Xyr7WU2s/exec';

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
    var details = {
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
// TODO uncomment these
// retrieve_msg_from_gsheet = setInterval(function () {
//     msgRetrieveHandler();
// }, 1000)


document.getElementById('msg').addEventListener('click', function () {
    msgRetrieveHandler();
})

function msgRetrieveHandler() {
    console.log('start retrieve msg');
    getHandler(accessible_classroom_message_gsheet)
        .then(function(data){
            arrange_msg(data);
        })
        .catch(function(error) {
            console.log(error);
        });
}

var timestemps = new Array();

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
    console.log(notifications);

    if (notifications.length != 0) {
        let notificationsJson = JSON.stringify(notifications);
        chrome.runtime.sendMessage({type: 'msg', content: notificationsJson}, function (response) {
            console.log('msg retrieve ');
            console.log(response.success);
        })
    }
}