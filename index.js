const express = require("express");
const { schema } = require("./graphql/graphqlSchema");
const { createHandler } = require("graphql-http/lib/use/express");

const app = express();

app.get("/", async (req, res) => {
  res.send("Server is running");
});
app.use(express.json());

app.all("/graphql", createHandler({ schema }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({ error: 1, msg: "Something broke!" });
});

app.listen(5005, console.log("Server is running on port 5005"));
