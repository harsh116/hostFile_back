const fs = require("fs");
// const { Readable } = require("stream");

const { fileObjsState } = require("./states");

// const bufferToStream = (buffer) => {
//   const readable = new Readable();
//   readable.push(buffer);
//   readable.push(null);
//   return readable;
// };

const consoleWrite = (...data) => {
  const date = new Date();

  //   date.toLocaleString()

  fs.appendFileSync(`${__dirname}/log.txt`, `${date.toLocaleString()}\n`);
  fs.appendFileSync(`${__dirname}/log.txt`, JSON.stringify(data));
  fs.appendFileSync(`${__dirname}/log.txt`, "\n\n");
};

// const consoleWrite = console.log;

const uploadFile_catbox = require("../hosts/catbox");
const uploadFile_sdrive = require("../hosts/sdrive");
const uploadFile_sirv = require("../hosts/sirv");
const uploadFile_cloudinary = require("../hosts/cloudinary");
const uploadFile_nextcloud = require("../hosts/nextcloud");

process.env.ENVIRONMENT === "prod" ? (console.log = consoleWrite) : "";

const getLast = (arr) => {
  if (arr.length > 0) return arr[arr.length - 1];
  else {
    return null;
  }
};

const mergeFile = () => {
  const filePieces = getLast(fileObjsState.data);
  console.log("in mergeFile");

  const arrBuffer = [];
  let ogname = "";
  for (let filePiece of filePieces) {
    const pieceData = fs.readFileSync(`uploads/${filePiece.name}`);

    // console.log("🚀 ~ file: helpers.js:32 ~ mergeFile ~ pieceData:", pieceData);
    fs.unlinkSync(`uploads/${filePiece.name}`);
    arrBuffer.push(pieceData);
    ogname = filePiece.ogName;
  }

  console.log("arrBuffer ");
  //   console.log("arrBuffer: ", arrBuffer);

  const mergedFileBuffer = Buffer.concat(arrBuffer);
  return mergedFileBuffer;
  // fs.writeFileSync(`uploads/${ogname}`,mergedFileBuffer)
};

// options available : catbox, sdrive, sirv
const getUploadHostFunction = (hostname) => {
  let uploadFile;
  switch (hostname) {
    case "catbox":
      console.log("switch catbox");
      // uploadFile=uploadFile_catbox
      return uploadFile_catbox;
      // statements_1
      break;
    case "sdrive":
      console.log("switch sdrive");
      // uploadFile=uploadFile_sdrive
      return uploadFile_sdrive;
      break;
    case "sirv":
      console.log("switch sirv");
      return uploadFile_sirv;
      break;
    case "cloudinary":
      console.log("switch cloudinary");
      return uploadFile_cloudinary;
      break;
    case "nextcloud":
      console.log("switch nextcloud");
      return uploadFile_nextcloud;
      break;
    default:
      console.log("switch default");
      // statements_def
      break;

      return null;
  }
};

module.exports = {
  mergeFile,
  getLast,
  consoleWrite,
  getUploadHostFunction,
  // bufferToStream,
};
