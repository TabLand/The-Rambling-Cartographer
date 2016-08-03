var chunks_list = [];
var location_list = [];
var pending_location_update = false;
var rotate_speed = 0;
var start_timestamp = Date.now() / 1000;
var datetime_element = null; 
var markers_list = [];
var maximum_markers = 300;
var last_marker_add_time = 0;
var new_marker_wait_time = 0.1;
var marker_scale = 0.05;

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
            marker[0].destroy();
            marker[1].destroy();
        }
    }
}

function update_datetime_text(unixtime){
    datetime = new Date(unixtime * 1000);
    datetime_element.text(datetime);
    delete datetime;
}

function initialize() {
    get_chunks_list();
    datetime_element = $("div#datetime");

    var options = { zoom: 3, dragging: true, zooming: true, tilting: true, position: [51.411952, -0.143645] };
    earth = new WE.map('earth_div', options);

    WE.tileLayer('http://a.tile.stamen.com/toner/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 100,
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

	u1 = [latitude - 2.5 * marker_scale, longitude - 2   * marker_scale];
	u2 = [latitude - 2.5 * marker_scale, longitude - 5   * marker_scale];
	u3 = [latitude + 2.5 * marker_scale, longitude - 5   * marker_scale];
	u4 = [latitude + 2.5 * marker_scale, longitude - 7   * marker_scale];
	u5 = [latitude + 6.5 * marker_scale, longitude - 3.5 * marker_scale];
	u6 = [latitude + 2.5 * marker_scale, longitude]
	u7 = [latitude + 2.5 * marker_scale, longitude -2    * marker_scale];

	d1 = [latitude + 2.5 * marker_scale, longitude + 2   * marker_scale];
	d2 = [latitude + 2.5 * marker_scale, longitude + 5   * marker_scale];
	d3 = [latitude - 2.5 * marker_scale, longitude + 5   * marker_scale];
	d4 = [latitude - 2.5 * marker_scale, longitude + 7   * marker_scale];
	d5 = [latitude - 6.5 * marker_scale, longitude + 3.5 * marker_scale];
	d6 = [latitude - 2.5 * marker_scale, longitude];
	d7 = [latitude - 2.5 * marker_scale, longitude + 2   * marker_scale];

	arrow_up   = [u1, u2, u3, u4, u5, u6, u7];
	arrow_down = [d1, d2, d3, d4, d5, d6, d7];
	
	options    = {color: '#000', opacity: 0.8, fillColor: '#000', fillOpacity: 1, weight: 0};
    arrow_up   = WE.polygon(arrow_up,   options).addTo(earth);
    arrow_down = WE.polygon(arrow_down, options).addTo(earth);
	markers_list.push([arrow_up, arrow_down]);
}
