require('./webtorrent.js');

var clipboard = new Clipboard('#share-url-btn');
clipboard.on('success', function (e) {
	$('#share-url-btn').attr('title', 'Copied!').tooltip('fixTitle').tooltip('show');
	e.clearSelection();
});

$(window).bind("resize", function() {
	fitMagnetInput();
});

$(document).ready(function() {
	$('#share-url').val(window.location.href);
	$('[data-toggle="tooltip"]').tooltip();
	$('#share-url-btn').mouseleave(function () {
		$('#share-url-btn').attr('title', 'Copy to clipboard').tooltip('fixTitle');
	});

	fitMagnetInput();
});

function fitMagnetInput() {
	var formW = $('#magnet-input').width();
	var buttonW = $('#magnet-input button').outerWidth();
	$('#magnet-input input').outerWidth(formW - buttonW);
}
