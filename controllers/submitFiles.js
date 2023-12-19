
const { mergeFile, getLast,getUploadHostFunction } = require("../others/helpers");

const { consoleWrite } = require("../others/helpers");
console.log = consoleWrite;

const {
  fileLinksState,
  totalState,
  fileObjsState,
} = require("../others/states");
const fileLinks = fileLinksState.data;
const fileObjs = fileObjsState.data;



const handleSubmitFiles = async (req, res) => {
  // const fD = req.body;

  try {
    if (totalState.data == 0) {
      fileLinks.splice(0, fileLinks.length);
    }

    const file = req.files["file"][0]; // Access the uploaded file
    const pos = req.body["pos"]; // Access 'pos' field
    const isEnd = req.body["isEnd"];
    const fileName = req.body["fileName"];
    totalState.setData(Number(req.body["total"]));
    const fileIndex = Number(req.body["fileIndex"]);
    const hostname=req.body['hostname']

    // determining if current piece is beginning or not
    let isStart = false;
    // const body=req.body
    // const file=req.file

    console.log("body: ", req.body);
    // console.log('body.data: ',.data)
    // console.log('body.pos: ',body.pos)
    console.log("file: ", file);
    // console.log('pos: ',pos)
    // console.log('isEnd: ',isEnd)
    // console.log('fileName: ',fileName)

    const filePieceObj = {
      pos,
      isEnd,
      file,
      ogName: fileName,
      name: file.filename,
      fileIndex,
    };

    // if array is empty or last of piece of last file 'isEnd' is true
    if (fileObjs.length == 0 || getLast(getLast(fileObjs)).isEnd === "true") {
      isStart = true;
    } else {
      isStart = false;
    }

    if (isStart) {
      fileObjs.push([filePieceObj]);
    } else {
      getLast(fileObjs).push(filePieceObj);
    }

    let message = "uploaded successfully";
    if (filePieceObj.isEnd === "true") {
      console.log("isEnd true ");
      const buffer = mergeFile();

      console.log('hostname:',hostname)
      const uploadFile=getUploadHostFunction(hostname)

      const resObj = await uploadFile({ file: buffer, ogName: fileName });
      // const resObj = await uploadFile_catbox({ file: buffer, ogName: fileName });
      // const resObj = await uploadFile_sdrive({ file: buffer, ogName: fileName });
      resObj["filename"] = fileName;
      fileLinks.push(resObj);

      console.log("fileLinks: ", fileLinks);
      console.log("total: ", totalState.data);
      console.log("fileIndex: ", fileIndex);

      // when all files are recieved here
      if (fileIndex === totalState.data - 1) {
        console.log("final end reached");
        message += " All files uploaded.";
        totalState.setData(0);

        res.json({ status: "ok", message, fileLinks, isCompleted: true });

        return;
      }
    }

    console.log("fileObjs: ", fileObjs);
    res.json({ status: "ok", message, isCompleted: false });
  } catch (err) {
    console.log("err: ", err);
    res.json({ status: "error" });
  }

  return;

  // const files = req.files;

  // // console.log("files: ", files);

  // const fileObjs = files.map((file) => {
  //   return {
  //     ogName: file.originalname,
  //     size: file.size,
  //     filename: file.filename,
  //   };
  // });
  // console.log("🚀 ~ file: app.js:86 ~ fileObjs ~ fileObjs:", fileObjs);

  // const resultObjs = [];
  // for (let fileObj of fileObjs) {
  //   const obj = await uploadFile(fileObj);
  //   if (obj.status == "error") {
  //     resultObjs.push({ status: error, filename: fileObj.ogName });
  //   } else {
  //     resultObjs.push({
  //       status: "ok",
  //       filename: fileObj.ogName,
  //       url: obj.data,
  //     });
  //   }
  //   // console.log("obj: ", obj);
  // }

  // res.json(resultObjs);
};

module.exports = handleSubmitFiles;
