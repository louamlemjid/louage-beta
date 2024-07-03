const mongoose= require('mongoose')

const louajeschema=new mongoose.Schema({
    name:String,
    lastName:String,
    email:String,
    password:String,
    model:String,//toyota..
    matricule:String,//240 Tunis 2039
    numeroTel:Number,
    places:[],
    availableSeats:Number,
    Status:String,//si les places sans occupé elle prend "left" sinon "filling"
    cityDeparture:String,
    cityArrival:String,
    trajet:String,//city1-city2
    adress:String
});
const Louaje=mongoose.model('Louaje',louajeschema);

module.exports = Louaje