import {accessible_classroom_system_status, formEncoding, getHandler, postHandler} from "./utilitiesREST.js";

let notifySpeakout = false;

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

export {chatSpeakoutNotifyRetrieveHandler, chatSpeakoutNotifySubmissionHandler};