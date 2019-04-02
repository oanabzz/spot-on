subs = false;
var nextId = 1;
map;
isDrawableFlag = true;
markers = {};
placesDB = [];

function subscriptionManager() {
    Notification.requestPermission(function (status) {
        console.log('Notification permission status:', status);

        if (browserSubscription === null && status === 'granted') {
            permissionGranted();
            subscribeUser();
        } else if (browserSubscription === null && status === 'denied') {
            permissionNotGranted();
        } else if (browserSubscription !== null) {
            unsubscribeUser();
            permissionNotGranted();
        }
    });
}

function permissionGranted() {
    document.getElementById("subscription").classList.add('far', 'fa-bell', 'fa-3x');
    document.getElementById("subscription-helper").innerHTML = "click to unsubscribe to notifications";
}

function permissionNotGranted() {
    document.getElementById("subscription").classList.add('far', 'fa-bell-slash', 'fa-3x');
    document.getElementById("subscription-helper").innerHTML = "click to subscribe to notifications";
}

(function onInit(){
    var username = document.cookie.split("Session=")[1].split("username")[1].split('"')[2];
    getPlaces(username);
    
    // var places = JSON.parse(getPlaces(username))
}());

function showCurrentPlaces(placesString) {
    console.log(placesString);
    var username = document.cookie.split("Session=")[1].split("username")[1].split('"')[2];

    var places = JSON.parse(placesString);
    // var lastPlace = JSON.parse(places[places.length]);
    console.log(places[places.length-1].id.split('_')[1]);
    // nextId = places[places.length-1].split(username+'_')[1].split('"')[0];
    nextId = Number(places[places.length-1].id.split('_')[1]) + 1;
    console.log(nextId);

    for(var i =0;i < places.length;i++){
        placesDB.push(places[i]);
    }
    for(var i =0;i < places.length;i++){    
        templateItem(i);
    }
}

function functieDeAdaugare() {
    if (isDrawableFlag == true) {
        isDrawableFlag = false;
        document.getElementById("bam-input").style.marginLeft = "10px";

        markPlaces(map);
    }
}

var removeItem = function (id) {
    console.log('ID REMOVE: ' + id);
    console.log('ID: ' + id.substr(1));
    var username = document.cookie.split("Session=")[1].split("username")[1].split('"')[2];

    deletePlace(username, username + '_' + id.substr(1));

    var lista = document.getElementById("lista");
    var entry = document.getElementById(id);

    var numericId = id.substr(1);
    markers["marker" + numericId].setMap(null);

    lista.removeChild(entry);
}

var renameItem = function (id) {
    var username = document.cookie.split("Session=")[1].split("username")[1].split('"')[2];
    console.log('id '+id);
    var lista = document.getElementById("lista");
    var entry = document.getElementById(id);
    var text = document.getElementById('edit' + id);
    markers["marker" + id.substr(1)].setDraggable(true);
    markers["marker" + id.substr(1)].setOpacity(0.7);
    
    if (text.dataset.editing == "false") {
        text.innerHTML = "<input value='" + text.innerHTML + "' type='text' maxlength='20' id='inputRename" + id + "'>";
        text.dataset.editing = true;
        var inputRename = document.getElementById('inputRename' + id);
        inputRename.addEventListener("keyup", function (event) {
            if (event.keyCode == 13 && inputRename.value.length > 0) {
                console.log(text.innerHTML);
                text.innerHTML = inputRename.value;
                text.dataset.editing = false;
                markers["marker" + id.substr(1)].setDraggable(false);
                markers["marker" + id.substr(1)].setOpacity(1);
                console.log(id.substr(1));
                console.log('input rename:  ');
                console.log(inputRename.value);
                console.log('inpul value:  '+inputRename.value);
  
                //document.getElementById("infoWindow" + id.split('i')[1]).setContent = inputRename.value;
                markers["marker"+id.split('i')[1]].infowindow.setContent(inputRename.value);
                updatePlace(username, username+ "_" + id.substr(1),
                    markers["marker" + id.substr(1)].position.lat,
                    markers["marker" + id.substr(1)].position.lng,
                    inputRename.value );
                    
            }
            markers["marker" + id.substr(1)].setOpacity(1);
            
        });
    }    

};

function openMenu() {
    document.getElementById("menu").style.height = "140px";
    [].forEach.call(document.querySelectorAll('.menuButton'), function (el) {
        el.style.visibility = 'visible';
    });
}

function closeMenu() {
    document.getElementById("menu").style.height = "0px";

    [].forEach.call(document.querySelectorAll('.menuButton'), function (el) {
        el.style.visibility = 'hidden';
    });
}

function controleMenu() {
    if (document.getElementById("menu").style.height == "0px")
        openMenu();
    else
        closeMenu();
}

(function (currentCircle) {
    var bamInput = document.getElementById("bam-input");
    var username = document.cookie.split("Session=")[1].split("username")[1].split('"')[2];

    bamInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13 && bamInput.value.length > 0) {
            var previousId = nextId;
            var previousValue = bamInput.value;

            templateItemNou(bamInput.value);
            bamInput.value = "";
            bamInput.style.marginLeft = "-700px";
            bamInput.blur();

            let marker = markers["marker" + previousId];
            marker.setDraggable(false);
            marker.setOpacity(1);
            postPlace(username + '_' + previousId, marker.getPosition().lng(), marker.getPosition().lat(), previousValue);

            marker.infowindow = new google.maps.InfoWindow({
                content: `<p id="infoWindow${previousId}">` + previousValue + "</p>"
            });

            marker.addListener('click', function () {
                marker.infowindow.open(map, marker);
            });

            isDrawableFlag = true;
        }
    })

})();

var templateItem = function(i){
    var lista = document.getElementById("lista");
    var entry = document.createElement('li');
    var banana = document.createElement('span');
    var button = document.createElement('i');
    var reButton = document.createElement('i');

    var idLocal = placesDB[i].id.split('_')[1];

    entry.setAttribute("id", "i" + String(idLocal));

    banana.appendChild(document.createTextNode(placesDB[i].name));
    banana.setAttribute("id", "edit" + "i" +  String(idLocal));
    banana.dataset.editing = false;

    button.className += "fas fa-trash-alt delete-button";
    button.setAttribute("onclick", "removeItem('i" +  String(idLocal)+ "')");
    //button.onclick = removeItem("i" + nextId);

    reButton.className += "fas fa-edit rename-button";
    reButton.setAttribute("onclick", "renameItem('i" +  String(idLocal)+ "')");

    entry.appendChild(banana);
    entry.appendChild(reButton);
    entry.appendChild(button);

    var previousChild = document.getElementById("i" +  (Number(placesDB[i].id.split('_')[1]) - 1));
    
    lista.insertBefore(entry, previousChild);

    var latPlace = placesDB[i].latitude;
    var lngPlace = placesDB[i].longitude;

    console.log(latPlace);
    console.log(lngPlace);

    var marker = new google.maps.Marker({
        map: map,
        position: {lat: latPlace, lng: lngPlace},
        animation: google.maps.Animation.DROP,
        draggable: false
    });
    
    marker.infowindow = new google.maps.InfoWindow({
        content:`<p id="infoWindow${Number(idLocal)}">` +  placesDB[i].name + "</p>"
    });

    marker.addListener('click', function () {
        marker.infowindow.open(map, marker);
    });

    markers["marker" + idLocal] = marker;

}

var templateItemNou = function (text) {
    var lista = document.getElementById("lista");

    var entry = document.createElement('li');
    entry.setAttribute("id", "i" + nextId);

    var banana = document.createElement('span');
    banana.appendChild(document.createTextNode(text));
    banana.setAttribute("id", "edit" + "i" + nextId);
    banana.dataset.editing = false;

    var button = document.createElement('i');
    button.className += "fas fa-trash-alt delete-button";
    button.setAttribute("onclick", "removeItem('i" + nextId + "')");
    //button.onclick = removeItem("i" + nextId);

    var reButton = document.createElement('i');
    reButton.className += "fas fa-edit rename-button";
    reButton.setAttribute("onclick", "renameItem('i" + nextId + "')");

    entry.appendChild(banana);
    entry.appendChild(reButton);
    entry.appendChild(button);

    var previousChild = document.getElementById("i" + (nextId - 1));

    nextId++;

    lista.insertBefore(entry, previousChild);
    // postPlace('23423',12,12,'home');
}


function markPlaces(map) {
    var marker = new google.maps.Marker({
        map: map,
        position: map.getCenter(),
        animation: google.maps.Animation.DROP,
        draggable: true
    });
    marker.setOpacity(0.7);
    markers["marker" + nextId] = marker;
}

function updateSubscription(subscription) {
    var username = JSON.parse(getCookie("Session")).username;
    const userUpdate = {"subscription": subscription};
    const userUpdateJson = JSON.stringify(userUpdate);
	const xhrForSubscription = new XMLHttpRequest();
	xhrForSubscription.open("PATCH", "/users/" + username, true);

    xhrForSubscription.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 201) {
            console.log(xhrForSubscription.responseText);
        }
    };
    xhrForSubscription.setRequestHeader("Set-Cookie", document.cookie);
    xhrForSubscription.send(userUpdateJson);
}

function checkSubscriptionFromServer() {
    var username = JSON.parse(getCookie("Session")).username;
    const xhr = new XMLHttpRequest();

    xhr.open("GET", "/users/isSubcribed/" + username, true);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            var isSubcribed = xhr.responseText === "true";
            if (isSubcribed) {
                subscriptionManager();
            }
        }
    }

    xhr.setRequestHeader("Set-Cookie", document.cookie);
    xhr.send();
}

function postPlace(id, lng, lat, name) {
    var username = document.cookie.split("Session=")[1].split("username")[1].split('"')[2];
    console.log(username);
    var place = new Object();
    place.id=id;
    place.longitude=lng;
    place.latitude = lat;
    place.name = name;
    place.userId = username;
    place.danger =false;
    var placeJson= JSON.stringify(place);
    console.log(placeJson);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/places/" + username, true);

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 201) {
            console.log(xhr.responseText);
        }
    };
    xhr.setRequestHeader("Set-Cookie", document.cookie);
    xhr.send(placeJson);
}


function deleteAllCookies() {
    document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

function getPlaces(username) {
    var xhr = new XMLHttpRequest();
    var url = "/places/" + username;
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Set-Cookie", document.cookie);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.getAllResponseHeaders());
            console.log(xhr.responseText);
            console.log(this.responseText);
            //update ok idk what s next
            showCurrentPlaces(xhr.responseText);
        }
    };
    xhr.send();
}

function updatePlace(username, placeId, lat, long, name) {

    //!!!!!!!!!!!!!!!!!!!!!!!!!!
    //placeId de forma username_id

    var update = new Object();
    if (lat != null) {
        update.latitude = lat;
    }
    if (long != null) {
        update.longitude = long;
    }
    if (name != null) {
        update.name = name;
    }
    var jsonString = JSON.stringify(update);
    console.log(jsonString);
    var xhr = new XMLHttpRequest();
    var url = "/places/" + username + "/" + placeId;
    xhr.open("PATCH", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Set-Cookie", document.cookie);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            //update ok idk what s next

        }
    };
    xhr.send(jsonString);
}

function deletePlace(username, placeId) {
    var xhr = new XMLHttpRequest();
    var url = "/places/" + username + "/" + placeId;
    xhr.open("DELETE", url, true);
    xhr.setRequestHeader("Set-Cookie", document.cookie);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.getAllResponseHeaders());

            //update ok idk what s next

        }
    };
    xhr.send();
}