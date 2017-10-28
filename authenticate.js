// authenticate - used for authenticate and get a token
// (c) 2017 Micha Hanselmann

"use strict"

// imports
const axios = require("axios")
const config = require("./config")
const fs = require("fs")
const http = require("http")
const httpShutdown = require("http-shutdown")
const opn = require("opn")
const qs = require("qs")
const url = require("url")

// get tokens
exports.getTokens = () => new Promise((resolve, reject) => {
    // are there already any tokens?
    if (fs.existsSync("tokens.json")) { // reuse
        const tokens = JSON.parse(fs.readFileSync("tokens.json", "utf8"))
        resolve(tokens)

    } else { // request
        authorizeApp((authToken) => {
            getTokensByAuthCode(authToken, (tokens) => {
                fs.writeFileSync("tokens.json", JSON.stringify(tokens, null, 2), "utf8")
                resolve(tokens)
            })
        })
    }
})

// authorize app and get auth code
const authorizeApp = (callback) => {
    // set query params
    const params = {
        client_id: config.client_id,
        response_type: "code",
        redirect_uri: config.redirect_uri,
        scope: "user-read-playback-state user-modify-playback-state"
    }

    // create server
    const server = httpShutdown(http.createServer((req, res) => {
        const data = url.parse(req.url, true).query
        if (data.code) {
            console.log("retrieved auth code: " + data.code);

            // close tab and stop server
            res.writeHeader(200, { "Content-Type": "text/html" })
            res.write("<html><body>done.<script>close();</script></body>")
            res.end(() => {
                server.shutdown(() => {
                    console.log("server stopped")
                    callback(data.code)
                })
            })
        }
    }))

    // start listening
    server.listen(4000, "127.0.0.1", (error) => {
        if (error)
            return console.log(error)
        console.log("listening on 127.0.0.1:4000 for callback")
    })

    // open url
    opn("https://accounts.spotify.com/authorize?" + qs.stringify(params), { wait: false })
}

// exchange auth code for tokens
const getTokensByAuthCode = (authCode, callback) => {
    // set query params
    const params = {
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: config.redirect_uri
    }

    // set header
    const authHeader = new Buffer(config.client_id + ":" + config.client_secret).toString("base64")
    const options = { headers: { "Authorization": "Basic " + authHeader } }

    // query
    axios.post("https://accounts.spotify.com/api/token", qs.stringify(params), options)
        .then((res) => {
            if (!res.data.access_token)
                return console.log("error: " + res.data)
            callback({
                access_token: res.data.access_token,
                refresh_token: res.data.refresh_token
            })
        })
        .catch((error) => {
            console.log(error)
        })
}
