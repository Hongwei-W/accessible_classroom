chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
       if (request.type === "msg") {
            try {
                let msgs = JSON.parse(request.content);
                let len = msgs.length;

                for (let i = 0; i < len; i++) {
                    chrome.notifications.create(
                        {
                            title: 'Reminder from Accessible Classroom Extension!',
                            message: msgs[i],
                            iconUrl: './images/get_started16.png',
                            type: 'basic',
                        }
                    )
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