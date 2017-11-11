// uriResolver - resolve tracks from spotify uri
// (c) 2017 Micha Hanselmann

"use strict"

// imports
const axios = require("axios")

// resolve an uri
module.exports = async (uri) => {
    let tracks = []

    // uri type
    const uriData = uri.split(":")
    switch (uriData[1]) {
    case "album":
        await resolveFromAlbum(uriData[2], tracks)
        break
    case "user": // -> playlists!
        await resolveFromPlaylist(uriData[2], uriData[4], tracks)
        break
    case "track":
        await resolveTrack(uriData[2], tracks)
        break
    default:
        console.log("Unknown uri format:", uri)
    }

    return tracks
}

// resolve tracks from album
const resolveFromAlbum = async (albumId, tracks) => {
    const response = await axios.get("/albums/" + albumId + "/tracks?limit=50&offset=" + tracks.length)
    response.data.items.map(track => track.id).forEach(id => tracks.push(id))
    if (response.data.next)
        await resolveFromAlbum(albumId, tracks) // fetch recursively
}

// resolve tracks from playlist
const resolveFromPlaylist = async (userId, playlistId, tracks) => {
    const response = await axios.get("/users/" + userId + "/playlists/" +
        playlistId + "/tracks?limit=100&fields=items(track(id)),next&offset=" + tracks.length)
    response.data.items.map(item => item.track.id).forEach(id => tracks.push(id))
    if (response.data.next)
        await resolveFromPlaylist(userId, playlistId, tracks) // fetch recursively
}

// resolve track (used for id validation)
const resolveTrack = async (trackId, tracks) => {
    const response = await axios.get("/tracks/" + trackId)
    tracks.push(response.data.id)
}
