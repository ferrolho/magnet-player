$(window).bind("resize", function() {
	fitMagnetInput();
});

$(document).ready(function() {
	fitMagnetInput(); 
});

function fitMagnetInput() {
	var formW = $('#magnet-input').width();
	var buttonW = $('#magnet-input button').outerWidth();
	$('#magnet-input input').outerWidth(formW - buttonW);
}
