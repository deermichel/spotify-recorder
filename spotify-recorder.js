// spotify-recorder - main script
// (c) 2017 Micha Hanselmann

"use strict"

// imports
const authenticate = require("./authenticate")
const axios = require("axios")
const player = require("./player")

// initialization
const init = async () => {
    // authenticate and get tokens
    const tokens = await authenticate.getTokens()

    // set axios defaults
    axios.defaults.baseURL = "https://api.spotify.com/v1"
    axios.defaults.headers.common["Authorization"] = "Bearer " + tokens.access_token

    // prepare spotify player
    player.prepare()
}

// start
init()
