let chatTextarea = null;
let chatTextareaSubmitBtn = null;
let cc_notify = null;
let notificationCenter = null;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == 'listener') {
            try {
                if (chatTextarea == null) {findChatTextArea();}

                if (request.expectingStatus == 'on') {
                    chatTextarea.addEventListener('keyup', chatSpeakNotifyListenerHandler)
                    chatTextarea.placeholder = "Please keep text chat to a minimum";
                    console.log('chat speak out notification turned on');
                }
                else {
                    chatTextarea.removeEventListener('keyup', chatSpeakNotifyListenerHandler)
                    chatTextarea.placeholder = "Send a message to everyone";
                    console.log('chat speak out notification turned off');
                }

                sendResponse({success: true});
            }
            catch (e){
                console.log(e);
                sendResponse({success: false, error: e});
            }
        }
        else if (request.type == 'cc') {
            try {
                if (request.expectingStatus == 'on') {
                    setCCNotify();
                } else {
                    if (cc_notify) {
                        clearInterval(cc_notify);
                        cc_notify = null;
                    }
                }
                sendResponse({success: true});
            }
            catch (e) {
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
                if (chatBtn) chatBtn.parentNode.removeChild(chatBtn);

                const infoBtns = document.querySelectorAll('[aria-label="Meeting details"]');
                for (let i = 0; i < infoBtns.length; i++) {
                    if (infoBtns[i].tagName == "BUTTON") {
                        infoBtns[i].remove();
                        break;
                    }
                }

                const peopleBtns = document.querySelectorAll('[aria-label="Show everyone"]');
                for (let i=0; i < peopleBtns.length; i++) {
                    if (peopleBtns[i].tagName == "BUTTON") {
                        peopleBtns[i].parentNode.nextSibling.remove();
                        peopleBtns[i].remove();
                        break;
                    }
                }

                const activitiesBtns = document.querySelectorAll('[aria-label="Activities"]');
                for (let i=0; i < activitiesBtns.length; i++) {
                    if (activitiesBtns[i].tagName == "BUTTON") {
                        activitiesBtns[i].remove();
                        break;
                    }
                }

                window.setTimeout(function () {
                    /* bind a listener to "send" button, wait for page to load*/
                    findChatTextArea();
                    enableChatTextCollecting();
                    alterMessageToNotificationCenter();

                    const chatCloseBtn = document.querySelector('[aria-label="Close"]');
                    if (chatCloseBtn) chatCloseBtn.parentNode.removeChild(chatCloseBtn);
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
        else if (request.type == 'close') {
            try {
                disableChatTextCollecting();
            }
            catch (e) {
                console.log(e);
                sendResponse({success: false});
            }
        }
    }
);

function chatSpeakNotifyListenerHandler(event) {
    if (event.key === 'Enter') {
        try {
            window.setTimeout(()=> {
                const newNode = notificationCenter.lastChild.cloneNode(true);
                newNode.setAttribute('data-sender-id', 'accessible-classroom-extension');
                newNode.firstChild.firstChild.textContent = 'Accessible Classroom Chrome Extension';
                let newMsgNode = newNode.childNodes[1].firstChild.cloneNode(false);
                newMsgNode.textContent = 'Please keep text chat to a minimum. If you have a question or comment, raise your hand and wait to speak.';
                newMsgNode.style.fontSize = '1.5em !important';
                let newBracketNode = newNode.childNodes[1].cloneNode(false);
                newNode.childNodes[1].remove()
                newBracketNode.appendChild(newMsgNode);
                newNode.appendChild(newBracketNode);

                notificationCenter.append(newNode);
            }, 2000);
        }
        catch (e) {
            console.log(e);
        }
    }
}

function findChatTextArea() {
    let TextareaCollection = document.getElementsByTagName('textarea');
    if (TextareaCollection.length == 0) {
        throw 'cannot find textarea element error';
    }
    console.log('find node -- textarea' + TextareaCollection[0]);
    chatTextarea = TextareaCollection[0];
}

let text = null;

function submitBtn() {
    chrome.runtime.sendMessage({type: 'chatText', num_words: chatTextarea.value.split(' ').length}, function (response) {
        console.log(response.success);
    })
}

function chatArea(e) {
    if (e.key !== 'Enter' || e.keyCode !== 13) {
        text = chatTextarea.value;
    }
    if (e.key === 'Enter' || e.keyCode === 13) {
        chrome.runtime.sendMessage({type: 'chatText', num_words: text.split(' ').length}, function (response) {
            console.log(response.success);
        })
    }
}

function disableChatTextCollecting() {
    chatTextareaSubmitBtn.removeEventListener('click', submitBtn);
    chatTextarea.removeEventListener('keyup', chatArea);
    chatTextarea.removeEventListener('keyup', chatSpeakNotifyListenerHandler);
    chatTextarea.placeholder = "Send a message to everyone";
    if (cc_notify) {
        clearInterval(cc_notify);
    }
}

function enableChatTextCollecting() {
    chatTextareaSubmitBtn = chatTextarea.parentNode.parentNode.parentNode.querySelector("button");

    chatTextareaSubmitBtn.addEventListener('click', submitBtn);
    chatTextarea.addEventListener('keyup', chatArea);
}

function setCCNotify() {
    cc_notify =  window.setInterval(function() {
        const captionOnBtn = document.querySelector('[aria-label*="on captions"]');

        if (captionOnBtn) {
            chrome.runtime.sendMessage({type: "cc_notification", msg: "Make the meeting experience better for everyone by turning on captions. Click CC button at the bottom of the screen."}, function (response) {
                console.log(response.success);
            })
        }
    }, 120000);
}

function alterMessageToNotificationCenter() {
    let xpath = "//div[text()='In-call messages']";
    let centerTitle = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    let possibleCenter = document.querySelectorAll('[aria-live="polite"]');
    console.log(possibleCenter);
    let index = 0;
    for (; index < possibleCenter.length; index++) {
        if (findChild(centerTitle.parentElement.parentElement, possibleCenter[index])) {
            break;
        }
    }
    notificationCenter = possibleCenter[index];
    console.log(notificationCenter);
}

function findChild(node, asked) {
    if (node == asked) {
        return true
    }
    if (node.childNodes == null){
        return false
    }
    let found = false;
    for (let i = 0; i < node.childNodes.length; i++) {
        let val = findChild(node.childNodes[i], asked);
        if (val == true) {
            found = true;
            break;
        }
    }
    return found
}