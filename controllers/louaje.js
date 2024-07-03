const express=require('express')
const router=express.Router()
const Louaje=require('../models/louaje')
const QRCode = require('qrcode');

router.get("/",async(req,res)=>{
    var depart="";
    var arrivee="";
    var matrLeft="";
    var matrRight="";
    const louajeData = req.session.data || {};
    const  louajeLocation= louajeData.louajeLocation || null;
    console.log("get louaje",req.session.email_louage,louajeLocation);
    
    
    if(req.session.email_louage){
        if(louajeLocation){
            const adressUpdate=await Louaje.updateOne({email:req.session.email_louage.toLowerCase()},{$set:{adress:louajeLocation.latitude+"-"+louajeLocation.longitude}});
            console.log("latitude longitude update louaje",adressUpdate)
        }
        const result =await Louaje.findOne({email:req.session.email_louage.toLowerCase()});
        if(result!=null){
            depart=result.cityDeparture;
            arrivee=result.cityArrival;
            matrLeft=result.matricule.split("-")[0];
            matrRight=result.matricule.split("-")[2];
            
            console.log(result)
            
            QRCode.toDataURL(`${result.id}`, function (err, url) {
                res.render('louaje',{depart:depart,arrivee:arrivee,matrLeft:matrLeft,matrRight:matrRight,url:url,places:result.places[0],availableSeats:result.availableSeats});
            })
        }
    }
    
    
});
router.post('/',function(req,res){
    try{
        const email=req.session.email_louage;
    const clickedElement = req.body.clickedElement;
    const status=req.body.class;
    console.log("louaje :: status :",status)
    const nombrePlaces=req.body.nombrePlaces
    console.log("post louaje",clickedElement)
    console.log("post louaje, classname",req.body.class,nombrePlaces)
    switch (clickedElement){
        case "one":
            Louaje.updateOne({email:email},{$set:{"places.0.one":status,availableSeats:nombrePlaces}}).then(data=>{console.log(data)});
            break;
        case "two":
            Louaje.updateOne({email:email},{$set:{"places.0.two":status,availableSeats:nombrePlaces}}).then(data=>{console.log(data)});
            break;
        case "three":
            Louaje.updateOne({email:email},{$set:{"places.0.three":status,availableSeats:nombrePlaces}}).then(data=>{console.log(data)});
            break;
        case "four":
            Louaje.updateOne({email:email},{$set:{"places.0.four":status,availableSeats:nombrePlaces}}).then(data=>{console.log(data)});
            break;
        case "five":
            Louaje.updateOne({email:email},{$set:{"places.0.five":status,availableSeats:nombrePlaces}}).then(data=>{console.log(data)});
            break;
        case "six":
            Louaje.updateOne({email:email},{$set:{"places.0.six":status,availableSeats:nombrePlaces}}).then(data=>{console.log(data)});
            break;
        case "seven":
            Louaje.updateOne({email:email},{$set:{"places.0.seven":status,availableSeats:nombrePlaces}}).then(data=>{console.log(data)});
            break;
        case "eight":
            Louaje.updateOne({email:email},{$set:{"places.0.eight":status,availableSeats:nombrePlaces}}).then(data=>{console.log(data)});
            break;
    };
    // res.redirect("/louaje");
    res.redirect(`/louaje?message=${encodeURIComponent(clickedElement)}`);
    }catch(error){
        console.error("louage cannot change status error : ",error)
        res.redirect('/home')
    }
    
});

module.exports = router