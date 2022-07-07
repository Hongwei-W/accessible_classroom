import {Stopwatch} from "./stopwatch.js";
import {name} from "../analysis.js";
import {accessible_classroom_general_gsheet, formEncoding, postHandler} from "./utilitiesREST.js";

let stopwatch = new Stopwatch();
let totalDuration = 0;
let firstPost = true;

function startStopwatch() {
    stopwatch.start();
}

function stopStopwatch() {
    let duration = stopwatch.update();
    totalDuration += duration;
    console.log(totalDuration);
    if (totalDuration >= 2000) {
        speakingDurationSubmissionHandler(totalDuration);
        totalDuration = 0;
        if (firstPost) {firstPost = false;}
    }
    stopwatch.reset();
}

function speakingDurationSubmissionHandler(duration) {

    let details = {
        'sheet': 'speaking_duration',
        'operation': 'record_duration',
        'name': name,
        'duration': duration
    }

    if (firstPost) {details.operation = 'submit';}

    let formBody = formEncoding(details);

    postHandler(accessible_classroom_general_gsheet, formBody)
        .then(function (data) {
            console.log(data);
        })
        .catch(function (data) {
            console.log(data);
        })
}

function speakingDurationRetrieveHandler() {
    getHandler(accessible_classroom_general_gsheet + '?sheet=speaking_duration')
        .then(function(data){
            arrange_speaking_duration(data);
        })
        .catch(function(error) {
            console.log(error);
        })
}

function arrange_speaking_duration(data) {

}

export {startStopwatch, stopStopwatch, speakingDurationRetrieveHandler};
