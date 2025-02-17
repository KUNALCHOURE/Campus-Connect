import app from './app.js';
import connectdb from './db/index.js';

connectdb()
.then(()=>{
    
    app.listen(3000,()=>{
        console.log("app is listening");
    })
   

})
.catch((e)=>{
    console.log("Error Occured:",e);

})


