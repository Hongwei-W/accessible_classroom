var chatTextarea = null;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == 'listener') {
            try {
                if (chatTextarea == null) {
                    let TextareaCollection = document.getElementsByTagName('textarea');
                    if (TextareaCollection.length == 0) {
                        throw 'cannot find textarea element error';
                    }
                    console.log('find node -- textarea' + TextareaCollection[0]);
                    chatTextarea = TextareaCollection[0];
                }

                if (request.expectingStatus == 'on') {
                    chatTextarea.addEventListener('keypress', chatSpeakNotifyListenerHandler)
                    sendResponse({success: true});
                    console.log('chat speak out notification turned on');
                }
                else {
                    chatTextarea.removeEventListener('keypress', chatSpeakNotifyListenerHandler)
                    console.log('chat speak out notification turned off');
                    sendResponse({success: true});
                }
            }
            catch (e){
                console.log(e);
                sendResponse({success: false});
            }
        }
    }
);

function chatSpeakNotifyListenerHandler() {
    let notifications = new Array();
    notifications.push("Please speak out what you want to type in chat if it is not personal");
    let notificationsJson = JSON.stringify(notifications);
    chrome.runtime.sendMessage({type: 'msg', content: notificationsJson}, function (response) {
        console.log('msg retrieve ');
        console.log(response.success);
    })
}


