const user = require('../models/userModel')

const checkBlockUser = async(req,res,next)=>{
    try {

        if(req.session.user){
            const currentStatus = req.session.user._id;
            const userDB = await user.findOne({_id:currentStatus})
            
            if(userDB.is_blocked==true){
                console.log('reached if');
                req.session.destroy();
                return res.redirect('/')
            }
            else{
                console.log('working else 2');
                next();
            }
        }
        else{
            console.log('working else 1');
            next();
        }
        
        
    } catch (error) {
        console.error(error.message);
    }
}



module.exports = {
    checkBlockUser,

}