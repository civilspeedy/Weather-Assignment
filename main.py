import json
import datetime as dt
from flask import Flask, jsonify, make_response, render_template, request
import os

app = Flask('app')
root_path = os.path.realpath(os.path.dirname(__file__))
file = os.path.join(root_path, "data", "store.json")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/send", methods=['GET'])
def receive():
    """recieves weather data from JS"""
    if add_entry(create_weather_entry(request.args.get("date"), request.args.get("time"), request.args.get("location"), request.args.get("temperature"), request.args.get("type"), request.args.get("wind"), request.args.get("duration"))):
        return make_response(jsonify({"result" : "ok"}, 200))
    else:
        return make_response(jsonify({"result" : "taken"}, 400))
        
@app.route("/api/delete", methods=['POST'])
def receive_to_detele():
    """Takes input of date, time and location for a weather data entry to be removed from the json file."""

    if delete_weather_entry(request.args.get("date"), request.args.get("time"), request.args.get("location")):
        return make_response(jsonify({"result" : "ok"}, 200))
    else:
        return make_response(jsonify({"result" : "failure"}, 400))


@app.route("/api/reset", methods=['POST'])
def reset_json():
    """blanks the json file"""
    json_file = open(file, "w")
    json_file.write("[]")
    json_file.close()
    return make_response(jsonify({"result" : "ok"}, 200))

@app.route("/api/current", methods=["GET"])
def get_current_weather():
    """Return the entry containing the current weather"""
    # datetime.utcnow is used as the replit servers are not in the UK and it would return the wrong time
    date = str(dt.datetime.utcnow())[:10]
    time = str(dt.datetime.utcnow())[11:]
    time = time[:5]
  
    # bst has to manual be defined as datetime has no BST function
    bst_time = str(dt.time(int(time[:2]) + 1, int(time[3:])))[:5]
    
    #check if in BST timezone
    if int((date[5:])[:2]) >= 4:
      time = str(bst_time)
    else:
      pass
    
    with open(file) as f:
      data = json.load(f)

    for entry in data:
      # checks for entry that contains the current date and is located in bournemouth
      if entry["date"] == date and entry["location"] == "Bournemouth":
            
        #checks if the entry's weather will be in effect at the current time
        if is_time_between(entry["time"], entry["end"], time):
          return make_response(jsonify({"temperature" : entry["temperature"], "weatherType" : entry["weatherType"], "wind" : entry["wind"]}, 200))
    return make_response(jsonify({"result" : "failure"}, 400))

@app.route("/api/getAll", methods=['GET'])
def get_all():
    with open(file) as f:
        data = json.load(f)
    return make_response(jsonify(data, 200))


def create_weather_entry(date, time, location, temperature, weather_type, wind, duration):
    """Creates weather dict/JSON"""

    weather = {
        "date": date,
        "time": time,
        "location": location,
        "temperature": temperature,
        "weatherType": weather_type,
        "wind": wind,
        "duration": duration,
        "end": str(dt.time(int(time[:2]) + int(duration), int(time[3:])))[:5]
        }
    return weather


def is_time_between(begin_time, end_time, check_time):
  """checks weather the passed time is between the two other passed times"""
  # formating strings to fit dt.time format 
  begin_time = dt.time(int(begin_time[:2]), int(begin_time[3:]))
  end_time = dt.time(int(end_time[:2]), int(end_time[3:]))
  check_time = dt.time(int(check_time[:2]), int(check_time[3:]))
  
  if begin_time < end_time:
    return check_time >= begin_time and check_time <= end_time
  else:
    return check_time >= begin_time or check_time <= end_time


def add_entry(weather_entry):
    """Using 'json.load', the entire json file is stored in a variable and a new entry is appending onto it. This
    variable is used to write over the json. Appearing as if it were updated."""
    
    # json file is loaded as dict
    with open(file) as f:
        data = json.load(f)
    
    #checks if the json if empty
    if str(data) != "[]":
      for entry in data:
        #checking for repeats
        if entry["date"] == weather_entry["date"] and entry["location"] == weather_entry["location"] and (entry["time"] == weather_entry["time"] or is_time_between(entry["time"], entry["end"], weather_entry["time"])):
          # false is returned if the time, data and location have already been entered
          return False
                
        #if no matches are found the user input is written into the json
      data.append(weather_entry)
      with open(file, "w") as f:
        json.dump(data, f)
          
    else:
      #if the json file is empty the user input is written in
      data.append(weather_entry)
      with open(file, "w") as f:
        json.dump(data, f)
          
    #true is return if the data was able to written     
    return True

def delete_weather_entry(date, time,  location):
    """Remove an entry based on date and location"""
  
    count = 0

    # Load json file to variable
    with open(file) as f:
        data = json.load(f)

    # finds the correlating entry
    for entry in data:
        if entry['date'] == date and entry["time"] == time and entry["location"] == location:
            del data[count]
            # writes over file
            with open(file, "w") as f:
                json.dump(data, f)
            return True
        else:
            count += 1
    return False

    

app.run("0.0.0.0", 8080)