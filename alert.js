let msg = "default alert";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === "msg_content") {
            console.log('set msg');
            try {
                msg = request.content;
                console.log(request.content);
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