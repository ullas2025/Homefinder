const app = require("./app");
const { port } = require("./config/env");

app.listen(port, () => {
  console.log(`HomeFinder API listening on port ${port}`);
});
