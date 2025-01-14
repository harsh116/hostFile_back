const fetch = require("node-fetch");
const fs = require("fs");

// const { Readable } = require("stream");

const { consoleWrite } = require("../others/helpers");
const { SIRV_UPLOAD_DIRECTORY } = require("../constants");

process.env.ENVIRONMENT === "prod" ? (console.log = consoleWrite) : "";

const sirvBaseUrl = "https://api.sirv.com/v2";

const bufferToStream = (buffer, ogname) => {
  // const readable = new Readable();
  // readable.push(buffer);
  // readable.push(null);
  // return readable;

  const path = `uploads/${encodeURIComponent(ogname)}`;
  fs.writeFileSync(path, buffer);
  const readStream = fs.createReadStream(path);
  return readStream;
};

// get bearer token
const getAuthToken = async () => {
  const sirvTokenUrl = `${sirvBaseUrl}/token`;
  const jsonbody = JSON.stringify({
    clientId: process.env.SIRV_CLIENT_ID,
    clientSecret: process.env.SIRV_CLIENT_SECRET,
  });

  const res = await fetch(sirvTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: jsonbody,
  });

  const { token } = await res.json();

  return token;
};

const uploadFile_sirv = async ({ file, ogName }) => {
  // file will be stored in Uploads folder
  const encodedFileName = encodeURIComponent(ogName);
  const encodedUploadDirectory = encodeURIComponent(SIRV_UPLOAD_DIRECTORY);
  const encodedRemoteFilePath = encodeURIComponent(
    `/${SIRV_UPLOAD_DIRECTORY}/${ogName}`,
  );
  const queryString = `filename=${encodedRemoteFilePath}`;
  const sirvUploadUrl = `${sirvBaseUrl}/files/upload?${queryString}`;

  const sharable_link = `https://${process.env.SIRV_USERNAME}.sirv.com/${encodedUploadDirectory}/${encodedFileName}`;

  try {
    // fetching bearer token which will expire in 20 min
    const bearer_token = await getAuthToken();

    // console.log("brearer token: ", bearer_token);

    // const fileBuffer = Buffer.from("Hello, this is a file buffer!");
    const fileStream = bufferToStream(file, ogName);

    const res = await fetch(sirvUploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/octlet-stream",
        authorization: `Bearer ${bearer_token}`,
      },
      body: fileStream,
    });

    const localUploadFilePath = `uploads/${encodeURIComponent(ogName)}`;

    if (res.ok) {
      const data = await res.text();
      console.log("File uploaded successfully");
      try {
        fs.unlinkSync(localUploadFilePath);
      } catch (err) {
        console.warn("file dont exist");
      }
      return { status: "ok", data: sharable_link };
    } else {
      const error = await res.text();
      console.error("Error uploading file:", error);
      try {
        fs.unlinkSync(localUploadFilePath);
      } catch (err) {
        console.warn("file dont exist");
      }
      return { status: "error" };
    }
  } catch (err) {
    console.error("Error uploading file:", err);
    try {
      fs.unlinkSync(localUploadFilePath);
    } catch (err) {
      console.warn("file dont exist");
    }
    return { status: "error" };
  }
};

module.exports = uploadFile_sirv;
