var chunks_list = [];
var location_list = [];
var pending_location_update = false;
var rewind_speed = 60*60*24; 
var start_timestamp = Date.now() / 1000;
var datetime_element = null; 
var markers_list = [];
var maximum_markers = 300;

function cache_more_locations(){
    if(chunks_list.length != 0){
        chunk_id = "";
        while(chunk_id == "" && chunks_id != undefined && chunks_id != null){
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
    comparison_timestamp = start_timestamp - (now / 1000 * rewind_speed);
    location_timestamp   = comparison_timestamp + 1;

    while(comparison_timestamp < location_timestamp){
        if(location_list.length > 0){
            location_entry       = location_list[0];
            location_timestamp   = parseInt(location_entry.time, 10);
            update_datetime_text(comparison_timestamp);
            if(comparison_timestamp < location_timestamp){
                location_list.shift();
                marker_position = [location_entry.latitude, location_entry.longitude];
                marker = WE.marker(marker_position, '/the-rambling-cartographer/images/visitor.png', 15, 15).addTo(earth);
                markers_list.push(marker);
            }
            while (markers_list.length > maximum_markers){
                marker = markers_list.shift();
                marker.detach();
                marker.element.remove();
            }
        }
        else{
            break;
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

    var options = { zoom: 3, dragging: false, zooming: false, tilting: false, position: [51.411952, -0.143645] };
    earth = new WE.map('earth_div', options);

    WE.tileLayer('http://a.tile.stamen.com/toner/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 100,
        attribution: 'https://github.com/stamen/toner-carto'
    }).addTo(earth);

    before = null;
    speed = 0.05;

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
    longitude = (((c[1] + 180.0) + speed * (elapsed/30.0)) % 360.0) - 180.0;
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

function make_marker(location){
	latitude = location[0];
	longitude = location[1];

	a1 = [latitude - 2.5 * marker_scale, longitude - 2   * marker_scale];
	a2 = [latitude - 2.5 * marker_scale, longitude - 5   * marker_scale];
	a3 = [latitude + 2.5 * marker_scale, longitude - 5   * marker_scale];
	a4 = [latitude + 2.5 * marker_scale, longitude - 7   * marker_scale];
	a5 = [latitude + 6.5 * marker_scale, longitude - 3.5 * marker_scale];
	a6 = [latitude + 2.5 * marker_scale, longitude]
	a7 = [latitude + 2.5 * marker_scale, longitude -2    * marker_scale];

	b1 = [latitude + 2.5 * marker_scale, longitude + 2   * marker_scale];
	b2 = [latitude + 2.5 * marker_scale, longitude + 5   * marker_scale];
	b3 = [latitude - 2.5 * marker_scale, longitude + 5   * marker_scale];
	b4 = [latitude - 2.5 * marker_scale, longitude + 7   * marker_scale];
	b5 = [latitude - 6.5 * marker_scale, longitude + 3.5 * marker_scale];
	b6 = [latitude - 2.5 * marker_scale, longitude];
	b7 = [latitude - 2.5 * marker_scale, longitude + 2   * marker_scale];

	arrow_up = [a1, a2, a3, a4, a5, a6, a7];
	arrow_down = [d1, d2, d3, d4, d5, d6, d7];

	options = {};
}
