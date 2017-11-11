// spotify-recorder - main script
// (c) 2017 Micha Hanselmann

"use strict"

// imports
const authenticate = require("./authenticate")
const axios = require("axios")
const fs = require("fs")
const metadata = require("./metadata")
const player = require("./player")
const recorder = require("./recorder")
const uriResolver = require("./uriResolver")

// initialization
const init = async () => {
    // create output folder
    if (!fs.existsSync("out"))
        fs.mkdirSync("out")

    // authenticate and get tokens
    const tokens = await authenticate.getTokens()

    // set axios defaults
    axios.defaults.baseURL = "https://api.spotify.com/v1"
    axios.defaults.headers.common["Authorization"] = "Bearer " + tokens.access_token

    // prepare spotify player
    try {
        await player.prepare()
    } catch(error) {
        if (error.response && error.response.data.error.message.includes("expire")) {
            console.log("refreshing tokens")
            await authenticate.refreshTokens(tokens.refresh_token)
            return init()
        } else {
            console.log(error.response.data || error)
        }
    }

    // retrieve track ids from uri
    const tracks = await uriResolver(process.argv[2])

    // record
    work(tracks)
}

// record tracks
const work = async (tracks) => {
    // pop first track
    console.log("\n" + tracks.length + " track(s) remaining...")
    if (tracks.length == 0)
        return
    const trackId = tracks.shift()

    // retrieve metadata
    const trackMetadata = await metadata(trackId)
    console.log("recording: " + trackMetadata.artist + " - " + trackMetadata.title)

    // start recording
    const wavFile = "out/" + trackId + ".wav"
    const mp3File = "out/" + trackMetadata.artist + " - " + trackMetadata.title + ".mp3"
    recorder(wavFile, mp3File, trackMetadata, () => {
        console.log("finished")
        fs.unlinkSync(wavFile) // cleanup
        fs.unlinkSync(trackMetadata.artwork)
        work(tracks) // recurse
    })
    player.playSong("spotify:track:" + trackId)
}

// start
init()
