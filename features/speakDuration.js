import {Stopwatch} from "./stopwatch.js";
import {name} from "../analysis.js";
import {accessible_classroom_general_gsheet, formEncoding, getHandler, postHandler} from "./utilitiesREST.js";
import {greenColors} from "./utilities.js";
import {removeAllChildNodes} from "./utilitiesDOM.js";

let stopwatch = new Stopwatch();
let durationPostThreshold = 1000;
let firstSpeakingPost = true;
let firstTextPost = true;
/* a total duration measurement, used to compare with text usage */
let totalDuration = {'speaking': 0, 'text': 0};

function startStopwatch() {
    stopwatch.start();
}

function stopStopwatch(length) {
    let duration = stopwatch.update();
    if (duration >= durationPostThreshold && length >= 0) {
        // submit duration
        durationSubmissionHandler(duration, 'speaking_duration');

        // display speech speed
        const speechSpeedMeter = document.querySelector('#speechSpeed meter');
        speechSpeedMeter.value = Math.round(length/(duration/60000));
        const speechSpeedValueDisplay = document.querySelector('#speechSpeed .value');
        speechSpeedValueDisplay.textContent = (length/(duration/60000)).toFixed(2);
    }
    stopwatch.reset();
}

/* submit both speaking_duration and chatText_to_speech (text_duration) duration */
function durationSubmissionHandler(duration, sheet) {

    let details = {
        'sheet': sheet,
        'operation': 'record_duration',
        'name': name,
        'duration': duration
    }

    if (sheet == "speaking_duration" && firstSpeakingPost) {details.operation = 'submit'; firstSpeakingPost = false;}
    if (sheet == "text_duration" && firstTextPost) {details.operation = 'submit'; firstTextPost = false;}
    let formBody = formEncoding(details);

    postHandler(accessible_classroom_general_gsheet, formBody)
        .then(function (data) {
            console.log(data);
        })
        .catch(function (data) {
            console.log(data);
        })
}

function durationRetrieveHandler(sheet, callback, flip=false) {
    let url = accessible_classroom_general_gsheet + '?sheet=' + sheet;
    if (flip) {url += "&operation=flip"}
     return getHandler(url)
        .then(function(data){
            callback(data, flip);
        })
        .catch(function(error) {
            console.log(error);
        })
}

function recentSpokenRetrieveHandler() {
     getHandler(accessible_classroom_general_gsheet + '?sheet=speaking_duration&operation=last_speakers')
        .then(function(data){

            let title_spans = document.getElementsByClassName("title");
            let counter = 0;
            for (let i = 0; i < title_spans.length && counter < 3; i++) {
                if (title_spans[i].textContent == data[counter][0] && title_spans[i].style.backgroundColor == '') {
                    title_spans[i].style.backgroundColor = greenColors[counter];
                    title_spans[i].style.color = "white";
                    counter += 1
                }
            }

            let row_div = document.getElementById("recently_spoken");

        })
        .catch(function(error) {
            console.log(error);
        })
}

function sumDuration(data, flip) {
    let total = 0;
    if (data.length == 1){
        return
    }

    let i = !flip ? 1 : 0
    let boundary = !flip ? data.length : data.length-1;
    for (; i< boundary; i++) {
        total += data[i][2];
    }

    if (data[1][3] == "speaking_duration") {
        totalDuration["speaking"] = total;
    } else {
        totalDuration["text"] = total;
    }
}

function arrangeSpeakingDuration(data, flip) {
    let durations = data.durations;
    let speakingFrequencyRow = document.getElementById("speaking_frequency");
    removeAllChildNodes(speakingFrequencyRow);

    let i = !flip ? 1 : 0
    let boundary = !flip ? durations.length : durations.length-1;
    let divider = durations[i][2] > durations[boundary-1][2] ? durations[i][2] : durations[boundary-1][2]
    for (; i < boundary; i++) {
        let title_div = document.createElement("div");
        title_div.className = "col-4 text-end";
        let title_span = document.createElement("span");
        title_span.className = "title";
        title_span.textContent = durations[i][1];
        let grid_div = document.createElement("div");
        grid_div.className = "col-8 grid horizontal"
        let bar_div = document.createElement("div");
        bar_div.className = "bar";
        bar_div.textContent = (durations[i][2] / 60000).toFixed(2);
        bar_div.style.setProperty( "--bar-value", ((durations[i][2]/divider) * 100).toFixed(2) + "%" );
        bar_div.setAttribute("title", durations[i][1] + " " + (durations[i][2] / 60000).toFixed(2) + "minutes");
        title_div.appendChild(title_span);
        grid_div.appendChild(bar_div);
        speakingFrequencyRow.append(title_div, grid_div);
        let space_div = document.createElement("div");
        space_div.className = "space";
        speakingFrequencyRow.append(space_div);
    }

    let lastSpeakers = data.lastSpeakers;
    let title_spans = document.getElementsByClassName("title");
    let counter = 0;
    for (let j = 0; j < title_spans.length && counter < 3; j++) {
        if (title_spans[j].textContent == lastSpeakers[counter][0] && title_spans[j].style.backgroundColor == '') {
            title_spans[j].style.backgroundColor = greenColors[counter];
            title_spans[j].style.color = "white";
            counter += 1
        }
    }

    sumDuration(durations, flip);
}

export {startStopwatch, stopStopwatch, durationSubmissionHandler, durationRetrieveHandler, recentSpokenRetrieveHandler, sumDuration, arrangeSpeakingDuration, totalDuration};
