
const asynchandler=(requesthandler)=>{
    return(req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next))
        .catch((err)=>{
            err.statuscode=err.statuscode,
            err.message=err.message||"Internal server error";
            next(err);
        });
    } ;

};
export default asynchandler;