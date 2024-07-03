const mongoose=require('mongoose')

const ticketschema= new mongoose.Schema({
    dateOfReservation:Date,
    price:Number,
    travel:String,
    idP:String,
    idL:String,
    idS:String
})
const Ticket=mongoose.model('Ticket',ticketschema);

module.exports = Ticket