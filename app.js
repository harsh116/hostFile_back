const fs = require("fs");

const { consoleWrite } = require("./others/helpers");
console.log = consoleWrite;

const express = require("express");
const app = express();
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 8080;

const fetch = require("node-fetch");
// const {fileFromSync}= require("node-fetch-commonjs");

const cors = require("cors");
const FormData = require("form-data");
// const File = require("file-class");

const handleSubmitFiles = require("./controllers/submitFiles");

app.use(express.json());
// app.use(upload.array());

const corsOptions = {
  // origin: "http://example.com",
  credentials: true,
};

// const filename = "saffola munchies.jpg";

// const file = fs.readFileSync(filename);

app.use(cors(corsOptions));

const fieldsToParse = [
  { name: "file", maxCount: 1 },
  { name: "pos", maxCount: 1 },
  { name: "isEnd", maxCount: 1 },
  { name: "fileName", maxCount: 1 },
  { name: "total", maxCount: 1 },
  { name: "fileIndex", maxCount: 1 },
  { name: "hostname", maxCount: 1 },
];

// File()

// console.log("file class: ", File(filename));

// formData.append("reqtype", "fileupload");
// formData.append("fileToUpload", fileFromSync(filename));
// formData.append("fileToUpload", file,filename);

// console.log(file)

app.post("/submitFiles", upload.fields(fieldsToParse), handleSubmitFiles);

app.get("/hello", (req, res) => {
  console.log("hello");
  res.json("hello world");
});

const server = app.listen(PORT, () => {
  console.log("app is running in PORT ", PORT);
});
