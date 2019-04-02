isMenuOpen = false;

function openNav(){
    var w = window.innerWidth;
	document.getElementById("sidenav").style.width = "320px";
    document.getElementById("sidenavTitle").style.visibility = "visible";
    document.getElementById("pickPlaceButton").style.visibility = "visible";
    document.getElementById("sidenavTitle").style.visibility = "visible";
    // document.getElementById("sidenavButtonWrapper").style.visibility = "visible";
    // document.getElementById("latitude").style.visibility="visible";
    [].forEach.call(document.querySelectorAll('.crisisInput'), function (el) {
        el.style.visibility = 'visible';
    });
}

function closeNav(){
    document.getElementById("sidenav").style.width = "0%";
    document.getElementById("sidenavTitle").style.visibility = "hidden";
    document.getElementById("pickPlaceButton").style.visibility = "hidden";
    document.getElementById("sidenavTitle").style.visibility = "hidden";
    // document.getElementById("sidenavButtonWrapper").style.visibility = "hidden";
	[].forEach.call(document.querySelectorAll('.crisisInput'), function (el) {
	  el.style.visibility = 'hidden';
	});
}
/*window.addEventListener("mouseup", function(event) {
    if(event.target != document.getElementById("menu")){
        closeMenu();
    }
    // if(event.target == document.getElementById("hamburger")){
    //     controleMenu();
    // }
})*/
function controleNav(){
    if(!isMenuOpen) {
        openNav();
    }
    else {
        closeNav();
    }
}

var circleDrawnOnMap = false;

function openMenu(){
    document.getElementById("menu").style.height = "140px";

    [].forEach.call(document.querySelectorAll('.menuButton'), function (el) {
        el.style.transition = 'opacity 0.5s';
        el.style.transitionDelay = '0.35s';
        el.style.opacity = '1';
    });

    isMenuOpen = true;
}

function closeMenu(){
    document.getElementById("menu").style.height = "0px";

    [].forEach.call(document.querySelectorAll('.menuButton'), function (el) {
        el.style.transitionDelay = '0';
        el.style.transition = 'opacity 0.2s';
        el.style.opacity = '0';
    });

    isMenuOpen = false;
}

function controleMenu(){
    if(document.getElementById("menu").style.height == "0px")
        openMenu();
    else
        closeMenu();
}

function initMap(){
    var iasi = {lat: 47.151726, lng: 27.587914};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: iasi,
        mapTypeId: 'terrain'
    });

    // //places will be loaded from db;
    // var dummyCrisisPlaces = [
    //     {lat: 47.174058, lng: 27.574899, radius: 350},
    //     {lat: 47.145914, lng: 27.582092, radius: 250}
    // ];

    var crisisJsonArray = [];

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/crises", true);
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("GOT JSONS");
            crisisJsonArray = JSON.parse(this.responseText);
            markCrises(crisisJsonArray, map);
        }
    };
    xhr.send();

    document.getElementById("pickPlaceButton").addEventListener("click", function () {
        if (circleDrawnOnMap === false) {
            markNewCrisis(map);
            circleDrawnOnMap = true;
            document.getElementById("pickPlaceButton").classList.remove("sidenavButton");
            document.getElementById("pickPlaceButton").classList.add("disabledSidenavButton");
            document.getElementById("postCrisisButton").classList.remove("disabledSidenavButton");
            document.getElementById("postCrisisButton").classList.add("sidenavButton");
            }
        });

    document.getElementById("postCrisisButton").addEventListener("click", function() {
        let longitude = document.getElementById("lngInput").value;
        let latitude = document.getElementById("latInput").value;
        let radius = document.getElementById("radInput").value;
        let description = document.getElementById("DescriptionTextArea").value;
        if(description === "") description = "Details unknown";
        let type = document.getElementById("crisisTypeSelect").value;
        let id = (longitude.toString() + latitude + radius).replace(/\s/g,'').replace(/\./g, '');
        postCrisis(id, longitude, latitude, radius, description, type);
    })
}

function markNewCrisis(map) {
    var latInput = document.getElementById("latInput").value;
    var lngInput = document.getElementById("lngInput").value;

    if(latInput == null || latInput == "", lngInput == null||lngInput =="" ){
        var crisisCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: '#ff0000',
            fillOpacity: 0.35,
            draggable: true
        });
        crisisCircle.setRadius(350);
        crisisCircle.setCenter(map.getCenter());
        crisisCircle.setMap(map);
        document.getElementById("latInput").value = crisisCircle.getCenter().lat();
        document.getElementById("lngInput").value = crisisCircle.getCenter().lng();
        document.getElementById("radInput").value = crisisCircle.getRadius();


        google.maps.event.addListener(crisisCircle, 'center_changed', function () {
            document.getElementById('latInput').value = crisisCircle.getCenter().lat();
            document.getElementById('lngInput').value = crisisCircle.getCenter().lng();
        });

        document.getElementById("latInput").addEventListener("input", function(){
            coordUpdate(crisisCircle, map);
        });
        document.getElementById("lngInput").addEventListener("input", function(){
            coordUpdate(crisisCircle, map);
        });

        document.getElementById("radInput").addEventListener("input", function(){
            crisisCircle.setRadius(parseFloat(document.getElementById("radInput").value));

        })
    } else{
        var newCrisisCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: '#ff0000',
            fillOpacity: 0.35,
            draggable: true
        });
        newCrisisCircle.setCenter({
            lat: parseFloat(document.getElementById("latInput").value),
            lng: parseFloat(document.getElementById("lngInput").value)
        });
        map.setCenter(newCrisisCircle.getCenter());
        newCrisisCircle.setRadius(Number(document.getElementById("radInput").value));
        document.getElementById("radInput").value = newCrisisCircle.getRadius();
        newCrisisCircle.setMap(map);

        google.maps.event.addListener(newCrisisCircle, 'center_changed', function () {
            document.getElementById('latInput').value = newCrisisCircle.getCenter().lat();
            document.getElementById('lngInput').value = newCrisisCircle.getCenter().lng();
        });

        document.getElementById("latInput").addEventListener("input", function(){
            coordUpdate(newCrisisCircle, map);
        });
        document.getElementById("lngInput").addEventListener("input", function(){
            coordUpdate(newCrisisCircle, map);
        });

        document.getElementById("radInput").addEventListener("input", function(){
            newCrisisCircle.setRadius(parseFloat(document.getElementById("radInput").value));
        })
    }
}

function coordUpdate(circle, map){
    circle.setCenter({
        lat: parseFloat(document.getElementById("latInput").value),
        lng: parseFloat(document.getElementById("lngInput").value)
    });
    map.setCenter(circle.getCenter());
}

function markCrises(crisisJsonArray, map) {
    for (i = 0; i < crisisJsonArray.length; i++) {
        if(crisisJsonArray[i].status == false) continue;
        var crisisCircle;
        crisisCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: '#ff0000',
            fillOpacity: 0.35,
            map: map,
            center: {
                lat: crisisJsonArray[i].latitude,
                lng: crisisJsonArray[i].longitude
            },
            radius: crisisJsonArray[i].radius
        });
        animateCircle(crisisCircle, map);
    }
}

function animateCircle(crisisCircle, map) {
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
}

function postCrisis(id, longitude, latitude, radius, description, type) {
    let  crisis = {};
    crisis.id = id;
    crisis.longitude = longitude;
    crisis.latitude = latitude;
    crisis.radius = radius;
    crisis.description = description;
    crisis.type = type;
    crisis.status = true;
    crisis.beginDate = (new Date()).toUTCString();
    crisis.endDate = null;
    crisis.description = description;
    crisis.type = type;
    crisis.id = crisis.id + crisis.beginDate.toLocaleLowerCase().replace(/\s/g, '').replace(/:/g, '').replace(/,/, '');
    let crisisJson = JSON.stringify(crisis, null, 2);

    console.log(crisisJson);

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 201) {
            console.log("great success");
        }
    }
    xhr.open("POST", "/crises", true);
    xhr.setRequestHeader("Set-Cookie", document.cookie);
    xhr.send(crisisJson);

    window.location.replace('/');
}

