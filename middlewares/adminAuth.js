


const isLogin = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            next();
        }
        else{
            return res.redirect('/admin');
        }
    } catch (error) {
        console.error(error.message);
    }
}


const isLogout = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
           return res.redirect('/admin/dashboard')
        }
        else{
            next();
        }
    } catch (error) {
        console.error(error.message);
    }
}


module.exports = {
    isLogin,
    isLogout
}