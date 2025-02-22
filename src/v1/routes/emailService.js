const express = require('express');
const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');
const options = require('../utils/dbConnectionOptions');
const collection_names = require('../settings/collection_names');
const status_codes = require('../utils/status_codes');

router = express.Router();


// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // user
        pass: process.env.EMAIL_PASS, // password
    },
    tls:{
        rejectUnauthorized: false
    }
});


// Register
// or
// change email
router.post("/register/:userID", async (req, res) => {
    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const dbName = process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME;
    const db = client.db(dbName);
    const collectionUsers = db.collection(collection_names.USER);

    //check if the user exists
    const userId = req.params.userID;
    const user = await collectionUsers.findOne({ _id: ObjectId(userId)})




    const emailServerVerification = await transporter.verify();
    if(emailServerVerification){
        //generate code
        let activationCode = [];
        for (let i=0; i< 6;i++){
            let number = Math.floor((Math.random() * 10));
            activationCode.push(number)
        }

        //add it to the users data so verification code could be confirmed later

        const query = {
            _id: ObjectId(userId)
        }

        const updatedUser = collectionUsers.findOneAndUpdate(query, { $set: { verificationCode: activationCode } });


        const message = '<h1> MakasApp Ailesine Hoşgeldiniz </h1>' +
            '<p>Bu gönderiyi email adresinizi doğrulamak için attık eğer bunun hakkında bir bilginiz yok ise gönderiyi görmezden gelebilirsiniz.</p>' +
            '<h3> Aktivasyon Kodunuz </h3>' +
            '<tr>' +
            '<td style="margin-left: 5px">' + activationCode[0].toString() + '</td>' +
            '<td style="margin-left: 5px">' + activationCode[1].toString() + '</td>' +
            '<td style="margin-left: 5px">' + activationCode[2].toString() + '</td>' +
            '<td style="margin-left: 5px">' + activationCode[3].toString() + '</td>' +
            '<td style="margin-left: 5px">' + activationCode[4].toString() + '</td>' +
            '<td style="margin-left: 5px">' + activationCode[5].toString() + '</td>' +
            '</tr>'


        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"NoReply MakasApp" <noreply@makasapp.com>', // sender address
            //to: req.body.address, // list of receivers test
            to: user.contact.email.address, // list of receivers
            subject: "Aktivasyon Kodu", // Subject line
            //text: "", // plain text body
            html: message, // html body
        },(error,info) => {
            if (error) res.send(error.message)
            else res.send(info)
        });

        /*console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        */
    }else{
        res.send("Problem in the email server")
    }


});

//Forgot my password
router.post("/password", async (req, res) => {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const dbName = process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME;
    const db = client.db(dbName);
    const collectionUsers = db.collection(collection_names.USER);

    //check if the user exists
    const address = req.body.address;
    const query = {
        $or: [
            {"contact.email.address": address},
            {"contact.phone.number": address},
        ],
    }

    const user = await collectionUsers.findOne(query);

    //console.log(user)

    if (user !== null){
        const userId = user._id;
        const emailServerVerification = await transporter.verify();
        if(emailServerVerification){

            //generate password
            let newPassword = '';
            for (let i=0; i< 12;i++){
                let number = Math.floor((Math.random() * 10));
                newPassword = newPassword + number.toString()
            }

            //User put (change password)

            // hash the password entered
            const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
            const new_password_hashed = await bcrypt.hash(newPassword, salt);

            const query = {
                _id: ObjectId(userId)
            }


            //console.log(newPassword);
            //console.log(new_password_hashed);

            bcrypt.compare(newPassword, new_password_hashed, function(error, result) {
                if(error) res.send(error.message);
                // Check the result
                if(result) {
                    collectionUsers.findOneAndUpdate(query, { $set: { password: new_password_hashed } })
                        .then(async (response) => {
                            if(response.value) {
                                const user = response.value;

                            }
                            else res.status(status_codes.BAD_REQUEST).send("User does not exist.");
                        })
                        .catch(error => res.status(status_codes.ERROR).send(error))
                        .finally(_ => client.close())
                }
                else {
                    res.status(status_codes.BAD_REQUEST).send("Password invalid");
                }
            })


            const message = '<h1> MakasApp Şifremi Unuttum </h1>' +
                '<p>Bu gönderiyi hesap kurtarımı için yeni şifre oluşturabilmek için attık eğer bunun hakkında bir bilginiz yok ise gönderiyi görmezden gelebilirsiniz.</p>' +
                '<h3> Yeni Şifreniz </h3>' +
                '<p>Yapmanız Gerekenler: </p>' +
                '<ul>' +
                '<li> Aşağıda oluşturulan yeni şifre ile email adresinizi kullanarak yeniden giriş yapmak.</li>' +
                '<li> Giriş yaptıktan sonra en sağdaki profilim sekmesine girerek, şifrenizi değiştirin. </li>' +
                '</ul>' +
                '<p>Yeni Şifreniz: ' + newPassword + '</p>'

            const user = await collectionUsers.findOne(query);

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"NoReply MakasApp" <noreply@makasapp.com>', // sender address
                to: req.body.address, // list of receivers
                subject: "Şifremi Unuttum", // Subject line
                //text: "", // plain text body
                html: message, // html body
            },(error,info) => {
                if (error) res.send(error.message)
                else res.send(info)
            });

            /*console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            */
        }else{
            res.send("Problem in the email server")
        }
    }else{
        res.send("The user does not exist")
    }


});

//new appointment request => BUSINESS
router.post("/appointment/:appointmentId", async (req, res) => {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const dbName = process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME;
    const db = client.db(dbName);
    const collectionAppointments = db.collection(collection_names.APPOINTMENT);
    const collectionUsers = db.collection(collection_names.USER);
    const collectionEmployee = db.collection(collection_names.EMPLOYEE);
    const collectionServices = db.collection(collection_names.SERVICE);
    const collectionBusiness = db.collection(collection_names.BUSINESS);
    const appointmentId = req.params.appointmentId;

    const appointment = await collectionAppointments.findOne({ _id: ObjectId(appointmentId)})
    const user = await collectionUsers.findOne({ _id: ObjectId(appointment.user)})
    const employee = await collectionEmployee.findOne({ _id: ObjectId(appointment.employees[0])})
    const service = await collectionServices.findOne({ _id: ObjectId(appointment.services[0])})
    const business = await collectionBusiness.findOne({ _id: ObjectId(appointment.business)})



    const emailServerVerification = await transporter.verify();
    if(emailServerVerification){

        var startDate = new Date(appointment.time.start)
        var endDate = new Date(appointment.time.end)

        const user_message = '<h4> Kullanıcı: ' + user.name +' </h4>' +
            '<p>Email:' + user.contact.email.address +' </p>' +
            '<p>Telefon:'+ user.contact.phone.number +'</p>'

        const message = '<h1> MakasBizz ile Yeni Randevunuz Var!</h1>' +
            '<p>'+ user.name +', ' + employee.name + ' adlı personelinizden ' + service.name +
            ' servisi için rezervasyon yaptırmak istiyor. </p>' +
            '<p>Saat: ' + startDate.toTimeString().split(" ")[0] + '-' + endDate.toTimeString().split(" ")[0] + ' </p>' +
            '<p>Tarih: ' + startDate.toLocaleDateString() + ' </p>' +
            '<h3> Kullanıcı Bilgileri </h3>' +
            user_message

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"NoReply MakasApp" <noreply@makasapp.com>', // sender address
            //to: req.body.address, // list of receivers for test
            to: business.contact.email, // list of receivers
            subject: "Yeni Randevu İsteği", // Subject line
            //text: "", // plain text body
            html: message, // html body
        },(error,info) => {
            if (error) res.send(error.message)
            else res.send(info)
        });

        /*console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        */
    }else{
        res.send("Problem in the email server")
    }

});

//appointment status changed => USER

router.put("/appointment/:appointmentId", async (req, res) => {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const dbName = process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME;
    const db = client.db(dbName);
    const collectionAppointments = db.collection(collection_names.APPOINTMENT);
    const collectionUsers = db.collection(collection_names.USER);
    const collectionEmployee = db.collection(collection_names.EMPLOYEE);
    const collectionServices = db.collection(collection_names.SERVICE);
    const collectionBusiness = db.collection(collection_names.BUSINESS);
    const appointmentId = req.params.appointmentId;

    const appointment = await collectionAppointments.findOne({ _id: ObjectId(appointmentId)})
    const user = await collectionUsers.findOne({ _id: ObjectId(appointment.user)})
    const employee = await collectionEmployee.findOne({ _id: ObjectId(appointment.employees[0])})
    const service = await collectionServices.findOne({ _id: ObjectId(appointment.services[0])})
    const business = await collectionBusiness.findOne({ _id: ObjectId(appointment.business)})



    const emailServerVerification = await transporter.verify();
    if(emailServerVerification){

        const appointmentStatus = (appointment.status === "pending") ? "Beklemede" : ((appointment.status === "canceled") ? "İptal" : "Kabul Edildi" )

        const message = '<h1> MakasApp ile Yeni Randevunuzun Durumu Değişti!</h1>' +
            '<p>'+ user.name +', ' + business.name + ' işletmesindeki ' + employee.name + ' adlı personelden ' + service.name +
            ' servisi için rezervasyon isteğiniz için randevu durumunuz değişti. </p>' +
            '<p>Yeni randevu durumunuz: ' + appointmentStatus  + '</p>'


        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"NoReply MakasApp" <noreply@makasapp.com>', // sender address
            //to: req.body.address, // list of receivers for test
            to: business.contact.email, // list of receivers
            subject: "Yeni Randevu İsteği", // Subject line
            //text: "", // plain text body
            html: message, // html body
        },(error,info) => {
            if (error) res.send(error.message)
            else res.send(info)
        });

        /*console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        */
    }else{
        res.send("Problem in the email server")
    }

});

//appointment finished
router.get("/appointment/:appointmentId", async (req, res) => {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const dbName = process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME;
    const db = client.db(dbName);
    const collectionAppointments = db.collection(collection_names.APPOINTMENT);
    const collectionUsers = db.collection(collection_names.USER);
    const collectionEmployee = db.collection(collection_names.EMPLOYEE);
    const collectionServices = db.collection(collection_names.SERVICE);
    const collectionBusiness = db.collection(collection_names.BUSINESS);
    const appointmentId = req.params.appointmentId;

    const appointment = await collectionAppointments.findOne({ _id: ObjectId(appointmentId)})
    const user = await collectionUsers.findOne({ _id: ObjectId(appointment.user)})
    const employee = await collectionEmployee.findOne({ _id: ObjectId(appointment.employees[0])})
    const service = await collectionServices.findOne({ _id: ObjectId(appointment.services[0])})
    const business = await collectionBusiness.findOne({ _id: ObjectId(appointment.business)})



    const emailServerVerification = await transporter.verify();
    if(emailServerVerification){


        const message = '<h1> MakasApp ile Randevunuz Bitti!</h1>' +
            '<p>'+ user.name +', ' + business.name + ' işletmesindeki ' + employee.name + ' adlı personelden ' + service.name +
            ' servisi için rezervasyonunuz gerçekleşti. Size daha iyi hizmet verebilmek için işletme ve personele vereceğiniz puanlamalara ihtiyacımız var. Lütfen randevunuzu değerlendirmeyi unutmayın</p>'

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"NoReply MakasApp" <noreply@makasapp.com>', // sender address
            //to: req.body.address, // list of receivers for test
            to: business.contact.email, // list of receivers
            subject: "Randevunuz Bitti!", // Subject line
            //text: "", // plain text body
            html: message, // html body
        },(error,info) => {
            if (error) res.send(error.message)
            else res.send(info)
        });

        /*console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        */
    }else{
        res.send("Problem in the email server")
    }

});

//offers
//newspaper
router.post("/offers", async (req, res) => {

    const emailServerVerification = await transporter.verify();
    if(emailServerVerification){

        const subject = req.body.subject;
        const message = req.body.code;


        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"NoReply MakasApp" <noreply@makasapp.com>', // sender address
            to: req.body.address, // list of receivers
            subject: subject, // Subject line
            html: message, // html body
        },(error,info) => {
            if (error) res.send(error.message)
            else res.send(info)
        });


    }else{
        res.send("Problem in the email server")
    }

});


module.exports = router;
