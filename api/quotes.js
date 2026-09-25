const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("quotes", req.query || {}, res);