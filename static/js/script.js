var json = [];
var tempWeather = {};
var all = {};

/**Procedure that will display the current weather conditions. A flask function is called that will return the data for the current weather.*/
function displayCurrentWeather(){
    let request = new XMLHttpRequest();

    request.onreadystatechange = function(){
        let response = "";
        if (this.readyState == 4 && this.status == 200){
            // responce contains the entry that matches with the current date and time
            response = JSON.parse(this.responseText);
            console.log(response);
            console.log(this.status)
            if (response[1] == 200){
                data = response[0];
                return document.getElementById('output').innerHTML ="<p class='displayData'>" + data.temperature + "</p>" + "°C " + "<p class='displayData'>" + data.weatherType + "</p>" + " | " + "<p class='displayData'>" + data.wind + "</p>" + " Wind";
            }
            else if (response[1] == 400){
                return document.getElementById('output').innerHTML = "No Data On Current Weather";
            }
        }
        else if (this.readyState == 4 && this.status == 500)
        return document.getElementById('output').innerHTML = "No Entries";
    }

    request.open('GET', "/api/current");
    request.send();
    
}

/**Requests all data and displays in a table */
function createTable(){
    let request = new XMLHttpRequest();
    var table = document.getElementById("table");


    request.onreadystatechange = function(){
        let response = "";
        if (this.readyState == 4 && this.status == 200){
            response = JSON.parse(this.responseText);
          console.log(response);
            var insert = "";
            // loops through each entry in the json file and formats it to be displayed as a table in html
            for (entry of response[0]){
                insert += "<tr>\n<td>" + entry.date + "</td>\n" + "<td>" + entry.time + "</td>\n"  + "<td>" + entry.end + "</td>\n" + "<td>" + entry.location + "</td>\n" +"<td>" + entry.temperature + "</td>\n" + "<td>" + entry.weatherType + "</td>\n" + "<td>" + entry.wind + "</td>\n"+ "</tr>";
            }
            table.innerHTML = insert;
        }
        else if (this.readyState == 4 && this.status == 400){
            console.log("Something went wrong");
        }
    }
    request.open('GET', "/api/getAll", true);
    request.send();
}

/**Send data via XML to Flask*/
function sendData(){
    tempWeather.temperature = document.getElementById('temperature').value;
    tempWeather.date = document.getElementById('date').value;
    tempWeather.type = document.getElementById('weather type').value;
    tempWeather.location = document.getElementById('location').value;
    tempWeather.duration = document.getElementById('duration').value;
    tempWeather.time = document.getElementById('time').value;
    tempWeather.wind = document.getElementById('wind').value;
    // checks if nothing or string has been entred in to temperature. 
    // the document.getElementById stores the numbers entered in a string but as the element's type is set to number it does not register other characters.
    if (document.getElementById('temperature').value == ""){
        alert("Invalid input!");
    }
    else{
        let request = new XMLHttpRequest();
        var url = "/api/send?date=" + tempWeather.date + "&time=" + tempWeather.time + "&temperature=" + tempWeather.temperature + "&type=" + tempWeather.type + "&location=" + 
        tempWeather.location + "&duration=" + tempWeather.duration + "&wind=" + tempWeather.wind;
    
        request.onreadystatechange = function(){
            response = "";
            if (this.readyState == 4 && this.status == 200){
                response = JSON.parse(this.responseText);
                console.log(response);
                result = response[0];
                // checking for repeating entries
                if (result.result == "taken"){
                    alert("Entry already exists!")
                }
                else{
                    update();
                }
            }
        }
        request.open('GET', url, true);
        request.send();
    }
}


/**sends the data corrisponding with the entry to be deleted from the json file */
function removeData(){
    var date = document.getElementById('date2Remove').value;
    var time = document.getElementById('time2Remove').value;
    weather_location = document.getElementById('location2Remove').value;
    toBeRemoved = [date, time, weather_location];
    let request = new XMLHttpRequest();
    var url = "/api/delete?date=" + toBeRemoved[0] + "&time=" + toBeRemoved[1] + "&location=" + toBeRemoved[2] + "";
    request.onreadystatechange = function(){
        response = "";
        if (this.readyState == 4 && this.status == 200){
            response = JSON.parse(this.responseText);
            console.log(response);
            if (response[1] == 200){
                update();
                alert("Entry removed!");
            }
            if (response[1] == 400){
                alert("Entry could not be found");
            }
        }

    }
    request.open('POST', url, true);
    request.send();
    
}

/**This procedure will call up the python function that will reset the contents of the json file. */
function resetJson(){
    confirm("Are you sure?\nThis will completly reset the weather data.");
    let request = new XMLHttpRequest();
    update();
    request.open('POST', "/api/reset", true);
    request.send()

}
/** Procedure to display a live clock */
function time() {
    var span = document.getElementById('span');
    var d = new Date();
    var m = d.getMinutes();
    var h = d.getHours();
    // these if statement are to make sure that the single digit numbers have 0 infront of them
    if (m < 10){
        m = "0" + m;
    }
    if (h < 10){
        h = "0" + h; 
    }
    span.textContent = "Time:"+ ("" + h).substring(-2) + ":" + ("" + m).substring(-2);
}

/**Updates changing elements */
function update(){
    displayCurrentWeather();
    createTable();
}

// this code runs when the page is loaded
update();
setInterval(time, 1000);