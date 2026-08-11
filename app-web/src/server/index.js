const express = require("express");
const cors = require("cors");
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.EXPRESS_PORT;

const authRoutes = require('./authRoutes');
const userData = require('./userData');
const artistData = require('./artistsData');
const database = require('./database');
const songData = require('./songData');

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({limit: "10mb", extended: true}));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());

// Usa las rutas importadas
app.use(authRoutes);
app.use(userData);
app.use(artistData);
app.use("/api", database);
app.use(songData);

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
