const fetch = require("node-fetch");
const fs = require("fs");
const querystring = require("querystring");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");

// const { Readable } = require("stream");

const { consoleWrite } = require("../others/helpers");
const { NEXTCLOUD_UPLOAD_DIRECTORY } = require("../constants");
const { URLSearchParams } = require("url");
const uploadFile_cloudinary = require("./cloudinary");

process.env.PRODUCTION === "prod" ? (console.log = consoleWrite) : "";

const nextcloudBaseUrl = process.env.NEXTCLOUD_BASE_URL;

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

// basic auth token
const getAuthToken = () => {
    const email = process.env.NEXTCLOUD_EMAIL;
    const password = process.env.NEXTCLOUD_PASSWORD;

    const token = btoa(`${email}:${password}`);

    console.log("basic toke: ", token);

    return token;
};

const createSharableLink = async (path) => {
    const nextcloudCreateSharableUrl = `${nextcloudBaseUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares`;

    // querystring.stringify(data);

    const requestBody = querystring.stringify({
        path,
        shareType: 3,
    });

    console.log("reqbody: ", requestBody);

    const basic_token = getAuthToken();

    try {
        const res = await fetch(nextcloudCreateSharableUrl, {
            method: "POST",
            headers: {
                "OCS-APIRequest": "true",
                "content-type": "application/x-www-form-urlencoded",
                authorization: `Basic ${basic_token}`,
            },
            body: requestBody,
        });

        const contentType = res.headers.get("content-type");
        if (res.ok) {
            if (!contentType || contentType.indexOf("xml") === -1) {
                throw new Error(
                    `not recieved xml file and recieved this error: ${await res.text()}`,
                );
            }

            const parser = new XMLParser();
            const data = parser.parse(await res.text());

            if (data.ocs.meta.status === "ok") {
                const file_token = data.ocs.data.token;
                return file_token;
            } else {
                console.log("ocs status not ok, ", data);
                return null;
            }
        } else {
            if (!contentType || contentType.indexOf("application/json") === -1) {
                throw new Error(
                    `not recieved json file and recieved this error: ${await res.text()}`,
                );
            }
            console.log("message: ", await res.text());
            return null;
        }
    } catch (err) {
        console.error("error: ", err);
        return null;
    }
};

const uploadFile_nextcloud = async ({ file, ogName }) => {
    // file will be stored in Uploads folder
    const encodedUsername = encodeURIComponent(process.env.NEXTCLOUD_USERNAME);
    const encodedFileName = encodeURIComponent(ogName);
    const encodedUploadDirectory = encodeURIComponent(NEXTCLOUD_UPLOAD_DIRECTORY);
    const encodedRemoteFilePath = encodeURIComponent(
        `/${NEXTCLOUD_UPLOAD_DIRECTORY}/${ogName}`,
    );
    // const queryString = `filename=${encodedRemoteFilePath}`;
    const nextcloudUploadUrl = `${nextcloudBaseUrl}/remote.php/dav/files/${encodedUsername}/${encodedUploadDirectory}/${encodedFileName}`;

    // const sharable_link = `https://${process.env.SIRV_USERNAME}.sirv.com/${encodedUploadDirectory}/${encodedFileName}`;

    try {
        // fetching bearer token which will expire in 20 min
        const basic_token = getAuthToken();

        // console.log("brearer token: ", bearer_token);

        // const fileBuffer = Buffer.from("Hello, this is a file buffer!");
        // const fileStream = bufferToStream(file, ogName);

        console.log("nextcloudUploadUrl: ", nextcloudUploadUrl);

        const res = await fetch(nextcloudUploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/octet-stream",
                authorization: `Basic ${basic_token}`,
            },
            body: file,
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

            const file_token = await createSharableLink(
                `/${NEXTCLOUD_UPLOAD_DIRECTORY}/${ogName}`,
            );
            const sharable_link = `https://nch.pl/s/${file_token}/download/${encodedFileName}`;

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

module.exports = uploadFile_nextcloud;
