const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("search", req.query || {}, res);