const { sendRoute } = require("../lib/api");

module.exports = (req, res) => sendRoute("themes", req.query || {}, res);