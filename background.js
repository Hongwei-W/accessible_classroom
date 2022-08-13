import {tabId} from "./analysis";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
       if (request.type === "msg") {
            try {
                let msgs = JSON.parse(request.content);
                let len = msgs.length;

                for (let i = 0; i < len; i++) {
                    // chrome.notifications.create(
                    //     {
                    //         title: 'Reminder from Accessible Classroom Extension!',
                    //         message: msgs[i],
                    //         iconUrl: './images/get_started16.png',
                    //         type: 'basic',
                    //     }
                    // )
                    // const page = window.open('alert.html')

                    // page.addEventListener('DOMContentLoaded', () => {
                    //     // Now we can access the #test element on the other page
                    //     const div = page.document.getElementById("alert");
                    //     div.innerText(msgs[i]);
                    // })
                    chrome.windows.create({ url: "alert.html",type: 'popup',  width: 200, height: 100});
                    // document.getElementById("alert").innerText = msgs[i];
                    chrome.tabs.sendMessage(tabId, {type: 'art', content: msgs[i]}, function (response) {
                        console.log(response.success);
                    })
                }
                sendResponse({success: true});
            }
            catch (e) {
                console.log(e);
                sendResponse({success: false});
            }
        }
    }
);