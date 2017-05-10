//make map & chart visible 
function display_map_chart() {

    //hide nav bar buttons
    document.getElementById("fileInput").style.visibility = "hidden";
    document.getElementById("demoBtn").style.visibility = "hidden";
    document.getElementById("Info_panel_body").style.height = "100%"; //reset height after data is loaded

    var mapPanel_width = $("#map_panel").width(),
        map_obj = document.getElementById("map");

    map_obj.style.width = parseFloat(mapPanel_width) + "px";
    map_obj.style.height = parseFloat(mapPanel_width * 0.5) + "px"; //set height and width for map object
    map_obj.style.visibility = "visible";
    document.getElementById("cav_raw_data_textarea").style.visibility = "visible" //make raw data win visible
}

//gather track info & cav raw data 
function dis_track_info() {
    var info_ele = document.getElementById("track_info"),
        cav_dis_ele = document.getElementById("cav_raw_data_textarea"),
        dur_millisecond = (Time_array[Time_array.length - 1] - Time_array[0]);

    info_ele.innerHTML =
        "<b>Duration:</b> " + (dur_millisecond / 60000).toFixed(0) + ":" + (dur_millisecond % 60000 * 60) + "<br>" +
        "<b>Top pace:</b> " + d3.min(pace_array).toFixed(2) + " Min/km " + "<b> Avg pace: </b>" + d3.mean(pace_array).toFixed(2) + " Min/km " + "<br>" +
        "<b>Distance:</b> " + Dis_array[Dis_array.length - 1].toFixed(2) + " km" + "<br>" +
        "<h6>Raw Data:</h6>";
    cav_dis_ele.innerText = d3.csvFormat(csvFileRawData); //convert data array back to string for display
}

//render map in DOM
function render_map() {

    L.mapbox.accessToken = readin_accessToken("src/accessToken.txt");

    map = L.mapbox.map('map', 'mapbox.streets')
        .setView([d3.mean(Long_array),
        d3.mean(Lat_array)],
        14); //init map and set center viewpoint accroding to data set

    radius_scale = d3.scaleLinear();
    radius_scale.range([0, 15]);
    radius_scale.domain([d3.min(pace_array), d3.max(pace_array)]);

    //plotting track
    for (var pos = 0; pos < Long_array.length - 1; pos++) {
        var render_circle =
            L.circle([Long_array[pos], Lat_array[pos]], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.8,
                radius: radius_scale(pace_array[Math.round(pos / pace_sample_size)]),
                pos_in_data: pos //store pos in data in object
            });

        render_circle.addTo(map); //add plot to map

        render_circle.on('click', function (e) { //handler of click events
            highlight_point_on_chart(e.target.options.pos_in_data);
        })
    }
}

//Highlight point on chart with input lat and lon
function highlight_point_on_chart(pos_in_data) {
    var loc_x = chart_interactive_interface.getXLocation(pos_in_data),
        marker = document.getElementById("overlay-marker"),
        chart_ele_style = document.getElementsByTagName("rect")[0].getBoundingClientRect(),
        loc_x_marker = Math.floor(loc_x);

    //moving marker to target position
    marker.style.visibility = "visible";
    marker.style.height = chart_ele_style.bottom - chart_ele_style.top + "px";
    marker.style.left = loc_x_marker  + 30+ "px";
    marker.style.top = chart_ele_style.top + "px";
    print(document.getElementsByTagName("body")[0].scrollTop);
    // print("pos_in_data: " + pos_in_data +
    //     ", top " + (chart_ele_style.bottom - chart_ele_style.top) +
    //     ", left: " + (loc_x_marker + 30) +
    //     ", height: " + (chart_ele_style.bottom - chart_ele_style.top));
}

//Highlight input posInArray on Map
function highlight_plot_on_map(target_pos) {

    if (last_plot_obj != null) last_plot_obj.remove(); //remove last selection

    //add select point on Map
    last_plot_obj = L.marker([Long_array[target_pos], Lat_array[target_pos]]).addTo(map);
}

//all operation of rendering chart
function render_chart() {

    var chartDataSet = [],
        time_label_array = [],
        numOfLable_horiz = 7; //number of label that render on horiz axis

    //processing data for chart rendering
    pace_sample_size += 1;
    for (var pos = 0; pos < Long_array.length; pos++) {
        var pace_data = function () { //make up the empty data slot by placing pevious pace data
            if (pos % pace_sample_size != 0) {
                return pace_array[Math.round(pos / pace_sample_size)];
            } else {
                return pace_array[pos];
            }
        }();

        if (pos % Math.round(Time_array.length / numOfLable_horiz) == 0) { //only store hour and minute
            time_label_array.push((Time_array[pos].getHours().toString() + ":" + Time_array[pos].getMinutes().toString()));
        }

        var push_data = [ //construct feed in data set
            (Time_array[pos].getHours().toString() + ":" + Time_array[pos].getMinutes().toString() + ":" + Time_array[pos].getSeconds().toString()),
            Dis_array[pos],
            pace_data
        ];

        chartDataSet.push(push_data);
    }

    //start loadin chart
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
                showTextEvery: Math.round(Time_array.length / numOfLable_horiz),
                fontSize: 6
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('chartRow'));  // Instantiate and draw the chart.

        //add handler & listener for "select" event
        function selectHandler() {
            var selectedItem = chart.getSelection()[0];
            if (selectedItem) {
                highlight_plot_on_map(selectedItem.row); //pass selected data point to function that plot on map
            }
        }

        //add handler & listener after chart is rendered, and store obj of interactive_interface_chart for later operation 
        function get_interactive_interface_chart(dataTable) {
            chart_interactive_interface = this.getChartLayoutInterface();
        };

        //add listener
        google.visualization.events.addListener(chart, 'select', selectHandler);
        google.visualization.events.addListener(chart, 'ready', get_interactive_interface_chart.bind(chart, data));

        //render chart
        chart.draw(data, options);
    });
}
