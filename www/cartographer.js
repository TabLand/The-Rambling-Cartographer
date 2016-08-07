var chunks_list = [];
var location_list = [];
var pending_location_update = false;
var rotate_speed = 0; 
var rotate_speed_slave = 0.1; 
var start_timestamp = Date.now() / 1000;
var datetime_element = null; 
var markers_list = [];
var maximum_markers = 20;
var last_marker_add_time = 0;
var new_marker_wait_time = 0.001;
var marker_radius = 0.05;
var marker_sections = 40;
var marker_colour = '#f00';
var earth = null;
var zoom_base = 10;


function cache_more_locations(){
    if(chunks_list.length != 0){
        chunk_id = "";
        while(chunk_id == "" && chunk_id != undefined && chunk_id != null){
            chunk_id = chunks_list.pop();
        }
        $.getJSON("/the-rambling-cartographer/get_chunk_data.php?CHUNK=" + chunk_id, process_more_cached_locations);
    }
    else {
        pending_location_update = false;
    }
}

function process_more_cached_locations(locations){
    if(locations.error != undefined){
        alert(locations.error);
    }
    else{
        for(id in locations){
            location_entry = locations[id];
            location_list.push(location_entry);
        }
    }
    pending_location_update = false;
}

function add_marker_to_map(now){

    if(location_list.length > 0){
        location_entry       = location_list[0];
        location_timestamp   = parseInt(location_entry.time, 10);
        
        if((now - last_marker_add_time) / 1000 > new_marker_wait_time){
            update_datetime_text(location_timestamp);
            location_list.shift();
            make_and_add_marker([location_entry.latitude, location_entry.longitude]);
            last_marker_add_time = now;
        }
        while (markers_list.length > maximum_markers){
            marker = markers_list.shift();
            marker.destroy();
        }
    }
}

function update_datetime_text(unixtime){
    datetime = new Date(unixtime * 1000);
    datetime_element.html("Showing locations of " + maximum_markers + " hits after:<br/>" + datetime);
    delete datetime;
}

function initialize() {
    get_chunks_list();
    datetime_element = $("div#datetime");

    var options = { zoom: 3, dragging: true, zooming: true, tilting: true, position: [51.411952, -0.143645] };
    earth = new WE.map('earth_div', options);

    WE.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 1000,
        attribution: 'https://github.com/stamen/toner-carto'
    }).addTo(earth);

    before = null;

    requestAnimationFrame(function animate(now) {
        var elapsed = before? now - before: 0;
        before = now;
        rotate_earth(elapsed);
        render_locations(now);
        requestAnimationFrame(animate);
    });
    rotate_speed = rotate_speed_slave;
    $("a#resume").hide();
    $("div#earth_div").mousedown(pause_rotation);
}

function pause_rotation(){
    rotate_speed = 0;
    $("a#pause").hide();
    $("a#resume").show();
}

function resume_rotation(){
    rotate_speed = rotate_speed_slave;
    $("a#pause").show();
    $("a#resume").hide();
}

function render_locations(now){
    if(location_list.length < 5000 && (!pending_location_update)) {
        pending_location_update = true;
        cache_more_locations();
    }
    add_marker_to_map(now);
}

function rotate_earth(elapsed){
    var c = earth.getCenter();
    latitude  = c[0];
    longitude = (((c[1] + 180.0) + rotate_speed * (elapsed/30.0)) % 360.0) - 180.0;
    earth.setCenter([latitude, longitude]);
}

function get_chunks_list(){
    $.ajax({
        type: "GET",
        url: "/the-rambling-cartographer/get_chunks_list.php",
        success: got_chunks_list
    });
}

function got_chunks_list(data){
    chunks_list = data.split("\n");
    cache_more_locations();
}

function make_and_add_marker(location_entry){
	latitude = location_entry[0];
	longitude = location_entry[1];

    zoom = Math.E ^ (earth.getZoom() * Math.LN2);
    if(zoom == 0) zoom = 1;
    radius = marker_radius / zoom;
    circle = [];
    for(i = 0; i < (2 * Math.PI) ; i += (2 * Math.PI / marker_sections)){
        lon = longitude + radius * Math.cos(i);
        lat = latitude  + radius * Math.sin(i);
        circle.push([lat,lon]);
    }
	
	options    = {color: marker_colour, opacity: 1.0, fillColor: marker_colour, fillOpacity: 1, weight: 0};
    circle = WE.polygon(circle, options).addTo(earth);
	markers_list.push(circle);
}
