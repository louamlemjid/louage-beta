const express=require('express')
const router=express.Router()

router.get("/",function(req,res){
    res.render('qrCodeScan')
    
})
router.post("/",async(req,res)=>{
    const qrCodeValue = req.body.qrCodeValue;
    // Handle the QR code value as needed
    console.log('Received QR code value:', qrCodeValue);
    const louage=await Louaje.findById({_id:qrCodeValue})
    console.log(louage._id)
    // [trajet1,trajet2]=louage.trajet.split("-")
    const defaultPlaces = {
        one: 'free',
        two: 'free',
        three: 'free',
        four: 'free',
        five: 'free',
        six: 'free',
        seven: 'free',
        eight: 'free',
        };

    const stationInfo=await Station.findOne({email:req.session.email_station})
    const statusLouage=await Louaje.updateOne({id:louage.id},{$set:{places:defaultPlaces,Status:"filling",cityDeparture:stationInfo.city,cityArrival:louage.cityDeparture}})
    const result2=await Station.findOneAndUpdate(
        { name: stationInfo.name, "louages.destinationCity": louage.cityDeparture },
        { $addToSet: { "louages.$.lougeIds": louage._id } },
        { new: true } 
    )
    console.log(result2)
    
    res.redirect("/qrCodeScan")
})
module.exports = router