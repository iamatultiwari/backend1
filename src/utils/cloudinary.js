//ham jo step follow kr rhe uspe aisa hai ki server tk to file aa chuki hai 
//ab yha se locallhost file path lena hai and upload kr dena hai
// ur agr succesfully file upload ho chuki hai then hame  hamare server se file remove b hi to krni hai  


//import {v2} from "cloudinary"
import {v2 as cloudinary } from "cloudinary"
import fs from "fs"


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
        // Click 'View API Keys' above to copy your API secret
    });
    
    const uploadOncloudinary = async(localfilepath) => {
        try {
            if(!localfilepath) 
                return null//if localfileapth not found
              const response = await cloudinary.uploader.upload(localfilepath,{ //here in place of loalfilepath we canalso pass the link of object for specifix
                    resource_type: "auto" //img,png ,jpg etc..
                })
                // file has been uploaded successfull
        console.log("file has been uploaded succesfully",response.url);
        return response;
            
        } catch (error) {
            fs.unlinkSync(localpath)//remove the locally saved temparary file as  the upload operation got failed
            return null;
        }
    }

    export{uploadOncloudinary}

//   Upload an image - as a temprary for understandong
//      const uploadResult = await cloudinary.v2.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            },
//            function(error,result) {console.log(result);}
