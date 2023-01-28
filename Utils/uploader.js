var cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
module.exports.imageUpload = (image)=>{
    return new Promise(async(resolve , reject)=>{
        try{
            const res = await cloudinary.uploader.upload(image.path , {folder : "linkedLearning"})
            resolve(res)
        }catch(err){
            reject(err)
        }
    })
}