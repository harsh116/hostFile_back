const FormData = require("form-data");
const fetch = require("node-fetch");

const { consoleWrite } = require("../others/helpers");
console.log = consoleWrite;

const catboxURL = "https://catbox.moe/user/api.php";

const uploadFile_catbox = async (fileObj) => {
  const formData = new FormData();

  const { file, ogName } = fileObj;

  // const file = fs.readFileSync(`uploads/${filename}`);

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", file, ogName);

  console.log("before uploading");
  // return;
  try {
    const res = await fetch(catboxURL, {
      method: "post",
      headers: {
        filename: ogName,
      },
      body: formData,
    });


    // (ಥ﹏ಥ) 
     // ( ͡° ͜ʖ ͡°) 

    const data = await res.text();

    console.log("file uploaded ", data);
    return { status: "ok", data };
  } catch (err) {
    console.log("error: ", err);
    return { status: "error" };
  }
};

module.exports = uploadFile_catbox;
