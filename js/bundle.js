(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./webtorrent.js');

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

},{"./webtorrent.js":2}],2:[function(require,module,exports){
var prettyBytes = require('pretty-bytes')

// HTML elements
var $body = $('body')
var $progressBar = $('#progressBar')
var $numPeers = $('#numPeers')
var $downloaded = $('#downloaded')
var $total = $('#total')
var $remaining = $('#remaining')
var $uploadSpeed = $('#uploadSpeed')
var $downloadSpeed = $('#downloadSpeed')

var client = new WebTorrent()

client.on('error', function(err) {
	console.error('ERROR: ' + err.message)
})

// Download by form input
$('form').submit(function(e) {
	e.preventDefault() // Prevent page refresh

	var torrentId = $('form input[name=torrentId]').val()

	if (torrentId.length > 0)
		downloadTorrent(torrentId)
})

// Download by URL hash
onHashChange()
window.addEventListener('hashchange', onHashChange)
function onHashChange () {
	var hash = decodeURIComponent(window.location.hash.substring(1)).trim()
	if (hash !== '') downloadTorrent(hash)
}

function downloadTorrent(torrentId) {
	console.log('Downloading torrent from ' + torrentId)
	client.add(torrentId, onTorrent)
}

function onTorrent(torrent) {
	torrent.on('warning', console.log)
	torrent.on('error', console.log)

	console.log('Got torrent metadata!')
	console.log('Torrent info hash: ' + torrent.infoHash + ' ' +
		'<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
		'<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>')

	// Find largest file
	var largestFile = torrent.files[0]
	for (var i = 1; i < torrent.files.length; i++) {
		if (torrent.files[i].length > largestFile.length)
			largestFile = torrent.files[i]
	}

	// Stream the file in the browser
	largestFile.appendTo('#output')

	// hide magnet input
	$('#magnet-input').slideUp()

	// show player
	$('#hero').slideDown()

	// Trigger statistics refresh
	torrent.on('done', onDone)
	setInterval(onProgress, 500)
	onProgress()

	// Statistics
	function onProgress () {
		// Peers
		$numPeers.html(torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers'))

		// Progress
		var percent = Math.round(torrent.progress * 100 * 100) / 100
		$progressBar.width(percent + '%')
		$downloaded.html(prettyBytes(torrent.downloaded))
		$total.html(prettyBytes(torrent.length))

		// Remaining time
		var remaining
		if (torrent.done) {
			remaining = 'Done'
		} else {
			remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize()
			remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining'
		}
		$remaining.html(remaining)

		// Speed rates
		$downloadSpeed.html(prettyBytes(torrent.downloadSpeed) + '/s')
		$uploadSpeed.html(prettyBytes(torrent.uploadSpeed) + '/s')
	}

	function onDone () {
		$body.className += ' is-seed'
		onProgress()
	}
}

},{"pretty-bytes":3}],3:[function(require,module,exports){
'use strict';
const UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

module.exports = num => {
	if (!Number.isFinite(num)) {
		throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
	}

	const neg = num < 0;

	if (neg) {
		num = -num;
	}

	if (num < 1) {
		return (neg ? '-' : '') + num + ' B';
	}

	const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), UNITS.length - 1);
	const numStr = Number((num / Math.pow(1000, exponent)).toPrecision(3));
	const unit = UNITS[exponent];

	return (neg ? '-' : '') + numStr + ' ' + unit;
};

},{}]},{},[1]);
