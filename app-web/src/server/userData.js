const express = require('express');
const request = require('request');

const router = express.Router();

router.get('/get/user', (req, res) => {
    const access_token = req.cookies.access_token;
    const refresh_token = req.cookies.refresh_token;

    const options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };
    
    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.status(200).json({ userData: body });
        } else {
            res.status(404);
        }
    });
});

router.get('/get/topTracks', (req, res) => {
    const access_token = req.cookies.access_token;
    const time_range = req.query.timeRange;
    const limit = req.query.limit;
    const options = {
        url: `https://api.spotify.com/v1/me/top/tracks?time_range=${time_range}&limit=${limit}`,
        headers: { 'Authorization': 'Bearer '+ access_token} 
    }
    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.status(200).json({ topTracks: body });
        } else {
            res.status(404).send("Error fetching top tracks");
        }
    });
});

router.get('/get/topArtists', (req, res) => {
    const access_token = req.cookies.access_token;
    const time_range = req.query.timeRange;
    const limit = req.query.limit;
    const options = {
        url: `https://api.spotify.com/v1/me/top/artists?time_range=${time_range}&limit=${limit}`,
        headers: { 'Authorization': 'Bearer '+ access_token} 
    }
    request.get(options, function(error, response, body) {
        if (response.statusCode === 200) {
            res.status(200).json({ topArtists: body });
        } else {
            res.status(404).send("Error fetching top artists");
        }
    });
});

module.exports = router;