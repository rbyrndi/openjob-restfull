require('dotenv').config();

const app = require('./app');

const host = process.env.HOST || 'localhost';
const port = Number(process.env.PORT || 3000);

app.listen(port, host, () => {
    console.log(`Server berjalan di http://${host}:${port}`);
});