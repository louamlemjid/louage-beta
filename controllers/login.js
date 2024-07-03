const express =require('express')
const router=express.Router()
const Louaje=require('../models/louaje')

router.post("/",function(req,res){
    console.log(req.body)
    req.session.email_louage=req.body.email.toLowerCase();
    const password=req.body.password;
    Louaje.find({email:req.session.email_louage.toLowerCase()}).then(data=>{
        
        if(data[0].password==password){
            res.redirect(`/louaje`)
        }
        
    })
})
router.get("/",function(req,res){
    res.render("login");
})
module.exports = router