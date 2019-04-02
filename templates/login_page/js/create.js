var username = document.getElementsByName("username");
var password = document.getElementsByName("password");
var retype = document.getElementsByName("rePassword");
var email = document.getElementsByName("email");

function validateInput() {
    var userRegex = /^[a-z0-9]+$/;
    var validation = 1;
    var matchingPasswords = 1;

    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email[0].value.match(emailRegex)) {
        document.getElementById("msgEmail").style.visibility = "visible";
        validation = 0;
    } else {
        document.getElementById("msgEmail").style.visibility = "hidden";
    }

    if (!username[0].value.match(userRegex)) {
        document.getElementById("msgUser").style.visibility = "visible";
        validation = 0;
    }
    else {
        document.getElementById("msgUser").style.visibility = "hidden";
    }
    var passRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!password[0].value.match(passRegex)) {
        document.getElementById("msgPass").style.visibility = "visible";
        validation = 0;
    } else {
        document.getElementById("msgPass").style.visibility = "hidden";
    }

    if (retype[0].value != password[0].value) {
        document.getElementById("samePass").style.visibility = "visible";
        matchingPasswords = 0;
    } else {
        document.getElementById("samePass").style.visibility = "hidden";
    }

    if (validation == 1 && matchingPasswords) {

        var xhr = new XMLHttpRequest();
        var url = "/users";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 201) {
                // var json = JSON.parse(xhr.responseText);
                console.log('yay');
                window.location.href = "../../front/map_page/map_page.html";
                // console.log(json.email + ", " + json.password);
            } else{
                console.log('esti prst');
            }
        };
        var user = new Object();
        user.username=username[0].value;
        user.password=password[0].value;
        user.role='common user';
        user.subscription=[];
        user.places=[];
        var jsonString= JSON.stringify(user);
        console.log(jsonString);
        // var data = JSON.stringify({"email": "hey@mail.com", "password": "101010"});
        xhr.send(jsonString);

        // window.location.href = "../../front/map_page/map_page.html";
    }
}