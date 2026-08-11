const express = require("express");
const querystring = require("querystring");
const request = require("request");

const router = express.Router();

// Variables de entorno
const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

router.get("/login", (req, res) => {
    console.log("Petición de login");
    const scopes = [
        'user-top-read',
        'user-read-private',
        'user-read-email',
        'user-library-read'
    ]
    const url = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            redirect_uri: redirect_uri,
            scope: scopes.join(' ')
        });
    res.status(200).send(url);
});

router.get("/callback", (req, res) => {
    const code = req.query.code || null;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            const refresh_token = body.refresh_token;

            res.cookie('access_token', access_token, { httpOnly: true, secure: false, path: '/', domain: 'localhost' });
            res.cookie('refresh_token', refresh_token, { httpOnly: true, secure: false, path: '/', domain: 'localhost' });

            res.redirect('http://localhost:3000/');
        } else {
            res.redirect('http://localhost:3000/' + 
                querystring.stringify({
                    error: 'invalid_token'
                })
            );
        }
    });
});

router.get('/auth/verify', (req, res) => {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    if (accessToken && refreshToken) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

router.get('/logout', (req, res) => {
    console.log("Petición de logout");
    res.clearCookie('access_token', { httpOnly: true, secure: false, path: '/', domain: 'localhost' });
    res.clearCookie('refresh_token',  { httpOnly: true, secure: false, path: '/', domain: 'localhost' });
    return res.status(200).json({ message: 'Cookies cleared and looged out' });
});

module.exports = router;