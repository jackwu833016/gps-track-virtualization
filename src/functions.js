
//check file and prepare for d3
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

            display_map(); //make map visible
            render_map(); //start rendering map
        }

    } else {
        printWarn("invalid csv file");
    }
}