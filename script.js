var request = new XMLHttpRequest();

function GetFormattedDate() { 
	var todayTime = new Date(); 
	var month = todayTime.getMonth()+1;
	var day = todayTime.getDate(); 
	var year = todayTime .getFullYear(); 
	return day + "/" + month + "/" + year; 
}

window.onload = function() {
   document.getElementById("date").value = GetFormattedDate();
   document.getElementById("search").onclick = function () {
		get_flights();
		
	};
};

function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
        xhr.open(method, url, false);
    } else if (typeof XDomainRequest != "undefined"){
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

function get_airline_name(carrier_code){
	var iata_api = `https://iatacodes.org/api/v7/airlines?api_key=65fde539-01f2-4135-a34b-c94c30d2d240&iata_code=${carrier_code}`
	var airline_name;
	req = new XMLHttpRequest();
	req.open('GET', iata_api, false);
	req.setRequestHeader('Access-Control-Allow-Origin', '*');
	// var req = createCORSRequest("get", iata_api);

	req.onload = function() {
	  airline_details = JSON.parse(this.response);
	  console.log(airline_details)
	  airline_name = airline_details[0].name;
	}
	req.send();
	return airline_name;
};

function initialize_flight_table() {
  	$("#flights-table tr").remove(); 
	var header = node.createTHead();
	var row = header.insertRow(0);     
	var cell = row.insertCell(0);
	cell.innerHTML = "<b>Airline</b>";
	cell = row.insertCell(1);
	cell.innerHTML = "<b>Departure (IST)</b>";
	cell = row.insertCell(2);
	cell.innerHTML = "<b>Arrival (IST)</b>";
	cell = row.insertCell(3);
	cell.innerHTML = "<b>Duration</b>";
	cell = row.insertCell(4);
	cell.innerHTML = "<b>Price (INR)</b>";
};

function display_flights(flights){
	node = document.getElementById("flights-table");
	initialize_flight_table();

	flights.forEach(
		flight => {
			let newRow = node.insertRow(-1);
			var airline = flight['airlines'][0];
			var duration = flight['fly_duration'];
			var departure = (new Date(1000*parseInt(flight['dTimeUTC']))).toLocaleString();
			var arrival = (new Date(1000*parseInt(flight['aTimeUTC']))).toLocaleString();
			var price = flight.price;
		 	
		 	var airline_name = get_airline_name(airline);
		 	console.log(airline_name);
			console.log(airline);
			let newCell = newRow.insertCell(0);
			let newText = document.createTextNode(airline);
			newCell.appendChild(newText);

			newCell = newRow.insertCell(1);
			newText = document.createTextNode(departure);
			newCell.appendChild(newText);

			newCell = newRow.insertCell(2);
			newText = document.createTextNode(arrival);
			newCell.appendChild(newText);

			newCell = newRow.insertCell(3);
			newText = document.createTextNode(duration);
			newCell.appendChild(newText);

			newCell = newRow.insertCell(4);
			newText = document.createTextNode(price);
			newCell.appendChild(newText);
	});
}

function get_flights(){
	var flyFrom = document.getElementById("from").value ;
	var flyTo = document.getElementById("to").value;
	if(flyFrom == "") flyFrom = "DEL";
	if(flyTo == "") flyTo = "BOM";
	var date = document.getElementById("date").value;
	var params = `flyFrom=${flyFrom}&fly_to=${flyTo}&dateFrom=${date}&dateTo=${date}&partner=picky&max_stopovers=0&curr=INR&limit=3`
	var api = `https://api.skypicker.com/flights?${params}`
	request.open('GET', api, false);
	var flights = [];
	request.onload = function() {
	  var body = JSON.parse(this.response)

	  if (request.status >= 200 && request.status < 400) {
	    flights = body.data
	    console.log(body);
	    display_flights(flights);
	  } else {
	    console.log('error')
	  }
	}

	request.send();
};

$(function() {
    var locations;
    locations_api="https://raw.githubusercontent.com/konsalex/Airport-Autocomplete-JS/master/src/data/airports.json";
    request.open('GET', locations_api, false);
	request.onload = function() {
	  locations = JSON.parse(this.response).airports;
	}
	request.send();

	var airports = []
	locations.forEach(airport => {
		airports.push(airport.IATA + "-" + airport.name + "-" + airport.city + "-" + airport.country);
	})
	$("#from").autocomplete({
	    source: airports,
	    select: function (event, ui) {
	      var value = ui.item.value;
	      $("#from").val(value.split("-")[0]);
	      return false;
	    }
	});

	$("#to").autocomplete({
	    source: airports,
	    select: function (event, ui) {
	      var value = ui.item.value;
	      $("#to").val(value.split("-")[0]);
	      return false;
	    }
	});

	$("#date").datepicker({dateFormat: 'dd/mm/yy'});
});

