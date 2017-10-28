// spotify-recorder - main script
// (c) 2017 Micha Hanselmann

"use strict"

// imports
const authenticate = require("./authenticate")
const axios = require("axios")
const fs = require("fs")
const player = require("./player")
const recorder = require("./recorder")

// initialization
const init = async () => {
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
            console.log(error)
        }
    }

    // const file = fs.createWriteStream("test.wav", { encoding: "binary" })
    // recorder.start(file)
}

// start
init()
