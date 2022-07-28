import {
    accessible_classroom_general_gsheet,
    formEncoding,
    getHandler,
    postHandler
} from "./utilitiesREST.js";
import { tabId } from "../analysis.js";

let notifySpeakout = false;
let cc = false

function systemSettingsRetrieveHandler() {
    let url = accessible_classroom_general_gsheet + '?sheet=system_settings';;
    getHandler(url)
        .then(function(data){
            if (data.status == 'success') {
                if (data.speak_out == true && notifySpeakout == false) {
                    console.log('now turning chat-typing notify on');
                    chrome.tabs.sendMessage(tabId, {type: "listener", expectingStatus: 'on'}, function (response) {
                        console.log((response.success));
                    });
                    notifySpeakout = true;
                } else if (data.speak_out == false && notifySpeakout == true) {
                    console.log('now turning chat-typing notify off');
                    chrome.tabs.sendMessage(tabId, {type: "listener", expectingStatus: 'off'}, function (response) {
                        console.log((response.success));
                    });
                    notifySpeakout = false;
                }

                if (data.cc == true && cc == false) {
                    console.log('now turning cc notify on');
                    chrome.tabs.sendMessage(tabId, {type: "cc", expectingStatus: 'on'}, function (response) {
                        console.log((response.success));
                    });
                    cc = true;
                } else if (data.cc == false && cc == true) {
                    console.log('now turning cc notify off');
                    chrome.tabs.sendMessage(tabId, {type: "cc", expectingStatus: 'off'}, function (response) {
                        console.log((response.success));
                    });
                    cc = false;
                }
            } else {
                throw "app script gives status=false error";
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

function systemSettingsSubmissionHandler(sheet, val) {
    console.log("submit chat needed to speak out request ");

    var details = {
        'sheet': sheet,
        'operation': 'update',
        'setting': val,
    }
    let formBody = formEncoding(details);

    postHandler(accessible_classroom_general_gsheet, formBody)
        .then(function(data){
            console.log(data);
        })
        .catch(function(error) {
            console.log(error);
        })
}

export {systemSettingsRetrieveHandler, systemSettingsSubmissionHandler};