//ham jo step follow kr rhe uspe aisa hai ki server tk to file aa chuki hai 
//ab yha se locallhost file path lena hai and upload kr dena hai
// ur agr succesfully file upload ho chuki hai then hame  hamare server se file remove b hi to krni hai  


//import {v2} from "cloudinary"
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOncloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully:", response.url);
    return response;
    fs.unlinkSync(localfilepath);//unlink -delete if file uploaded succesfully
  } catch (error) {
      console.log("Cloudinary Upload Error:", error);
    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    }
    return null;
  }
};

export { uploadOncloudinary };


//   Upload an image - as a temprary for understandong
//      const uploadResult = await cloudinary.v2.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            },
//            function(error,result) {console.log(result);}
