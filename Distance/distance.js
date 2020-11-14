var directionsDisplay;
var directionsService;
var distanceservice;
var geocoder;
var source;
var locations = [];
var destinationInputs = [];
var map;

$(document).ready(function () {
    directionsService = new google.maps.DirectionsService();
    distanceservice = new google.maps.DistanceMatrixService();
    geocoder = new google.maps.Geocoder();
    source = $(".travelfrom").val();
    GetAddresses();
    //$(".travelto").each(function () {
    //    if ($(this).val().length > 0) {
    //        locations.push({
    //            location: $(this).val(),
    //            stopover: true
    //        });
    //        destinationInputs.push($(this).val());
    //    }
    //});

});

function GetAddresses() {
    var url = '/poc/distance/GetAddresses';
    $.getJSON(url, null, function (data) {
        $.each(data, function (i, address) {
            destinationInputs.push(address.street + "," + address.number + "," + address.municipality + "," + address.state + "," + address.city + "," + address.country + "," + address.zipcode);
        });
     });
}



function initMap() {
    geocoder = new google.maps.Geocoder();
    directionsDisplay = new google.maps.DirectionsRenderer({ 'draggable': true });
    source = $(".travelfrom").val();

    map = new google.maps.Map(document.getElementById('dvMap'), {
        center: { lat: 0, lng: 0 },
        zoom: 13,
        mapTypeId: 'roadmap'
    });
    GetGeoCodeAddress(geocoder, source, map);

    directionsDisplay.setMap(map);
}

function GetGeoCodeAddress(geocoder, currentAddress, resultsMap) {

    geocoder.geocode({ address: currentAddress }, (results, status) => {
        if (status === "OK") {
            resultsMap.setCenter(results[0].geometry.location);
            new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location,
            });

        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function GetRoute() {
    source = $(".travelfrom").val();
    const waypts = [];
    for (var i = 0; i < locations.length; i++) {
        var address = locations[i];
        if (address !== "") {
            waypts.push({
                location: address,
                stopover: true
            });
        }
    }

    directionsService.route({
        origin: source,
        destination: locations[0].location,
        waypoints: locations,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false
    }, function (response, status) {

        if (status == "OK") {
            var dvDistance = document.getElementById("dvDistance");
            var distance = 0;
            var time;
            $("#tblResults").empty();
            directionsDisplay.setDirections(response);
            response.routes[0].legs.forEach(function (item, index) {
                if (index < response.routes[0].legs.length - 1) {
                    distance = item.distance.text;
                    time = item.duration.text;

                    tbl = document.getElementById("tblResults");
                    var html = "<tr><td>" + item.start_address + "</td><td>" + item.end_address + "</td><td>" + distance + "</td><td>" + time + " </td></tr>";

                    $("#tblResults").append(html);
                }
            });
            directionsDisplay.setDirections(response);
        }
    });
}

function GetDistance() {

    const destinationIcon =
        "https://chart.googleapis.com/chart?" +
        "chst=d_map_pin_letter&chld=D|FF0000|000000";
    const originIcon =
        "https://chart.googleapis.com/chart?" +
        "chst=d_map_pin_letter&chld=O|FFFF00|000000";


    // Take a timestamp at the beginning.
    var start = performance.now();

    source = $(".travelfrom").val();
    for (var destination of destinationInputs) {
        //var request = {
        //    origin: source,
        //    destination: destination,
        //    travelMode: google.maps.TravelMode.DRIVING
        //};

        //directionsService.route(request, function (response, status) {
        //    if (status == google.maps.DirectionsStatus.OK) {
        //        directionsDisplay.setDirections(response);
        //    }
        //});

    }


    // Take a final timestamp.
    var end = performance.now();

    $("#tblResults").empty();
    $("#timeTaken").empty();

        distanceservice.getDistanceMatrix({
            origins: [source],
            destinations: destinationInputs,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, function (response, status) {
                const markersArray = [];
                const originList = response.originAddresses;
                const destinationList = response.destinationAddresses;
                deleteMarkers(markersArray);
                const showGeocodedAddressOnMap = function (asDestination) {
                    const icon = asDestination ? destinationIcon : originIcon;

                    return function (results, status) {
                        if (status === "OK") {

                            markersArray.push(
                                new google.maps.Marker({
                                    map,
                                    position: results[0].geometry.location,
                                    icon: icon,
                                })
                            );
                        } else {
                            alert("Geocode was not successful due to: " + status);
                        }
                    };
                }

                    if (status == google.maps.DistanceMatrixStatus.OK &&
                        response.rows[0].elements[0].status != "ZERO_RESULTS") {



                        geocoder.geocode(
                            { address: originList },
                            showGeocodedAddressOnMap(false)
                        );


                        for (let j = 0; j < response.rows[0].elements.length; j++) {


                            geocoder.geocode(
                                { address: destinationList[j] },
                                showGeocodedAddressOnMap(true)
                            );

                            var distance = response.rows[0].elements[j].distance.text;
                            var durationValue = response.rows[0].elements[j].duration.value;
                            var durationText = response.rows[0].elements[j].duration.text;
                            var dvDistance = document.getElementById("dvDistance");

                            var html = "<tr><td>" + response.originAddresses[0] + "</td><td>" + response.destinationAddresses[j] + "</td><td>" + distance + "</td><td>" + durationText + " </td></tr>";

                            $("#tblResults").append(html);
                        }

                        // directionsDisplay.setDirections(response);
                    }
                
        });

    var millis = (end - start);

    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
   

    $("#timeTaken").html("<span>Total time taken- " + millis + "milliseconds to execute.");
}


function deleteMarkers(markersArray) {
    for (let i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}

