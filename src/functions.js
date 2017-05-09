
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

//start analysis file and render all the graphes
function startAnalysis() {
    display_map_chart(); //make map visible
    render_map(); //start rendering map
    render_chart();

}

//calculate distance between two points (reference: Haversine Formula)
function dis_Lat_Lot(lat1, lat2, lon1, lon2) {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }

    var R = 6371; // radius of the Earth
    var x1 = lat2 - lat1;
    var dLat = x1.toRad();
    var x2 = lon2 - lon1;
    var dLon = x2.toRad();
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;


}