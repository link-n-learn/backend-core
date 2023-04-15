var cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports.deleteImage = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      const parts = url.split("/"); // Split the URL by "/"
      const extractedString =
        parts[parts.length - 2] +
        "/" +
        parts[parts.length - 1].replace(/\.[^/.]+$/, ""); // Extract the desired portion from the array and remove file extension
      console.log(extractedString);
      const res = await cloudinary.uploader.destroy(extractedString);
      console.log(res);
      resolve(res);
    } catch (err) {
      reject(err);
    }
  });
};
module.exports.imageUpload = (image) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Going");
      const res = await cloudinary.uploader.upload(image.filepath, {
        folder: "linkedLearning",
      });
      resolve(res);
    } catch (err) {
      reject(err);
    }
  });
};
