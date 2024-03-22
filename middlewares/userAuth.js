const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user){
            
            return res.redirect('/')
        }
        else{
            next();
        }
    } catch (error) {
        console.error(error.message);
    }
}

const isLogout = async (req,res,next)=>{
    try {
        if(!req.session.user){
           return res.redirect('/login')
        }
        else{
            next()
        }
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}