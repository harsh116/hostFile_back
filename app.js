const fs = require("fs");

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

app.use(express.json());
// app.use(upload.array());

const corsOptions = {
  // origin: "http://example.com",
  credentials: true,
};

// const filename = "saffola munchies.jpg";

// const file = fs.readFileSync(filename);

app.use(cors(corsOptions));

const catboxURL = "https://catbox.moe/user/api.php";

// File()

// console.log("file class: ", File(filename));

// formData.append("reqtype", "fileupload");
// formData.append("fileToUpload", fileFromSync(filename));
// formData.append("fileToUpload", file,filename);

// console.log(file)

const uploadFile = async (fileObj) => {
  const formData = new FormData();

  const { filename, size, ogName } = fileObj;

  const file = fs.readFileSync(`uploads/${filename}`);

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", file, ogName);
  // return;
  try {
    const res = await fetch(catboxURL, {
      method: "post",
      headers: {
        filename: ogName,
      },
      body: formData,
    });
    const data = await res.text();

    console.log("file uploaded ", data);
    return { status: "ok", data };
  } catch (err) {
    console.log("error: ", err);
    return { status: "error" };
  }
};

app.post("/submitFiles", upload.array("fileInputs"), async (req, res) => {
  // const fD = req.body;

  const files = req.files;

  // console.log("files: ", files);

  const fileObjs = files.map((file) => {
    return {
      ogName: file.originalname,
      size: file.size,
      filename: file.filename,
    };
  });
  console.log("🚀 ~ file: app.js:86 ~ fileObjs ~ fileObjs:", fileObjs);

  const resultObjs = [];
  for (let fileObj of fileObjs) {
    const obj = await uploadFile(fileObj);
    if (obj.status == "error") {
      resultObjs.push({ status: error, filename: fileObj.ogName });
    } else {
      resultObjs.push({
        status: "ok",
        filename: fileObj.ogName,
        url: obj.data,
      });
    }
    // console.log("obj: ", obj);
  }

  res.json(resultObjs);
});

app.get("/hello", (req, res) => {
  console.log("hello");
  res.json("hello world");
});

const server = app.listen(PORT, () => {
  console.log("app is running in PORT ", PORT);
});
