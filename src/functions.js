
//check file and prepare for d3
function handleFiles(inputFile){
    inputFile = inputFile[0]; //only accept the 1st one if multi file are uploaded

    var iscsv_file = (function(){
        if(inputFile.name.search(".csv") !== -1) {return true;}
        else {
            print("incorrect file type");
            return false
        };
    })();
    print(iscsv_file);
}