chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "art") {
            document.getElementById("alert").innerText = request.content;
        }
        sendResponse({success: true});
    }
);