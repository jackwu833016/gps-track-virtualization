         
         //compute pace and store in pace_array
         function cal_pace(dataSet){
            var avg_pace, points_dis = 0, points_dur; //distance and duration between sample_size points

            for( var pos = 0; pos < dataSet.length - pace_sample_size; pos++){

                if(pos % pace_sample_size != 0){
                    points_dis += Math.abs(dataSet[pos].X - dataSet[pos + 1].X) + 
                                  Math.abs(dataSet[pos].Y - dataSet[pos + 1].Y);
                }
                else if(pos % pace_sample_size == 0 && pos != 0){
                    points_dur = (Time_array[pos].getMinutes() + Time_array[pos].getSeconds()/60) - //duration between 1st and last sample size points
                                 (Time_array[pos - pace_sample_size].getMinutes() + Time_array[pos - pace_sample_size].getSeconds()/60); 
                    pace_array.push(
                        points_dis / points_dur //we use speed here instaed of the actual "pace"
                    );
                }
            }

            for(var pos2 = dataSet.length - pace_sample_size; pos2 < dataSet.length; pos2++){ //make up the last pace data at the end
                pace_array.push(pace_array[pace_array.length - 1]); 
            }
         }
         
         //convert raw data into float and Date format & store into individual arrays for d3 operation
         function converter(record_ele){
             Lot_array.push(parseFloat(record_ele.Y));
             Lat_array.push(parseFloat(record_ele.X));
             
             //convert raw time into date object in javascript
             var raw_string = record_ele.time;

             //extracting time pieces form raw data & push into time array
             Time_array.push(new Date(
                 raw_string.slice(0,4),    //Year
                 raw_string.slice(5,7),    //Month
                 raw_string.slice(8,10),   //Day
                 raw_string.slice(11,13),  //Hour
                 raw_string.slice(14,16),  //Second
                 raw_string.slice(17,19),
                 "00"
             ));

            return record_ele;
         }
         
         //rendering data onto map
         function render(){
            for( var pos = 0; pos < Lot_array.length - 1; pos++) {
                L.circle([Lot_array[pos], Lat_array[pos]], {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.8,
                    radius: radius_scale(pace_array[Math.round(pos / pace_sample_size)])
                })
                .addTo(map);
            }
         }

         //readin accessToken from external file for mapbox
         function readin_accessToken(URL){
            var raw_data = "";
            $.ajax({
                url: URL,
                success: function(data){
                    raw_data = data;
                },
                async: false
                });
            return raw_data;
         }

    //render map in DOM
    function render_map(){
        d3.csv("sample_gps_track_file.csv")
          .get(function(ArrayOfObject){
              ArrayOfObject.forEach(converter);
              cal_pace(ArrayOfObject);

              map = L.mapbox.map('map', 'mapbox.streets')
               .setView([d3.mean(Lot_array),
                         d3.mean(Lat_array)],
                         14); //init map

             radius_scale = d3.scaleLinear();
                radius_scale.range([0,15]); 
                radius_scale.domain([d3.min(pace_array), d3.max(pace_array)]);
            
             render(); //plotting track
          });
    }
         