var role;

function findRole() {
    var cookie = document.cookie;//"admin Session";
    if (cookie.includes("admin")) {
        role = "admin";
    }
    if (cookie.includes("common user")) {
        role = "common user";
    }
    if (!cookie.includes("Session")) {
        role = "not logged";
    }
}

function route() {
    findRole();
    if (role.includes("admin")) {
        document.getElementById("menuButton").innerHTML = "Add Crisis";
    }
    if (role.includes("common user")) {
        document.getElementById("menuButton").innerHTML = "My Places";
    }
    if (role.includes("not logged")) {
        document.getElementById("menuButtonLogChangeable").innerHTML = "Log In";
    }
    else {
        document.getElementById("menuButtonLogChangeable").innerHTML = "Log Out";
    }
}

function redirect() {
    findRole();
    if (role.includes("admin")) {
        location.href = '../../add_crisis_page/add_crisis_page.html';
    }
    if (role.includes("common user")) {
        location.href = '../../my_account_page/my_account_page.html';
    }

}

var crisisJsonArray = [];
var crisisCircles = [];
var overLayedCrisisCircles = [];
var map;

function openNav() {
    const mediaQuery = window.matchMedia("(max-width: 479px)");

    if (mediaQuery.matches) {
        console.log("screen smaller than 479px");
        document.getElementById("sidenav").style.width = "90%";
    }
    else {
        console.log("screen larger than 479px");
        document.getElementById("sidenav").style.width = "33%";
    }

    var sidenavTextList = document.getElementsByClassName("sidenavText");
    for (i = 0; i < sidenavTextList.length; i++) {
        sidenavTextList[i].style.transition = "opacity 0.75s";
        sidenavTextList[i].style.transitionDelay = "0.3s";
        sidenavTextList[i].style.opacity = "1";
    }
}

function closeNav() {
    var sidenavTextList = document.getElementsByClassName("sidenavText");
    for (i = 0; i < sidenavTextList.length; i++) {
        sidenavTextList[i].style.transition = "opacity 0.1s";
        sidenavTextList[i].style.opacity = "0";
    }
    document.getElementById("sidenav").style.width = "0%";
}

function controleNav() {
    if (document.getElementById("sidenav").style.width === "0%")
        openNav();
    else
        closeNav();
}

function openMenu() {
    document.getElementById("menu").style.height = "150px";
    document.getElementById("menuButtonLogChangeable").style.visibility = "visible";
    document.getElementById("menuButton").style.visibility = "visible";
}

function closeMenu() {
    document.getElementById("menu").style.height = "0px";
    document.getElementById("menuButtonLogChangeable").style.visibility = "hidden";
    document.getElementById("menuButton").style.visibility = "hidden";

}

function controleMenu() {

    if (document.getElementById("menu").style.height === "0px")
        openMenu();
    else
        closeMenu();
}

function controleNav() {
    if (document.getElementById("sidenav").style.width === "0%")
        openNav();
    else
        closeNav();
}

function initMap() {
    var iasi = {lat: 47.151726, lng: 27.587914};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: iasi,
        mapTypeId: 'terrain'
    });

    getAllCrises();
    // setInterval(function () {
    //     checkForNewCrises();
    // }, 5000);
}

//test function, to be deleted
function printPlaces(arr) {
    for (i = 0; i < arr.length; i++) {
        console.log(arr[i].id);
        console.log(arr[i].latitude);
        console.log(arr[i].longitude);
        console.log(arr[i].radius);
        console.log(arr[i].status);
    }
}

//deprecated
function markPlaces(crisisJsonArray, map) {
    for (i = 0; i < crisisJsonArray.length; i++) {
        if (crisisJsonArray[i].status == false) continue;
        markPlace(crisisJsonArray[i], i);
    }
}

function markPlace(crisisPlace) {
    var crisisCircle;
    crisisCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#ff0000',
        fillOpacity: 0.35,
        map: map,
        center: {
            lat: crisisPlace.latitude,
            lng: crisisPlace.longitude
        },
        radius: crisisPlace.radius
    });
    crisisCircles[crisisPlace.id] = crisisCircle;
    animateCircle(crisisCircle, map, crisisPlace.id);
}

function animateCircle(crisisCircle, map, id) {
    var overLayedCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0,
        strokeWeight: 0,
        fillColor: 'red',
        fillOpacity: 0.2,
        map: map,
        center: {
            lat: crisisCircle.getCenter().lat(),
            lng: crisisCircle.getCenter().lng()
        },
        radius: crisisCircle.getRadius()
    });

    setInterval(function () {
        overLayedCircle.setRadius(overLayedCircle.getRadius() + 10);
        if (overLayedCircle.getRadius() > 3 * crisisCircle.getRadius()) {
            overLayedCircle.setRadius(crisisCircle.getRadius());
        }
    }, 15);

    overLayedCrisisCircles[id] = overLayedCircle;
}

function deleteAllCookies() {
    if (document.getElementById("menuButtonLogChangeable").innerHTML === "Log Out") {
        document.cookie.split(";").forEach(function (c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
    }
}

function addToFeed(newCrisisJsonArray, description, time, index) {
    let newInnerHtml = '<div class="crisisWrapper" id="' + newCrisisJsonArray[index].id + '">' +
        '<p class="sidenavText" onclick="centerMapOnCrisis(' + index + ')"> &#9898' + description + ' @' + time + '</p>';

    if (role.includes('admin')) {
        newInnerHtml = newInnerHtml +
            '<div class="adminOptionsWrapper">' +
            '<p class="adminOption" onclick="getCrisisUpdate(' + '\'' + newCrisisJsonArray[index].id + '\'' + ')">update</p>' +
            '<p class="adminOption" onclick="setResolved(' + '\'' + newCrisisJsonArray[index].id + '\'' + ',' + index + ')">set resolved</p>' +
            '</div>'
    }

    newInnerHtml = newInnerHtml + '</div>';

    document.getElementById("sidenav").innerHTML = newInnerHtml + document.getElementById("sidenav").innerHTML;
}

function centerMapOnCrisis(index) {
    map.setCenter(
        new google.maps.LatLng(
            crisisJsonArray[index].latitude,
            crisisJsonArray[index].longitude
        )
    )
}

function getAllCrises() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/crises", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log(this.responseText);
            crisisJsonArray = JSON.parse(this.responseText);
            console.log(crisisJsonArray);
            // crisisJsonArray.sort(function (a, b) {
            //     return a.beginDate > b.beginDate;
            // });
            //printPlaces(crisisJsonArray);
            for (i = 0; i < crisisJsonArray.length; i++) {
                if (crisisJsonArray[i].status == false) continue;
                markPlace(crisisJsonArray[i], i);
                addToFeed(crisisJsonArray, crisisJsonArray[i].description, crisisJsonArray[i].beginDate, i);
            }
        }
    };

    //TODO: add a 'loading' gif while waiting for response
    xhr.send();
}

function checkForNewCrises() {
    console.log("checking for new updates..");

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/crises", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let newCrisisJsonArray = JSON.parse(this.responseText);
            newCrisisJsonArray.sort(function (a, b) {
                return a.beginDate > b.beginDate;
            });
            if (newCrisisJsonArray.length > crisisJsonArray.length) {
                console.log("New crises found");

                let oldLength = crisisJsonArray.length;
                let newLength = newCrisisJsonArray.length;

                for (let i = oldLength; i < newLength; i++) {
                    addToFeed(newCrisisJsonArray, newCrisisJsonArray[i].description, newCrisisJsonArray[i].beginDate, i);
                    markPlace(newCrisisJsonArray[i]);
                }
            }

            crisisJsonArray = newCrisisJsonArray;

            let resolvedCrisesIdList = getResolvedCrisesIds(crisisJsonArray);
            for (let i = 0; i < resolvedCrisesIdList.length; i++) {
                removeCircle(resolvedCrisesIdList[i]);
                removeFromFeed(resolvedCrisesIdList[i]);
            }
        }
    };

    xhr.send();
}

function updateCrisis(id, lat, long, radius, status, beginDate, endDate, description, type) {
    var update = new Object();
    if (id != null) {
        update.id = id;
    }
    if (lat != null) {
        update.latitude = lat;
    }
    if (long != null) {
        update.longitude = long;
    }
    if (radius != null) {
        update.radius = radius;
    }
    if (status != null) {
        update.status = status;
    }
    if (beginDate != null) {
        update.beginDate = beginDate;
    }
    if (endDate != null) {
        update.endDate = endDate;
    }
    if (description != null) {
        update.description = description;
    }
    if (type != null) {
        update.type = type;
    }

    var updateJson = JSON.stringify(update);
    // console.log(updateJson);

    var xhr = new XMLHttpRequest();
    var url = "/crises/" + id;
    xhr.open("PATCH", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.getAllResponseHeaders());
            console.log('yay');
        }
    };
    console.log(updateJson);
    xhr.setRequestHeader('Set-Cookie', document.cookie);
    xhr.send(updateJson);
}

function setResolved(id) {
    removeCircle(id);
    removeOverLayedCircle(id);
    removeFromFeed(id);
    updateCrisis(id, null, null, null, false, null, (new Date()).toUTCString(), null, null);
}

function removeCircle(id) {
    console.log(id);
    crisisCircles[id].setMap(null);
}

function removeOverLayedCircle(id) {
    overLayedCrisisCircles[id].setMap(null);
}

function removeFromFeed(id) {
    document.getElementById(id).remove();
}

function getResolvedCrisesIds(jsonArray) {
    let idList = [];
    for (let i = 0; i < jsonArray.length; i++) {
        if (jsonArray[i].status == false) {
            if (document.getElementById(jsonArray[i].id) != null) {
                idList.push(jsonArray[i].id);
            }
        }
    }

    return idList;
}

function getCrisisUpdate(wrapperId) {
    console.log(wrapperId);
    document.getElementById('body').innerHTML = document.getElementById('body').innerHTML +
        '<div id="updateDashboard">\n' +
        '        <input placeholder="lat" id="latInput" class="updateInput"/>\n' +
        '        <input placeholder="lng" id="lngInput" class="updateInput"/>\n' +
        '        <input placeholder="rad" id="radInput" class="updateInput"/>\n' +
        '        <textarea placeholder="crisis summary" id="updateDetails"></textarea>\n' +
        '        <div id="updateCrisisButton">\n' +
        '            Update\n' +
        '        </div>\n' +
        '    </div>';

    let lat = crisisCircles[wrapperId].getCenter().lat();
    let lng = crisisCircles[wrapperId].getCenter().lng();
    let rad = crisisCircles[wrapperId].getRadius();

    document.getElementById("latInput").value = lat;
    document.getElementById("lngInput").value = lng;
    document.getElementById("radInput").value = rad;

    document.getElementById('updateCrisisButton').addEventListener("click", function() {
        updateCrisis(wrapperId, lat, lng, rad, null, null, null, document.getElementById('updateDetails').value, null);
        document.getElementById('updateDashboard').remove();
        location.reload();
    })
}
