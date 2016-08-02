var chunks_list;

function initialize() {
    get_chunks_list();
    
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
        var c = earth.getCenter();
        var elapsed = before? now - before: 0;
        before = now;
        latitude  = c[0];
        longitude = (((c[1] + 180.0) + speed * (elapsed/30.0)) % 360.0) - 180.0;
        earth.setCenter([latitude, longitude]);
        requestAnimationFrame(animate);
    });


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
}
