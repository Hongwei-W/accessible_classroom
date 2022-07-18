const join_btn = document.getElementById("join_button");
const admin_btn = document.getElementById("admin_button");
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
    col1.innerText = "This is not a Google meet page, please open a google meet page and try again";
    let col2 = document.createElement("div");
    col2.className = "col-12";
    col2.innerText = "This extension only works with google meet page, for now";
    row.append(col1, col2);
    container.append(row);
    document.body.appendChild(container);
}

join_btn.addEventListener('click', function (){
    if (validateWelcomeForm()) {
        let name = document.forms['welcomeForm']['name'].value;
        window.open('./analysis.html?name='+name+'&admin=false&tabId=' + tabInfo['tabId'],'result','width=670px, height=700px');
        window.close();
        // document.getElementById('welcomeForm').submit();
    }
})

function validateWelcomeForm() {
    let name = document.forms['welcomeForm']['name'].value;
    if (name == "") {
        alert("Please enter your name");
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
    document.getElementById("then").textContent = "";
    let pwd_input = document.createElement("input");
    pwd_input.type = "password";
    pwd_input.name = "password";
    pwd_input.setAttribute("placeholder", "password");
    document.getElementById("pwd").appendChild(pwd_input);
    document.getElementById("join_button").remove();
    login_btn = document.createElement("input");
    login_btn.type = "button";
    login_btn.className = "btn";
    login_btn.id = "login_button";
    login_btn.name = "login_button";
    login_btn.value = "Login";
    login_btn.addEventListener('click', function (){
        if (validateJoinForm()) {
            window.close();
            window.open('./analysis.html?name='+name+'&admin=true&tabId=' + tabInfo['tabId'],'result','width=670px, height=700px');
            document.getElementById('welcomeForm').submit();
        }
    })
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

