const join_btn = document.getElementById("join");
const admin_btn = document.getElementById("admin");
var login_btn = null;
var name = null;
var tabInfo = new Object();
const regexpURL = new RegExp("^https*:\/\/meet.google.com\/[a-z]*\-[a-z]*\-[a-z]*");
retrieveTabInfo();

function retrieveTabInfo() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        let activeTab = tabs[0];
        tabInfo['tabId'] = activeTab.id;
        tabInfo['tabUrl'] = activeTab.url;

        if (!regexpURL.test(tabInfo['tabUrl'])) {notGoogleMeet();}
    });
}

function notGoogleMeet() {
    console.log("not Google Meet");
    document.getElementsByClassName("container-fluid")[0].remove();

    let container = document.createElement("div");
    container.className = "container-fluid";
    let row = document.createElement("div");
    row.className = "row";
    let col1 = document.createElement("div");
    col1.className = "col-12";
    let span = document.createElement("span");
    span.innerText = "Not Google Meet";
    span.style.fontSize = "larger";
    col1.append(span);
    let col2 = document.createElement("div");
    col2.className = "col-12 section";
    col2.innerText = "This extension only works with google meet page, for now";
    col2.style.fontSize = "smaller";
    row.append(col1, col2);
    container.append(row);
    document.body.appendChild(container);
}

join_btn.addEventListener('click', function (){
    if (validateWelcomeForm()) {
        let name = document.forms['welcomeForm']['name'].value;
        window.open('./analysis.html?name='+name+'&admin=false&tabId=' + tabInfo['tabId'],'result','width=370px, height=700px');
        window.close();
        // document.getElementById('welcomeForm').submit();
    }
})

function validateWelcomeForm() {
    let name = document.forms['welcomeForm']['name'].value;
    if (name == "") {
        document.getElementById("enter_name_input").placeholder = "please enter your name"
        return false;
    }
    return true;
}

admin_btn.addEventListener('click', function() {
    if (!validateWelcomeForm()){
        return false;
    }
    name = document.forms['welcomeForm']['name'].value;
    document.getElementsByTagName("form")['welcomeForm'].setAttribute("name", "loginForm");
    document.getElementById("enter_name").textContent = "Admin Login";
    let username_input = document.getElementById("enter_name_input");
    username_input.setAttribute("name", "username");
    username_input.value = '';
    username_input.setAttribute("placeholder", "username");
    let pwd_input = document.createElement("input");
    pwd_input.type = "password";
    pwd_input.name = "password";
    pwd_input.className = "input text-input my-1"
    pwd_input.setAttribute("placeholder", "password");
    username_input.parentNode.append(pwd_input);
    let login_row = document.getElementById("join").parentNode;
    document.getElementById("join").remove();
    document.getElementById("admin").remove();
    login_btn = document.createElement("div");
    login_btn.className = "col-10 mx-auto mt-3 my-1 link-like-text button text-center";
    login_btn.id = "login_button";
    login_btn.textContent = "login";
    login_btn.addEventListener('click', function (){
        if (validateJoinForm()) {
            window.close();
            window.open('./analysis.html?name='+name+'&admin=true&tabId=' + tabInfo['tabId'],'result','width=370px, height=700px');
            document.getElementById('welcomeForm').submit();
        }
    })
    login_row.append(login_btn);
    document.getElementById("join").appendChild(login_btn);
    document.getElementById("admin").remove();
    document.getElementById("or").textContent = "";
})

function validateJoinForm() {
    let username = document.forms['loginForm']['username'].value;
    let password = document.forms['loginForm']['password'].value;
    if (username == "" || password == "") {
        alert("Please enter your username and password");
        return false;
    }
    if (username == "admin" && password == "1234") {
        return true;
    } else {
        alert("wrong username or password");
        return false;
    }
}

