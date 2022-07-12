import {Stopwatch} from "./stopwatch.js";
import {name} from "../analysis.js";
import {accessible_classroom_general_gsheet, formEncoding, getHandler, postHandler} from "./utilitiesREST.js";
import {redColors} from "./utilities.js";
import {removeAllChildNodes} from "./utilitiesDOM.js";

let stopwatch = new Stopwatch();
let currentTotalDuration = 0;
let durationPostThreshold = 2000;
let firstSpeakingPost = true;
let firstTextPost = true;
/* a total duration measurement, used to compare with text usage */
let totalDuration = {'speaking': 0, 'text': 0};

function startStopwatch() {
    stopwatch.start();
}

function stopStopwatch() {
    let duration = stopwatch.update();
    currentTotalDuration += duration;
    console.log(currentTotalDuration);
    if (currentTotalDuration >= durationPostThreshold) {
        durationSubmissionHandler(currentTotalDuration, 'speaking_duration');
        currentTotalDuration = 0;
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

function durationRetrieveHandler(sheet, callback) {
     return getHandler(accessible_classroom_general_gsheet + '?sheet=' + sheet)
        .then(function(data){
            console.log(data);
            callback(data);
        })
        .catch(function(error) {
            console.log(error);
        })
}

function sumDuration(data) {
    let total = 0;
    if (data.length == 1){
        return
    }
    for (let i = 1; i < data.length; i++) {
        total += data[i][2];
    }
    console.log("data[0][3] is: "+ data[1][3]);

    if (data[1][3] == "speaking_duration") {
        totalDuration["speaking"] = total;
    } else {
        totalDuration["text"] = total;
    }
    console.log("current speaking duration: " + totalDuration.speaking);
    console.log("current text duration: " + totalDuration.text);
}

function arrangeSpeakingDuration(data) {

    let colorCoefficient = Math.ceil((data.length - 1)/ redColors.length);
    let reverseCounter = 0;
    let speakingFrequencyRow = document.getElementById("speaking_frequency");
    console.log(data);
    removeAllChildNodes(speakingFrequencyRow);
    for (let i = data.length-1; i >= 1; i--) {

        let col_div = document.createElement("div");
        col_div.className= "col-auto etiquette-each";
        if (i != data.length-1 && data[i][2] == data[i+1][2]) {
            col_div.style.backgroundColor = speakingFrequencyRow.firstChild.style.backgroundColor;
            col_div.style.borderColor = speakingFrequencyRow.firstChild.style.borderColor;
        } else {
            col_div.style.backgroundColor = redColors[Math.floor((reverseCounter/colorCoefficient))];
            col_div.style.borderColor = redColors[Math.floor((reverseCounter/colorCoefficient))];
        }
        reverseCounter += 1;

        let span_etiquette = document.createElement("span");
        span_etiquette.className = "etiquette-sentence";
        span_etiquette.textContent = data[i][1];
        span_etiquette.style.color = "white";
        let span_count = document.createElement("span");
        span_count.className = "etiquette-count";
        let speakingMinute = (data[i][2] / 3600).toFixed(2);
        span_count.textContent = speakingMinute + "minutes";
        span_count.style.color = "white";

        col_div.append(span_etiquette, span_count);
        speakingFrequencyRow.insertBefore(col_div, speakingFrequencyRow.firstChild);

    }

    sumDuration(data);
}

export {startStopwatch, stopStopwatch, durationSubmissionHandler, durationRetrieveHandler, sumDuration, arrangeSpeakingDuration, totalDuration};
