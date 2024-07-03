const mongoose=require('mongoose')



const passengerschema=new mongoose.Schema({
    name:String,
    lastName:String,
    email:String,
    numeroTel:Number,
    password:String,
    adress:String,//latitude and longitude
    points:Number
});
const Passenger=mongoose.model('Passenger',passengerschema);

module.exports = Passenger