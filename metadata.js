// metadata - resolve metadata for tracks
// (c) 2017 Micha Hanselmann

"use strict"

// imports
const axios = require("axios")
const fs = require("fs")
const request = require("request")

// resolve metadata for track
module.exports = async (trackId) => {
    // get track object
    const response = await axios.get("/tracks/" + trackId)

    // retrieve album artwork (with highest res)
    const artworkUrl = response.data.album.images.sort((i1, i2) => i2.height - i1.height)[0].url
    const artworkFile = "out/" + trackId + ".jpg"
    await downloadArtwork(artworkUrl, artworkFile)

    // create track metadata object
    return {
        title: response.data.name,
        album: response.data.album.name,
        artist: response.data.artists[0].name,
        track: response.data.track_number,
        artwork: artworkFile
    }
}

// download artwork from url to file
const downloadArtwork = (url, file) => new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(file)
    request(url)
        .on("error", error => reject(error))
        .pipe(stream)
    stream.on("finish", () => resolve())
})
