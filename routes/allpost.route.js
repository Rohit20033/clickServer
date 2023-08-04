const express = require('express');
const {AllpostModel} = require('../models/Allpost.model');
const allpostRoute = express.Router();

allpostRoute.get("/", async (req, res)=>{
    try{
        let qur = req.query;
    
        const data = await AllpostModel.find(qur)
        .populate({path: "user_id", select:["name","email","image"]});
        console.log("data",data)
        res.send(data);
    }
    catch(err){
        console.log("Post-err",err);
    }
   
})

allpostRoute.post("/post", async (req, res)=>{
    const payload = req.body
    try{
        const new_data = await AllpostModel.insertMany(payload)
        res.send ({"message": "data has saved",new_data})
    }
    catch(err){
        console.log("err",err)
        res.send({"err": "Something went wrong"})
    }
})

allpostRoute.patch("/patch/:id", async (req, res)=>{
    let ids = req.params.id
     try {
         let posts = await AllpostModel.findOneAndUpdate({_id:ids},{
             ...req.body
         },{
             new:true
         })
        res.send("updated")
     } catch (error) {
          res.status(404).send(error.message)
     }
 })

allpostRoute.delete("/delete/:id" , async(req,res)=>{
    const ids = req.params.id
    const dataid = req.body.userID
    console.log("userid",dataid)
    const latest_todo = await AllpostModel.findById({_id:ids})
    console.log(latest_todo)
    if(dataid != latest_todo.userID){
        res.send("User not authorized")
    }
    else{
        await AllpostModel.findByIdAndDelete({_id:ids})
        res.send({"message": "Data Deleted"})
    }
})

module.exports = {allpostRoute}


// const userID = req.body.userID;
//   const productID = req.params.productID;
//   const product = await productmodel.findOne({ _id: productID });
//   if (userID !== product.userID) {
//     res.send("Not authorised");
//   } else {
//     await productmodel.findByIdAndDelete({ _id: productID });
//     res.send({ msg: "product deleted successfully" });
//   }
