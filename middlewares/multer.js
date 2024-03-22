const multer = require('multer');
const uuid = require("uuid");
const path = require("path");




const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        
        cb(null, path.join(__dirname, '../public/productImage'));
    },
    
    filename: (req, file, cb) => {
      
        const name = Date.now() + ' - ' + file.originalname;
        cb(null, name);
        
    },
    
});

const upload = multer({

    storage: storage,
    
    fileFilter: (req, file, cb) => {
      
        cb(null, true);
        
    },
    
});








module.exports = {

  storage,
  upload

}