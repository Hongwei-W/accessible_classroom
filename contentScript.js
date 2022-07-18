let chatTextarea = null;
let chatTextareaSubmitBtn = null;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == 'listener') {
            try {
                if (chatTextarea == null) {findChatTextArea();}

                if (request.expectingStatus == 'on') {
                    chatTextarea.addEventListener('keypress', chatSpeakNotifyListenerHandler)
                    console.log('chat speak out notification turned on');
                }
                else {
                    chatTextarea.removeEventListener('keypress', chatSpeakNotifyListenerHandler)
                    console.log('chat speak out notification turned off');
                }

                sendResponse({success: true});
            }
            catch (e){
                console.log(e);
                sendResponse({success: false, error: e});
            }
        }
        else if (request.type == 'initialize') {
            try {
                const chatBtn = document.querySelector('[aria-label="Chat with everyone"]')
                if (document.getElementsByTagName('textarea').length == 0) {
                    chatBtn.click();
                }
                chatBtn.parentNode.removeChild(chatBtn);
                window.setTimeout(function () {
                    /* bind a listener to "send" button, wait for page to load*/
                    findChatTextArea();
                    enableChatTextCollecting();

                    const chatCloseBtn = document.querySelector('[aria-label="Close"]');
                    chatCloseBtn.parentNode.removeChild(chatCloseBtn);
                }, 1000);

                sendResponse({success: true});
            }
            catch (e){
                console.log(e);
                sendResponse({success: false, error: e});
            }
        }
        else if (request.type == 'alert') {
            try {
                console.log("try alert msgs");
                let msgs = JSON.parse(request.content);
                let len = msgs.length;

                for (let i = 0; i < len; i++) {
                    alert(msgs[i]);
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

function chatSpeakNotifyListenerHandler() {
    let notifications = new Array();
    notifications.push("Please speak out what you want to type in chat if it is not personal");
    let notificationsJson = JSON.stringify(notifications);
    chrome.runtime.sendMessage({type: 'msg', content: notificationsJson}, function (response) {
        console.log('msg retrieve ');
        console.log(response.success);
    })
}

function findChatTextArea() {
    let TextareaCollection = document.getElementsByTagName('textarea');
    if (TextareaCollection.length == 0) {
        throw 'cannot find textarea element error';
    }
    console.log('find node -- textarea' + TextareaCollection[0]);
    chatTextarea = TextareaCollection[0];
}

function enableChatTextCollecting() {
    chatTextareaSubmitBtn = chatTextarea.parentNode.parentNode.parentNode.querySelector("button");
    chatTextareaSubmitBtn.addEventListener('click', ()=> {
        console.log("retrieve chat text: " + chatTextarea.value);
        chrome.runtime.sendMessage({type: 'chatText', num_words: chatTextarea.value.split(' ').length}, function (response) {
            console.log(response.success);
        })
    });
    let text = null;
    chatTextarea.addEventListener('keyup', (e) => {
        if (e.key !== 'Enter' || e.keyCode !== 13) {
            text = chatTextarea.value;
        }
        if (e.key === 'Enter' || e.keyCode === 13) {
            chrome.runtime.sendMessage({type: 'chatText', num_words: text.split(' ').length}, function (response) {
                console.log(response.success);
            })
        }
    })
}


