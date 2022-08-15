let msg = "default alert";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "msg_content") {
            try {
                msg = request.content;
                console.log(request.content);
                console.log('set msg');
            }
            catch (e) {
                console.log(e);
                sendResponse({success: false});
            }
        }
        sendResponse({success: true});
    }
);

console.log("reach here");
if (document.getElementById("alert") != null) {
    document.getElementById("alert").textContent = msg;
}