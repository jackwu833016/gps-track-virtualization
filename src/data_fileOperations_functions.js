
//compute pace and store in pace_array
function cal_pace(dataSet) {
    var avg_pace, points_dis = 0, points_dur; //distance and duration between sample_size points

    for (var pos = 0; pos < dataSet.length - pace_sample_size; pos++) {

        if (pos % pace_sample_size == 0 && pos != 0) {
            points_dur = (Time_array[pos].getHours() * 60 + Time_array[pos].getMinutes() + Time_array[pos].getSeconds() / 60) - //duration between 1st and last sample size points
                (Time_array[pos - pace_sample_size].getHours() * 60 + Time_array[pos - pace_sample_size].getMinutes() + Time_array[pos - pace_sample_size].getSeconds() / 60);

            points_dis = Dis_array[pos] - Dis_array[pos - pace_sample_size];

            pace_array.push(
                points_dur / points_dis
            );
        }
    }

    for (var pos2 = dataSet.length - pace_sample_size; pos2 < dataSet.length; pos2++) { //make up the last pace data at the end
        pace_array.push(pace_array[pace_array.length - 1]);
    }

}

// convert Lat & Long into Distance and cal total distance
function cal_dis() {
    for (var pos = 0; pos < Long_array.length - 1; pos++) {
        var dis = dis_Lat_Long(Long_array[pos], Long_array[pos + 1], Lat_array[pos], Lat_array[pos + 1]);
        Dis_array.push(total_dis);
        total_dis += dis;
    }
}

//convert raw data into float and Date format & store into individual arrays for d3 operation
function converter(record_ele) {
    Long_array.push(parseFloat(record_ele.Y));
    Lat_array.push(parseFloat(record_ele.X));

    //convert raw time into date object in javascript
    var raw_string = record_ele.time;

    //extracting time pieces form raw data & push into time array
    Time_array.push(new Date(
        raw_string.slice(0, 4),    //Year
        raw_string.slice(5, 7),    //Month
        raw_string.slice(8, 10),   //Day
        raw_string.slice(11, 13),  //Hour
        raw_string.slice(14, 16),  //Second
        raw_string.slice(17, 19),
        "00"
    ));

    return record_ele;
}

//readin accessToken from external file for mapbox
function readin_accessToken(URL) {
    var raw_data = "";
    $.ajax({
        url: URL,
        success: function (data) {
            raw_data = data;
        },
        async: false
    });

    if (raw_data == "") { //accessToken is missing
        printWarn("AccessToken is missing");
    } else return raw_data;
}

//start analysis file and render all the graphes
function startAnalysis() {

    //data processing
    csvFileRawData.forEach(converter); //convert csv data into arrays for d3 operations 
    cal_dis(); //calculate dis between coor and total dis
    cal_pace(csvFileRawData); //calculate pase and store into pase array

    //render everything
    render_chart();
    dis_track_info();
    display_map_chart(); //make map visible
    render_map(); //start rendering map
}

//calculate distance between two points (reference: Haversine Formula)
function dis_Lat_Long(lat1, lat2, lon1, lon2) {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }

    var R = 6371, // radius of the Earth
        x1 = lat2 - lat1,
        dLat = x1.toRad(),
        x2 = lon2 - lon1,
        dLon = x2.toRad(),
        a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

//check upload file and prepare for d3
function handleFiles(inputFile) {
    inputFile = inputFile[0]; //only accept the 1st one if multi file are uploaded

    var iscsv_file = (function () { //check is uploaded file in csv format
        if (inputFile.name.search(".csv") !== -1) { return true; }
        else {
            print("incorrect file type");
            return false
        };
    })();

    if (iscsv_file) { //continous iff valid csv file is uploaded

        var reader = new FileReader(); //convert csv file into string
        reader.addEventListener("loadend", fileloaded);
        reader.readAsText(inputFile);

        function fileloaded() { //convert raw data into array of object
            csvFileRawData = reader.result;
            csvFileRawData = d3.csvParse(csvFileRawData);
            startAnalysis();
        }

    } else {
        printWarn("invalid csv file");
    }
}

//use demp csv file instead
function demoMode() {
    d3.csv("sample_gps_track_file.csv")
        .get(function (ArrayOfObject) {
            csvFileRawData = ArrayOfObject;
            startAnalysis();
        });
}