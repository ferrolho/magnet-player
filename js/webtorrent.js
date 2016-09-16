//var torrentId = 'https://webtorrent.io/torrents/sintel.torrent'
//var torrentId = 'magnet:?xt=urn:btih:b1fd382624649108fa879fe1b026a50cf6727c6f&dn=readme.txt&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.webtorrent.io'

var client = new WebTorrent()

client.on('error', function(err) {
	console.error('ERROR: ' + err.message)
})

function log (str) {
	var p = document.createElement('p')
	p.innerHTML = str
	$('.log').append(p)
}

$('form').submit(function(e) {
	e.preventDefault() // Prevent page refresh

	var torrentId = $('form input[name=torrentId]').val()
	log('Adding ' + torrentId)
	client.add(torrentId, onTorrent)
})

// HTML elements
var $body = $('body')
var $progressBar = $('#progressBar')
var $numPeers = $('#numPeers')
var $downloaded = $('#downloaded')
var $total = $('#total')
var $remaining = $('#remaining')
var $uploadSpeed = $('#uploadSpeed')
var $downloadSpeed = $('#downloadSpeed')

// Download the torrent
client.add(torrentId, onTorrent)

// Human readable bytes util
function prettyBytes(num) {
	var exponent, unit, neg = num < 0, units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	if (neg)
		num = -num
	if (num < 1) return (neg ? '-' : '') + num + ' B'
		exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1)
	num = Number((num / Math.pow(1000, exponent)).toFixed(2))
	unit = units[exponent]
	return (neg ? '-' : '') + num + ' ' + unit
}


function onTorrent(torrent) {
	log('Got torrent metadata!')
	log('Torrent info hash: ' + torrent.infoHash + ' ' +
		'<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
		'<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>')


	var largestFile = torrent.files[0]

	for (var i = 1; i < torrent.files.length; i++) {
		if (torrent.files[i].length > largestFile.length)
			largestFile = torrent.files[i]
	}

	// Stream the file in the browser
	largestFile.appendTo('#output')

	// Trigger statistics refresh
	torrent.on('done', onDone)
	setInterval(onProgress, 500)
	onProgress()

	// Statistics
	function onProgress () {
		// Peers
		$numPeers.innerHTML = torrent.numPeers + (torrent.numPeers === 1 ? ' peer' : ' peers')

		// Progress
		var percent = Math.round(torrent.progress * 100 * 100) / 100
		$progressBar.width(percent + '%')
		$downloaded.innerHTML = prettyBytes(torrent.downloaded)
		$total.innerHTML = prettyBytes(torrent.length)

		// Remaining time
		var remaining
		if (torrent.done) {
			remaining = 'Done.'
		} else {
			remaining = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize()
			remaining = remaining[0].toUpperCase() + remaining.substring(1) + ' remaining.'
		}
		$remaining.innerHTML = remaining

		// Speed rates
		$downloadSpeed.innerHTML = prettyBytes(torrent.downloadSpeed) + '/s'
		$uploadSpeed.innerHTML = prettyBytes(torrent.uploadSpeed) + '/s'

	}

	function onDone () {
		$body.className += ' is-seed'
		onProgress()
	}
}
