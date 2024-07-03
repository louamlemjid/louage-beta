const mongoose = require('mongoose')
const stationschema=new mongoose.Schema({
    name:String,
    password:String,
    email:String,
    tel:Number,
    city:String,
    adress:String,//latitude and longitude
    louages:[
        {
            destinationCity:String,
            lougeIds:[],
            tarif:Number
        }
    ],
    date:Date,
    countLouaje:Number//nombres des louajes dans la stations
});
const Station=mongoose.model('Station',stationschema);

module.exports = Station