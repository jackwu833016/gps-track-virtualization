//all operation of rendering chart
function render_chart() {

    var chartDataSet = [], 
        time_label_array = [], 
        numOfLable_horiz = 7; //number of label that render on horiz axis

    //processing data for chart rendering
    pace_sample_size += 1;
    for (var pos = 0; pos < Lot_array.length; pos++) {
        var pace_data = function () { //make up the empty data slot by placing pevious pace data
            if (pos % pace_sample_size != 0) {
                return pace_array[Math.round(pos / pace_sample_size)];
            } else {
                return pace_array[pos];
            }
        }();

        if(pos % Math.round(Time_array.length / numOfLable_horiz) == 0){ //only store hour and minute
            time_label_array.push((Time_array[pos].getHours().toString() + ":" + Time_array[pos].getMinutes().toString()));
        }
    
        var push_data = [ //construct feed in data set
            (Time_array[pos].getHours().toString() + ":" + Time_array[pos].getMinutes().toString() + ":" + Time_array[pos].getSeconds().toString()),
            Dis_array[pos],
            pace_data
        ];

        chartDataSet.push(push_data);
    }

    google.charts.setOnLoadCallback(function () {

        var data = new google.visualization.DataTable();

        data.addColumn('string', 'Time');
        data.addColumn('number', 'Distance');
        data.addColumn('number', 'Pace');
        data.addRows(chartDataSet);

        var options = { //options for chart
            series: {
                0: { targetAxisIndex: 0 },
                1: { targetAxisIndex: 1 }
            },
            vAxes: {
                0: { title: 'Distance (KM)' },
                1: { title: 'Pace (Min/KM)' }
            },
            hAxis: {
                showTextEvery : Math.round(Time_array.length / numOfLable_horiz),
                fontSize: 6
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('chartRow'));  // Instantiate and draw the chart.
        chart.draw(data, options);
    });
}
