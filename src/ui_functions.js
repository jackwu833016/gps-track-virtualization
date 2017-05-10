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

    //set the height of the right panel the same as the left one
    document.getElementById("Info_panel_body").style.height =
        $("#Map_panel_body").outerHeight(true) + "px";


    map_obj.style.visibility = "visible";
    document.getElementById("tabs").style.visibility = "visible";
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

    var radius_scale = d3.scaleLinear(), color_scale = d3.scaleLinear();
    radius_scale.range([0, 20]);
    radius_scale.domain([d3.min(pace_array), d3.max(pace_array)]);
    color_scale.range(["yellow", "green"]);
    color_scale.domain([0, Long_array.length]);

    //plotting track
    for (var pos = 0; pos < Long_array.length - 1; pos++) {
        var render_circle =
            L.circle([Long_array[pos], Lat_array[pos]], {
                color: color_scale(pos), //progressive color changes
                fillColor: color_scale(pos),
                fillOpacity: 0.8,
                radius: radius_scale(pace_array[pos]),
                pos_in_data: pos //store pos in data in object
            });

        render_circle.addTo(map); //add plot to map
        render_circle.on('click', function (e) { //handler of click events
            clicked_on_map(e.target.options.pos_in_data);
        })
    }
}

//Highlight point on chart and map
function highlight_point(pos_in_data) {

    if (last_plot_obj != null) last_plot_obj.remove(); //remove marker on map

    var loc_x = chart_interactive_interface.getXLocation(pos_in_data),
        marker = document.getElementById("overlay-marker"),
        chart_ele_style = document.getElementsByTagName("rect")[0].getBoundingClientRect(),
        loc_x_marker = Math.floor(loc_x);

    //moving marker to target position
    marker.style.visibility = "visible";
    marker.style.height = chart_ele_style.bottom - chart_ele_style.top + "px";
    marker.style.left = loc_x_marker + 30 + "px";
    marker.style.top = chart_ele_style.top + "px";

    //add marker on map as well
    if (last_plot_obj != null) last_plot_obj.remove(); //remove last marker
    last_plot_obj = L.marker([Long_array[pos_in_data], Lat_array[pos_in_data]]).addTo(map);

    //display selected data 
    display_sel_data(pos_in_data);

}

//display selected data on "sel data" panel
function display_sel_data(pos_in_data){
    var display_ele = document.getElementById("sel_data_info");
    display_ele.innerHTML = 
        "<b>Distance: </b>" + Dis_array[pos_in_data].toFixed(2) + " km<br>" +
        "<b>Pace: </b>" + pace_array[pos_in_data].toFixed(2) + " Min/km <br>" +
        "<b>Time: </b>" + Time_array[pos_in_data].getHours() + ":" + Time_array[pos_in_data].getMinutes() + ":" + Time_array[pos_in_data].getSeconds() + "<br>" +
        "<b>Lat: </b>" + Lat_array[pos_in_data] + "<b> Long: </b>" + Long_array[pos_in_data];

    $('#tabs a:last').tab('show')
}

//Highlight point on chart 
function clicked_on_map(pos_in_data){
    chart_obj.setSelection([]);
    highlight_point(pos_in_data);
}

//update position of highlight bar on chart if scrolled (to prevent mispositioning)
function update_highlight_bar_pos() {
    var marker = document.getElementById("overlay-marker"),
        chart_ele_style = document.getElementsByTagName("rect")[0].getBoundingClientRect();

    marker.style.top = chart_ele_style.top + "px";
}

//all operation of rendering chart
function render_chart() {

    var chartDataSet = [],
        time_label_array = [],
        numOfLable_horiz = 7; //number of label that render on horiz axis

    //processing data for chart rendering
    pace_sample_size += 1;
    for (var pos = 0; pos < Long_array.length; pos++) {

        var pace_data = pace_array[pos];

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

    pace_sample_size--; //reset sample size after calculation

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

        chart_obj = new google.visualization.LineChart(document.getElementById('chartRow'));  // Instantiate and draw the chart.

        //add handler & listener for "select" event
        function selectHandler() {
            var selectedItem = chart_obj.getSelection()[0];
            if (selectedItem) {
                highlight_point(selectedItem.row); //pass selected data point to function that plot on map
            }
        }

        //add handler & listener after chart is rendered, and store obj of interactive_interface_chart for later operation 
        function get_interactive_interface_chart(dataTable) {
            chart_interactive_interface = this.getChartLayoutInterface();
        };

        //add listener
        google.visualization.events.addListener(chart_obj, 'select', selectHandler);
        google.visualization.events.addListener(chart_obj, 'ready', get_interactive_interface_chart.bind(chart_obj, data));

        //render chart
        chart_obj.draw(data, options);
    });
}

//function handle sample size editing
function sample_size_change(mode) {
    function update_sample_size_input() {
        document.getElementById("sample_size_input").value = pace_sample_size;
    }
    switch (mode) {
        case "add":
            pace_sample_size++;
            update_sample_size_input();
            break;

        case "sub":
            if (pace_sample_size > 1) {
                pace_sample_size--;
                update_sample_size_input();
            }
            break;
    }
}

//function handle redering and recalculation after variable changes
function re_process() {

    //remove rendered DOM
    map.remove();

    //reset all data sets
    Long_array = []; Lat_array = []; Time_array = []; pace_array = []; Dis_array = []; total_dis = 0;

    //restart calculation and rendering process
    startAnalysis();
}
