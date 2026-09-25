const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("authors", req.query || {}, res);