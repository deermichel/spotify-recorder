// player - spotify player interaction
// (c) 2017 Micha Hanselmann

"use strict"

// imports
const axios = require("axios")

// prepare player
exports.prepare = async () => {
    await pausePlayback() // silence is golden
    await setVolume(100) // no loss
    await setRepeatMode("off") // song-per-song recording
}

// play (single) song
exports.playSong = (songUri) =>
    axios.put("/me/player/play", {
        uris: [ songUri ]
    })

// set player volume
const setVolume = (volume) =>
    axios.put("/me/player/volume?volume_percent=" + volume)

// set repeat mode
const setRepeatMode = (state) =>
    axios.put("/me/player/repeat?state=" + state)

// pause playback
const pausePlayback = () =>
    axios.put("/me/player/pause")
