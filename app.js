const express =require("express");
const mongoose =require("mongoose");
const bodyparser=require("body-parser");
const session = require('express-session');
const requestIp = require('request-ip');
const axios = require('axios');
const { Console } = require("console");
const nodemailer=require('nodemailer');
const twilio=require("twilio");
const fs = require('fs/promises');
const createWriteStream=require('fs')
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const dotenv=require('dotenv').config()

//import collections
const Passenger=require('./models/passenger')
const Ticket=require('./models/ticket')
const Louaje=require('./models/louaje')
const Station=require('./models/station')

const apiKey= process.env.API_KEY; 
const client = new twilio("AC7d121df3e81f3f52919a346a81a322de", "b8a2b42c92dfa5ebbb66905d9b0e8f74");


const app=express();
const router=express.Router()
app.use(requestIp.mw());
app.set('view engine','ejs');




//require routers
const qrCodeScan=require(path.join(__dirname,'./controllers/qrCodeScan'))
const qrCodeScanSortie=require(path.join(__dirname,'./controllers/qrCodeScanSortie'))
const louaje=require(path.join(__dirname,'./controllers/louaje'))
const login=require(path.join(__dirname,'./controllers/login'))


app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
}));

app.use(express.static("public"));
//user routers
app.use("/qrCodeScan",qrCodeScan)
app.use("/qrCodeScanSortie",qrCodeScanSortie)
app.use("/louaje",louaje)
app.use("/login",login)
//git add 


mongoose.connect('mongodb+srv://louam-lemjid:8hAgfKf2ZDauLxoj@cluster0.mjqmopn.mongodb.net/Louajedb');

//function to send a welcome email to users
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'elmejidlouem@gmail.com',
      pass: 'qqpgrxjxqkhtjpyf',//generate a password from good in 6hours(req 20.10h 22 dec 2023)
    },
});
const sendEmail = async (toEmail, subject, text) => {
    try {
      // Define the email options
      const mailOptions = {
        from: 'elmejidlouem@gmail.com',
        to: toEmail,
        subject: subject,
        text: text,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
};
//function returns location in numeric format latitude and longitude in this format (lat,lon)
function adressToLocation(adresse){
    let [lati,long]=adresse.split("-");
    return [Number(lati),Number(long)];
}

//function returns the day
function today(){
    let date=new Date();
    date.setDate(date.getDate());
    let day=date.getDate();
    let month=date.getMonth()+1;
    let year=date.getFullYear();
    let today=month+"/"+day+"/"+year;
    return today
}

//retuen the list of free seats from the places array
function getFreeSeatsList(listSeats){
    const listFreeSeats=[];
    for(const key in listSeats){
        if(listSeats[key]=="free"){
            listFreeSeats.push(key);
        }
    }
    return listFreeSeats;
}
//return the object after modifying the keys given for the list
function modifyObject(freeSeastList,listSeats){
    const newObject={};
    for(const key in listSeats){
        if(freeSeastList.includes(key)){
            newObject[key]="occ";
        }else{
            newObject[key]=listSeats[key];
        }
    }
    return newObject;
}
// function convertToDigit(nombre){
//     switch(nombre){
//         case "one":
//             return 0;
//         case "two":
//             return 1;
//         case "three":
//             return 2;
//         case "four":
//             return 3;
//         case "five":
//             return 4;
//         case "six":
//             return 5;
//         case "seven":
//             return 6;
//         case "eight":
//             return 7;
//         default:
//             return null;
//     }
// }
//update the reserved seats to "occ"
// async function reserve(collection,freeSeatsList,passengersNumber,louageId){
//     const len=freeSeatsList.length;
//     for(let i=0;i<passengersNumber;i++){
//         var updateCollection=await collection.updateOne({id:louageId},{$set:{`places.${convertToDigit(freeSeatsList[i])}.${freeSeatsList[i]}`:"occ"}})
//     }
// }
// generate a 6 digit
function generateNumber() {
    // Generate a random number between 100,000 and 999,999
    const randomSixDigitNumber = Math.floor(Math.random() * 900000) + 100000;
    
    return randomSixDigitNumber;
}

//calculate distance
function haversineDistance(lat1, lon1, lat2, lon2) {
    // Convert latitude and longitude from degrees to radians
    const degToRad = (degrees) => degrees * (Math.PI / 180);
    const radLat1 = degToRad(lat1);
    const radLon1 = degToRad(lon1);
    const radLat2 = degToRad(lat2);
    const radLon2 = degToRad(lon2);
  
    // Calculate the differences between latitudes and longitudes
    const dLat = radLat2 - radLat1;
    const dLon = radLon2 - radLon1;
  
    // Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(radLat1) * Math.cos(radLat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    // Radius of the Earth in kilometers (mean value)
    const earthRadius = 6371;
  
    // Calculate the distance
    const distance = earthRadius * c;
  
    return distance;
}

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async function () {
  console.log('Connected to the database');

    
    
    try {
        app.get(['/home','/'],(req,res)=>{
            try{
                res.render("home")
            }catch(error){
                console.error("home error",error)
                res.redirect('/home')
            }
        })
        app.get("/menu",(req,res)=>{
            try{
                res.render("menu")
            }catch(error){
                console.error("menu error",error)
                res.send('get menu error',error)
            }
        })
        app.post("/ajoutDestination",async(req,res)=>{
            const addDestination=await Station.updateOne({email:req.session.email_station},{$push:{louages:{destinationCity:req.body.city,tarif:req.body.tarif}}})
            console.log(addDestination)
            res.redirect("/adminStation")
        })
        app.get('/adminStation',function(req,res){
            res.render("adminStation")
        })
        
        app.post("/signup",function(req,res){
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
            var firstName=req.body.newItem;
            var lastName=req.body.newItem1;
            var email=req.body.newItem2;
            var trajet1=req.body.newItem3;
            var trajet2=req.body.newItem4;
            var numeroTel=req.body.newItem5;
            var password=req.body.password;
            var matricule=req.body.matrLeft+"-Tunis-"+req.body.matrRight
            Louaje.updateOne({email:email.toLowerCase()},{$set:{places:[defaultPlaces],password:password,matricule:matricule,availableSeats:8,name:firstName,lastName:lastName,email:email.toLowerCase(),numeroTel:numeroTel,cityDeparture:trajet1,cityArrival:trajet2}},{upsert:true}).then(data=>{console.log("louaje signup : ",data)});
            res.redirect("/login")
        })
        
        app.post('/signuppassage',function(req,res){
            var firstName=req.body.newItem;
            var lastName=req.body.newItem1;
            var email=req.body.newItem2;
            var numeroTel=req.body.newItem5;
            var password=req.body.password;
            console.log(typeof(numeroTel))
            //send a text mesaage to the user's phone as a welcome note
            client.messages
                .create({
                    body: `ahla b'${firstName} l'behy aya mar7be bik fl app LouajeEpress .. hatha sms b3atht'houlik ml node js nista3ml fi package ismou twilio 3:)`,
                    from: "+16179103444",
                    to: "+216"+numeroTel
                })
                .then((message) => console.log(`Message SID: ${message.sid}`))
                .catch((error) => console.error(`Error: ${error.message}`));
            //send an email when a new user signs up
            const toEmail=email.toLowerCase();
            const subject="Welcome to LouajeExpress - Your Journey Begins Here!";
            const text=`Dear ${firstName},
            Welcome to LouajeExpress! We are thrilled to have you on board, and we're excited to embark on this journey together. Thank you for choosing LouajeExpress as your preferred app .. your gateway to a seamless and efficient experience.
            At LouajeExpress, our mission is to make your life easier and more convenient. Whether you're looking to streamline your daily tasks, access premium services, or discover new opportunities, we've got you covered.
            Here's what you can expect from LouajeExpress:
            1. **User-Friendly Interface:** Our app is designed with simplicity in mind. Navigate effortlessly and explore the features tailored to enhance your experience.
            2. **Efficient Services:** From quick transactions to reliable deliveries, LouajeExpress is committed to providing services that save you time and effort.
            3. **Exclusive Offers:** Keep an eye out for special promotions and discounts crafted just for you. We believe in rewarding our valued users.
            To get started, simply log in with your credentials and start exploring the diverse features LouajeExpress has to offer. If you have any questions or need assistance, our support team is here for you. Feel free to reach out at [elmejidlouem@gmail.com] .. we're always happy to help.
            Once again, welcome to LouajeExpress! We look forward to being a part of your journey and making each interaction with our app a delightful experience.

            Best regards,

            [Louam Lemjid]
            [CEO]
            L9itLouage Team`;
            // sendEmail(toEmail, subject, text);
            // console.log('Email sent successfully 3:)');
            //session for passengers
            req.session.email_user=email;
            Passenger.updateOne({email:email.toLowerCase()},{$set:{name:firstName,lastName:lastName,email:email.toLowerCase(),numeroTel:numeroTel,password:password,points:0}},{upsert:true}).then(data=>{
                console.log("passenger signup : ",data)
            })
            res.redirect("/signInPassenger");
        })
        app.post("/signInPassenger",function(req,res){
            req.session.email_user=req.body.email.toLowerCase();
            const password=req.body.password;
            const clientIp = req.clientIp;
            console.log(clientIp)
            Passenger.findOne({email:req.session.email_user.toLowerCase()}).then(data=>{
                if(data!=null){
                    if(data.password==password){
                    Passenger.updateOne({email:req.session.email_user.toLowerCase()},{ $inc: { points: 15 } }).then(added=>{console.log(added)})
                    res.redirect(`/iteraire`)
                }}else{res.redirect(`/signInPassenger`)}
                
            })
        })
        app.post("/station",async (req,res)=>{
            const departure=req.body.city1;
            const destination=req.body.city;
            const passengers=req.body.numberOfPassengers
            
            console.log(departure,destination,passengers)

            const sessionData = req.session.data || {};

            //local ip
            const clientIp = req.clientIp;
            
            //public ip
            // const response= await axios.get('https://ipinfo.io/json');
            // const publicIp=response.data.ip;
            // console.log(response.data)
            // const secondResponse=await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${publicIp}`);
            // //data
            // const latitude=secondResponse.data.latitude;
            // const longitude=secondResponse.data.longitude;
            
            sessionData.passengerInfo={
                departure:departure,
                destination:destination,
                passengers:passengers
            }
            //update the session's data
            req.session.data = sessionData;
            console.log("form data: ",sessionData)
            res.redirect("/station")
        })
        app.post('/location',async(req,res)=>{
            const sessionData = req.session.data || {};
            
            const latitude=req.body.latitude;
            const longitude=req.body.longitude;
            
            sessionData.passengerLocation={
                latitude:latitude,
                longitude:longitude
            }
            req.session.data = sessionData;
            console.log("location data: ",sessionData)
            res.redirect('/station')
        })
        app.post('/locationLouaje',async(req,res)=>{
            const louajeData = req.session.data || {};
            
            const latitude=req.body.latitude;
            const longitude=req.body.longitude;
            
            louajeData.louajeLocation={
                latitude:latitude,
                longitude:longitude
            }
            req.session.data = louajeData;
            console.log("location  louaje data: ",louajeData)
            res.redirect('/louaje')
        })
        app.post("/buyticket/:id",async(req,res)=>{
            const ticketData= req.session.data || {};
            const idlouage=req.params.id;
            const idstation=req.body.station;
            const passengers=req.body.passengers;
            const idpassenger=await Passenger.findOne({email:req.session.email_user.toLowerCase()},{_id:1})
            const result=await Ticket.insertMany([{dateOfReservation:today(),idP:`${idpassenger.id}`,idS:`${idstation}`,idL:`${idlouage}`}])
            ticketData.ticketInfo={
                idlouage:idlouage,
                idticket:result[0].id,
                idstation:idstation,
                passengers:passengers
            }
            console.log(passengers)
            req.session.data=ticketData;
            const placesList=await Louaje.find({_id:idlouage})
            const reserve=await Louaje.updateOne({email:placesList[0].email},{$set:{places:[modifyObject(getFreeSeatsList(placesList[0].places[0]).slice(0,passengers),placesList[0].places[0])],availableSeats:placesList[0].availableSeats-passengers}})
            console.log(reserve)
            console.log(modifyObject(getFreeSeatsList(placesList[0].places[0]).slice(0,passengers),placesList[0].places[0]))
            // console.log(placesList.places[0])
            // console.log(`the free keys are : ${getFreeSeatsList(placesList.places[0])}`)
            // console.log(modifyObject(getFreeSeatsList(placesList.places[0]).slice(0,1),placesList.places[0]))
            res.redirect('/download-pdf');
        })
        app.get('/download-pdf', async (req, res) => {
            const ticketData = req.session.data || {};
            const ticketInfo= ticketData.ticketInfo || null;
            // Customize the content of the PDF
            const title = ticketInfo.idticket;
            const price = '10DT';
            const date = new Date();
            const currentDate=date.toLocaleString('en-US', { timeZone: 'UTC', hour12: false }).replace(/,/g, '');
            const stationId = ticketInfo.idstation;
            const louageId = ticketInfo.idlouage;
            const passengers=ticketInfo.passengers;
            // var urlQr;
            QRCode.toDataURL(`ticketId: ${title}, louageId : ${louageId}, stationId : ${stationId}, date : ${currentDate}, prix : ${price}`, function (err, url) {
                // Create a new PDF document
                const doc = new PDFDocument();
                // Set the response headers for a PDF download
                res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');
                res.setHeader('Content-Type', 'application/pdf');
                const imagePath = path.join(__dirname, 'public', 'ticket.jpg');
                doc.image(imagePath, 25, 0, {scale: 0.22});
                
                doc.fontSize(22).text(title, 240, 445);
                doc.fontSize(20).text(stationId, 240, 498);
                doc.fontSize(20).text(louageId, 240, 552);
                doc.fontSize(20).text(currentDate, 240, 596);
                doc.fontSize(20).text(price, 240, 645);
                doc.fontSize(20).fillColor("red").text(passengers,350,692);
                //add the qrcode
                doc.image(url, 500, 690,{fit: [100, 100]});
                // Pipe the PDF to the response stream
                doc.pipe(res);
                doc.end();
            }) 
          });
        // app.get("/pdf",async (req, res) => {
        //     // Create a new PDF document
            
        //     const title = "alloha";
        //     const price = '10DT';
        //     const date = new Date();
        //     const currentDate=date.toLocaleString('en-US', { timeZone: 'UTC', hour12: false }).replace(/,/g, '');
        //     const stationId = "8883";
        //     const louageId = "002";

            
            
        //     QRCode.toDataURL(`ticketId: ${title}, louageId : ${louageId}, stationId : ${stationId}, date : ${currentDate}`, function (err, url) {
        //         var doc = new PDFDocument();

        //         // Set the response headers for a PDF download
        //         res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');
        //         res.setHeader('Content-Type', 'application/pdf');
        //         const imagePath = path.join(__dirname, 'public', 'ticket.jpg');
        //         doc.image(imagePath, 25, 0, {scale: 0.22});
        //         doc.fontSize(22).text(title, 240, 445);
        //         doc.fontSize(20).text(stationId, 240, 498);
        //         doc.fontSize(20).text(louageId, 240, 552);
        //         doc.fontSize(20).text(currentDate, 240, 596);
        //         doc.fontSize(20).text(price, 240, 645);
        //         doc.fontSize(20).fillColor("red").text(3,350,692);
        //         doc.image(url, 500, 690,{fit: [100, 100]});
        //         doc.pipe(res);
        //         doc.end();
        //     })
            

        //     // Pipe the PDF to the response stream
            
        // })
        app.get("/station",async(req,res)=>{
            try{
                const sessionData = req.session.data || {};
                const passengerInfo = sessionData.passengerInfo || null;
                const passengerLocation= sessionData.passengerLocation || null;
                if(passengerInfo){
                    const result=await Station.find({city:passengerInfo.departure},{louages:{$elemMatch: {destinationCity:"tunis"}}})
                    console.log(`le resultat est   ${result[0].louages[0].lougeIds}`)
                    const result2=await Louaje.find({ _id: { $in: result[0].louages[0].lougeIds},availableSeats: { $gte: passengerInfo.passengers }})
                    console.log(result2)
                    res.render("station",{
                        louajes:result2,
                        station:result[0].id,
                        passengers:passengerInfo.passengers
                    })
                }  
                else{res.render("station")}
            }catch(error){
                console.error("error fetching the station and the louage",error)
                req.session.errorMessage=`Pas de station avec ce nom`
                res.redirect('/errorPage')
                
            }
            // if(passengerInfo){
            //     // Station.find({city:passengerInfo.departure}).then(result=>{
            //     //     console.log(result)
            //     //     console.log("station data",passengerInfo);
            //     //     res.render("station",{louajes:result[0].louages})
            //     // })
                
            //     // Passenger.updateOne({email:req.session.email_user},{$set:{adress:passengerLocation.latitude+"-"+passengerLocation.longitude}}).then(adressUpdate=>{console.log("latitude longitude update",adressUpdate)})
            //     // Station.find({city:"kelibia"}).then(sta=>{
            //     //     var [latiStation,longStation]=adressToLocation(sta[0].adress);
            //     //     console.log(`${haversineDistance(latiStation,longStation,Number(passengerLocation.latitude),Number(passengerLocation.longitude))} km`)
            //     // })
            //     res.render("station",{
            //         departure:passengerInfo.departure,
            //         destination:passengerInfo.destination,
            //         passengers:passengerInfo.passengers,
            //         latitude:passengerLocation.latitude,
            //         longitude:passengerLocation.longitude
            //     })
            // }
            // else{
            //     res.render("station")
            // }
        })
        app.get('/errorPage',(req,res)=>{
            res.render("errorPage",{errorMessage:req.session.errorMessage})
            
        })
        app.get("/iteraire",function(req,res){
            req.session.errorMessage="";
            res.render("iteraire");
        })

        app.get("/signInPassenger",function(req,res){
            res.render("signin");
        })
        app.get("/signuppassenger",function(req,res){
            res.render("passage",{email:req.session.email_user});
        })
        
        
        // app.post("/signupstation",async(req,res)=>{
            // res.redirect("/adminStation")
        // })
        //signup station
        app.get("/signupstation",(req,res)=>{
            res.render("signupstation")
        })
        app.post("/signupstation",async(req,res)=>{
            const name=req.body.name;
            const city=req.body.city;
            const email=req.body.email;
            const tel=Number(req.body.tel);
            const password=req.body.password;
            const createStation=await Station.insertMany([{
                name:name,
                city:city,
                email:email.toLowerCase(),
                tel:tel,
                password:password
            }])
            res.redirect("/menu")
        })
        app.get("/signinstation",(req,res)=>{
            res.render("signinstation")
        })
        app.post("/signinstation",async(req,res)=>{
            const email=req.body.email;
            const password=req.body.password;
            const signIn=await Station.findOne({email:email.toLowerCase()});
            if(signIn!=null){
                if(signIn.password==password){
                    req.session.email_station=email.toLowerCase();
                    res.redirect("/menustation");
                }
            }
            else{res.redirect("/signinstation");}
        })
        app.get("/generalLogin",(req,res)=>{
            res.render("generalLogin")
        })
        app.get("/generalSignup",(req,res)=>{
            res.render("generalSignup")
        })
        app.get("/signinstation",(req,res)=>{
            res.render("signinstation")
        })
        //render the menu of the station
        app.get("/menustation",(req,res)=>{
            res.render("menustation")
        })
        //signup louage
        app.get('/signup',function(req,res){
            res.render("signup");
        })
        //signin louage
        
        app.get("/search",function(req,res){
            res.render("search");
        });
    } catch (err) {
        console.error(err);
        res.redirect('/home')
    }
});


app.listen(process.env.PORT || 3004, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });