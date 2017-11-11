// recorder - record songs and encode to mp3 with metadata
// (c) 2017 Micha Hanselmann

"use strict"

// imports
const fs = require("fs")
const lame = require("node-lame")
const record = require("node-record-lpcm16")

// record audio and encode to mp3 with metadata
module.exports = (wavFile, mp3File, trackMetadata, callback) => {
    recordAudio(wavFile).then(async () => {
        await encode(wavFile, mp3File, trackMetadata)
        callback()
    })
}

// record audio stream to file
const recordAudio = (file) => new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(file, { encoding: "binary" })
    record.start({
        // device: "",
        channels: 2,
        sampleRate: 44100,
        silence: "0:05",
        threshold: 0.01
        // verbose: true
    }).pipe(stream)
        .on("error", (error) => reject(error))
        .on("finish", () => resolve())
})

// encode wav file to mp3 and add metadata
const encode = (wavFile, mp3File, trackMetadata) => {
    return new lame.Lame({
        bitrate: 320,
        output: mp3File,
        quality: 2,
        meta: trackMetadata
    }).setFile(wavFile).encode()
}
