var moment = require('moment')
var prettyBytes = require('pretty-bytes')

// HTML elements
var $body = $('body')
var $progressBar = $('#progressBar')
var $streamedFileName = $('#streamedFileName')
var $numPeers = $('#numPeers')
var $downloaded = $('#downloaded')
var $total = $('#total')
var $remaining = $('#remaining')
var $uploadSpeed = $('#uploadSpeed')
var $downloadSpeed = $('#downloadSpeed')

var announceList = [
['udp://tracker.openbittorrent.com:80'],
['udp://tracker.internetwarriors.net:1337'],
['udp://tracker.leechers-paradise.org:6969'],
['udp://tracker.coppersurfer.tk:6969'],
['udp://exodus.desync.com:6969'],
['wss://tracker.webtorrent.io'],
['wss://tracker.btorrent.xyz'],
['wss://tracker.openwebtorrent.com'],
['wss://tracker.fastcast.nz']
]

global.WEBTORRENT_ANNOUNCE = announceList
.map(function (arr) {
	return arr[0]
})
.filter(function (url) {
	return url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0
})

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

	// Find largest file
	var largestFile = torrent.files[0]
	for (var i = 1; i < torrent.files.length; i++) {
		if (torrent.files[i].length > largestFile.length)
			largestFile = torrent.files[i]
	}

	// Display name of the file being streamed
	$streamedFileName.html(largestFile.name)

	// Update clipboard share url
	$('#share-url').val('https://ferrolho.github.io/magnet-player/#' + torrent.infoHash);

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
		$body.addClass('is-seed')
		onProgress()
	}
}
