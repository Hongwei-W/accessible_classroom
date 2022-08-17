let cur_msg = null;

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

                    // let html = ConvertStringToHTML(string);
                    // console.log(msgs[i])

                    // chrome.runtime.sendMessage({type: 'msg_content', content: msgs[i]}, function (response) {
                    //     console.log(response.success);
                    //
                    // })
                    cur_msg = msgs[i];
                    chrome.windows.create({ url: "alert.html",type: 'popup',  width: 200, height: 100}, function (newWindow) {
                        console.log(newWindow);
                        // chrome.scripting.executeScript({
                        //     target: {tabId: newWindow.tabs[0].id},
                        //     args: [msgs[i]],
                        //     func: (arg1) => {
                        //         document.getElementById("alert").textContent = arg1;
                        //     }
                        // });
                    });
                    // var fs = require('fs');

                    // chrome.windows.create({ url: "alert.html",type: 'popup',  width: 200, height: 100});

                    // alert(msgs[i]);

                    // document.getElementById("alert").innerText = msgs[i];
                    // chrome.tabs.sendMessage(tabId, {type: 'art', content: msgs[i]}, function (response) {
                    //     console.log(response.success);
                    // })
                }
                sendResponse({success: true});
            }
            catch (e) {
                console.log(e);
                sendResponse({success: false});
            }
        }
       else if (request.type === "msg_html") {
           try {
               chrome.windows.create({ url: "alert.html",type: 'popup',  width: 200, height: 100}, function (newWindow) {
                   console.log(newWindow);
                   chrome.scripting.executeScript({
                       target: {tabId: newWindow.tabs[0].id},
                       // args: ["some msg"],
                       // func: (arg1) => {
                       //     document.getElementById("alert").textContent = arg1;
                       // }
                       func: () => {
                           console.log('hello world');
                       }
                   });
               });
           }
           catch (e) {
               console.log(e);
               sendResponse({success: false});
           }
       }
    }
);

// console.log("reach here");
// let div = document.getElementById("alert");
// if (div != null) div.textContent = msg;