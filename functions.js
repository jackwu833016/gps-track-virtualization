         
         //compute pase and store in pase_array
         function cal_pase(dataSet){
            var avg_pase, points_dis = 0, points_dur; //distance and duration between sample_size points

            for( var pos = 0; pos < dataSet.length - pase_sample_size; pos++){

                if(pos % pase_sample_size != 0){
                    points_dis += Math.abs(dataSet[pos].X - dataSet[pos + 1].X) + 
                                  Math.abs(dataSet[pos].Y - dataSet[pos + 1].Y);
                }
                else if(pos % pase_sample_size == 0 && pos != 0){
                    points_dur = (Time_array[pos].getMinutes() + Time_array[pos].getSeconds()/60) - //duration between 1st and last sample size points
                                 (Time_array[pos - pase_sample_size].getMinutes() + Time_array[pos - pase_sample_size].getSeconds()/60); 
                    pase_array.push(
                        points_dis / points_dur //we use speed here instaed of the actual "pase"
                    );
                }
            }

            for(var pos2 = dataSet.length - pase_sample_size; pos2 < dataSet.length; pos2++){ //make up the last pase data at the end
                pase_array.push(pase_array[pase_array.length - 1]); 
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
                    radius: radius_scale(pase_array[Math.round(pos / pase_sample_size)])
                })
                .addTo(map);
            }
         }
         