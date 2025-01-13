const FormData = require("form-data");
const fetch = require("node-fetch");
const fs = require("fs");

const { consoleWrite } = require("../others/helpers");

process.env.PRODUCTION === "prod" ? (console.log = consoleWrite) : "";

const cloudinaryBaseUrl = "https://api.cloudinary.com/v1_1/cld-docs";

const uploadFile_cloudinary = async ({ file, ogName }) => {
  const cloudinaryUploadUrl = `${cloudinaryBaseUrl}/auto/upload`;

  try {
    // fetching bearer token which will expire in 20 min
    // const bearer_token = await getAuthToken();

    // console.log("brearer token: ", bearer_token);

    // const fileBuffer = Buffer.from("Hello, this is a file buffer!");
    // const fileStream = bufferToStream(file, ogName);

    // const fileBuffer = fs.readFileSync(path)
    const formData = new FormData();
    formData.append("file", file, ogName);
    formData.append("api_key", process.env.CLOUDINARY_API_KEY);
    formData.append("upload_preset", process.env.UPLOAD_PRESET);

    const res = await fetch(cloudinaryUploadUrl, {
      method: "POST",
      headers: {
        // "content-type": "multipart/form-data",
      },
      body: formData,
    });
    const contentType = res.headers.get("content-type");
    if (res.ok) {
      if (!contentType || contentType.indexOf("application/json") === -1) {
        throw new Error(
          `not recieved json file and recieved this error: ${await res.text()}`,
        );
      }
      const data = await res.json();
      console.log("File uploaded successfully");

      return { status: "ok", data: data.url };
    } else {
      if (!contentType || contentType.indexOf("application/json") === -1) {
        throw new Error(
          `not recieved json file and recieved this ${await res.text()}`,
        );
      }

      const error = await res.json();

      console.error("Error uploading file:", error);

      return { status: "error" };
    }
  } catch (err) {
    console.error("Error uploading file:", err);

    return { status: "error" };
  }
};

module.exports = uploadFile_cloudinary;
