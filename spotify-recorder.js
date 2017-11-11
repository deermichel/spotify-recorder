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
    const tracks = await uriResolver("spotify:track:59PPpIN9gGeOCEIMwA0QX7")

    // record
    console.log("recording " + tracks.length + " track(s)...")
    tracks.forEach(track => process(track))
}

// process one track
const process = async (trackId) => {
    const trackMetadata = await metadata(trackId)
    console.log(trackMetadata)
    //     let file = fs.createWriteStream("test.wav", { encoding: "binary" })
    //     let rec = recorder.start(file)
    //     rec.on("finish", () => {
    //         const encoder = new Lame({
    //             output: "test.mp3",
    //             bitrate: 320,
    //             quality: 2
    //         }).setFile("test.wav")
    //         encoder.encode()
    //     })
    //     player.playSong("spotify:track:" + track)
}

// start
init()
