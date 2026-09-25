const { sendRoute } = require("../../lib/api");

module.exports = (req, res) => sendRoute("author", { ...(req.query || {}), id: req.query?.id }, res);