const express = require('express');
const AppManager = require('./AppManager');
const { port } = require('./config');

const app = express();
app.use(express.json());

const manager = new AppManager();
manager.initDb();
manager.setupRoutes(app);

if (require.main === module) app.listen(port, () => {
    console.log(`LMS rodando na porta ${port}...`);
});

module.exports = app;
