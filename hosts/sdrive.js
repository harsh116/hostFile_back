const FormData = require("form-data");
const fetch = require("node-fetch");
const axios=require('axios')

const { consoleWrite } = require("../others/helpers");
// console.log = consoleWrite;

const sdriveURL='https://sdrive.app/publicapi/upload'
// const catboxURL = "https://catbox.moe/user/api.php";

const uploadFile_sdrive = async (fileObj) => {
  const formData = new FormData();

  const { file, ogName } = fileObj;

  // const file = fs.readFileSync(`uploads/${filename}`);

  formData.append('file', file, { filename: ogName}); // Specify the filename when appending the file

  // formData.append("reqtype", "fileupload");
  // formData.append("fileToUpload", file, ogName);

  console.log("before uploading");
  // return;
  try {
     const res=await axios.post(sdriveURL, formData, {
        headers: {
          ...formData.getHeaders() // Include headers from FormData
        }
    })
    const data = await res.data

    console.log("file uploaded: ", data);
    return { status: "ok", data };
  } catch (err) {
    console.log("error: ", err);
    return { status: "error" };
  }
};

module.exports = uploadFile_sdrive;