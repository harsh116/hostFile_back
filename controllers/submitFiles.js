const {
  mergeFile,
  getLast,
  getUploadHostFunction,
} = require("../others/helpers");

const { consoleWrite } = require("../others/helpers");
// console.log = process.env.PRODUCTION === "prod" ? consoleWrite : console.log;
process.env.ENVIRONMENT === "prod" ? (console.log = consoleWrite) : "";

const {
  fileLinksState,
  totalState,
  fileObjsState,
} = require("../others/states");
const fileLinks = fileLinksState.data;
const fileObjs = fileObjsState.data;

// fileObjs : [ [filePieceObj1,filePieceObj2], [filePieceObj1,filePieceObj2] ] : contains miltiple files, each file is array which consist of filePirceObj
// filePieceObj : {pos,isEnd,file,ogname,name,fileindex} : pos in position of filepiece, isEnd determines if all pieces of file are transferred or not
// ogname : original name , file : blob object :
// {
//   fieldname: 'file',
//   originalname: 'blob',
//   encoding: '7bit',
//   mimetype: 'application/octet-stream',
//   destination: 'uploads/',
//   filename: '8ca3b730b31ae895537ddb9b714afbc8',
//   path: 'uploads/8ca3b730b31ae895537ddb9b714afbc8',
//   size: 3915
// }
//
// name : filename(not ogname), fileindex : useful for multiple files, determining index of file incoming
const handleSubmitFiles = async (req, res) => {
  // const fD = req.body;

  try {
    // when every files work is finished then clearing up filelinks and fileObjs
    if (totalState.data == 0) {
      fileLinks.splice(0, fileLinks.length);
      fileObjs.splice(0, fileObjs.length);
    }

    const file = req.files["file"][0]; // Access the uploaded file
    console.log("typeof file: ", typeof file);
    const pos = req.body["pos"]; // Access 'pos' field
    const isEnd = req.body["isEnd"];
    const fileName = req.body["fileName"];
    totalState.setData(Number(req.body["total"]));
    const fileIndex = Number(req.body["fileIndex"]);
    const hostname = req.body["hostname"];

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
    // last piece of last file bcz so that next time when file batch comes
    // then for next pieces of first file 'isStart': true
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

      console.log("hostname:", hostname);
      const uploadFile = getUploadHostFunction(hostname);

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
