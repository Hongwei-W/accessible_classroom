const join_btn = document.getElementById("join_button");
const admin_btn = document.getElementById("admin_button");
var login_btn = null;
var name = null;
var tabId = null;
retrieveTabInfo();

join_btn.addEventListener('click', function (){
    if (validateWelcomeForm()) {
        let name = document.forms['welcomeForm']['name'].value;
        window.open('./analysis.html?name='+name+'&admin=false&tabId=' + tabId,'result','width=620px, height=700px');
        window.close();
        // document.getElementById('welcomeForm').submit();
    }
})

function retrieveTabInfo() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        var activeTab = tabs[0];
        console.log("tabID ", activeTab.id);
        tabId = activeTab.id;
    });
}

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
            window.open('./analysis.html?name='+name+'&admin=true&tabId=' + tabId,'result','width=620px, height=700px');
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

