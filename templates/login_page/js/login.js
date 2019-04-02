// var loginButton = document.getElementById("loginButton");
var username = document.getElementsByName("username");
var password = document.getElementsByName("password");

function validateInput() {
    var userRegex = /^[a-z0-9]+$/;
    var validUser = 1;
    var validPassword = 1;
    if (!username[0].value.match(userRegex)) {
        document.getElementById("invalidSmth").style.visibility = "visible";
        validUser = 0;
    }
    else {
        document.getElementById("invalidSmth").style.visibility = "hidden";
        validUser = 1;
    }
    var passRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!password[0].value.match(passRegex)) {
        document.getElementById("invalidSmth").style.visibility = "visible";
        validPassword = 0;
    } else {
        document.getElementById("invalidSmth").style.visibility = "hidden";
        validPassword = 1;
    }

    // var xmlHttp = new XMLHttpRequest();
    // xmlHttp.open( "GET", 'http://localhost:6969/users/oanabzz', false ); // false for synchronous request
    // xmlHttp.send( null );
    // console.log(xmlHttp.response);

    var url = 'http://localhost:6969/users/login';

    if (validPassword == 1 && validUser == 1) {

        var xhr = new XMLHttpRequest();
        var url = "/users/login";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // var json = JSON.parse(xhr.responseText);
                console.log(xhr.getAllResponseHeaders());
                console.log('yay');
                window.location.href = "../../front/map_page/map_page.html";
                // console.log(json.email + ", " + json.password);
            } else{
                document.getElementById("invalidSmth").style.visibility = "visible";
            }
        };
        var user = new Object();
        user.username=username[0].value;
        user.password=password[0].value;
        var jsonString= JSON.stringify(user);
        console.log(jsonString);
        // var data = JSON.stringify({"email": "hey@mail.com", "password": "101010"});
        xhr.send(jsonString);

    }
}