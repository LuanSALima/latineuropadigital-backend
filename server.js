const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const fileUpload = require('express-fileupload');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

//assigning a variable that is the root path of the project
global.__basedir = __dirname;

app.use(cors());
app.use(express.json());

app.use(fileUpload());
app.use(express.static('public'))

const uri = process.env.MONGO_URL;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
	.catch(err => console.log('Erro ao Conectar ao MongoDB: ' + err));

const connection = mongoose.connection;
connection.once('open', () => {
	console.log("MongoDB database connection established successfully");
});

const routes = require('./src/routes.js');
app.use('/', routes);

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});