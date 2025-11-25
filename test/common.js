const get = require('simple-get')
const thunky = require('thunky')
const bowser = require('bowser')

exports.getConfig = thunky(function (cb) {

  get.concat('https://instant.io/__rtcConfig__', function (err, res, data) {
    if (err) return cb(err)
    data = data.toString()
    try {
      data = JSON.parse(data)
    } catch (err) {
      cb(err)
      return
    }
    cb(null, data)
  })
})


if (process.env.WRTC === 'wrtc') {
  exports.wrtc = require('wrtc')
}


let canvas
exports.getMediaStream = function () {
  if (exports.wrtc) {
    const source = new exports.wrtc.nonstandard.RTCVideoSource()
    const tracks = [source.createTrack(), source.createTrack()]
    return new exports.wrtc.MediaStream(tracks)
  } else {
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = canvas.height = 100
      canvas.getContext('2d') 
    }
    const stream = canvas.captureStream(30)
    stream.addTrack(stream.getTracks()[0].clone()) 
    return stream
  }
}

exports.isBrowser = function (name) {
  if (typeof (window) === 'undefined') return false
  const satifyObject = {}
  if (name === 'ios') { 
    satifyObject.mobile = { safari: '>=0' }
  } else {
    satifyObject[name] = '>=0'
  }
  return bowser.getParser(window.navigator.userAgent).satisfies(satifyObject)
}
