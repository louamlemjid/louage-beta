const express=require('express')
const router=express.Router()

router.get("/",function(req,res){
    res.render('qrCodeScanSortie')
})
router.post("/",async(req,res)=>{
    const qrCodeValue = req.body.qrCodeValue;
    // Handle the QR code value as needed
    console.log('Received QR code value:', qrCodeValue);
    const louage=await Louaje.findById({_id:qrCodeValue})
    console.log(louage._id)
    // [trajet1,trajet2]=louage.trajet.split("-")
    const stationInfo=await Station.findOne({email:req.session.email_station})
    const statusLouage=await updateOne({id:louage.id},{$set:{Status:"left"}})
    const result2=await Station.findOneAndUpdate(
        { name: stationInfo.name, "louages.destinationCity": louage.cityArrival },
        { $pull: { "louages.$.lougeIds": louage._id } },
        { new: true } 
    )
    console.log(result2)
    res.redirect("/qrCodeScanSortie")
})
module.exports = router