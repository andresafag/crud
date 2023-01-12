// GLOBAL VARIABLES ------------------------------------------------------------
const express = require('express'),
      path = require('path'),
      app = express(),
      bodyParser = require('body-parser'),
      PORT = process.env.port || 9001,
      characterModel = require('./db'),
      multer = require('multer'),
      fs = require('fs'),
      storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "public");
        },
        filename: (req, file, cb) => {
          const ext = file.mimetype.split("/")[1];
          cb(null, `files/${req.body.name}`);
        },
      }),
      upload = multer({
        storage:storage
      });


// SET THE TEMPLATE ENGINE
app.set('view engine', 'pug');

// MIDDLEWARE TO PARSE REQUESTS
app.use(bodyParser.urlencoded({extended:true}));

// RESOURCES ROUTE
app.use('/', express.static("public"));


// ROUTES --------------------------------------------------------------------------------

//  MAIN ROUTE
app.get('/', (req, res)=>{
  res.render('index')
  res.end()
})

// REQUEST TO DELETE CHARACTER
app.post('/del',  (req, res)=>{
  console.log(req.body.delName);
  // console.log(conn);
  characterModel.deleteOne({name:req.body.delName}, function(err){
    if(err) console.log(err);
    console.log("Successful deletion");
  })
  fs.unlink(`public/files/${req.body.delName}`, function (err) {
  if (err) throw err;
  console.log("\nDeleted file: test.txt");
});
  res.redirect('/')
})

// REQUEST TO CLEAR FIELDS
app.get('/clear', (req, res)=>{
  res.render('index', {nombre:'', ciudad:'', edad:'', profesion:'', imagen: ''})
  res.end()

})


//  ADD CHARACTER ROUTE
app.post('/character', upload.single('myFile'), async(req, res)=>{

  // fields in the post body should be greater than 0 to perform the character addition
  if (Object.keys(req.body).length > 0) {
    console.log("Hasta ahora todo bien");

    // assign request body and incoming fields
    try {
      const Character =  characterModel({
        name: req.body.name,
        city:req.body.city,
        age:req.body.age,
        profession:req.body.profession,
        fileName: req.file.filename
      })
      // save the character
      await Character.save()
      console.log("successfully added")
    } catch (error) {
      res.status(500).send("Could not be sent")
    } finally {
      console.log("Done successfully");
     }
    res.redirect('/')
  }

})

// UPDATE SAVED CHARACTER
app.put('/update',  (req, res)=>{
      var ciu = Object.keys(req.body)

      ciu.forEach((item, i) => {
    if (req.body[item] == 0) return
        console.log(item + ": " + req.body[item])
        characterModel.updateOne({name:req.body.nameToChange} , { $set: {[item]:req.body[item]}}, function(err, data){
        if(err) console.error(err);
        console.log("Successful update");
        console.log("This is the data coming in: ", data)
        })
      });
})

// CHARACTER EXTRACTION ROUTE
app.get('/api', async(req, res)=>{
  try {
    // search database
    const archivos = await characterModel.findOne({name: req.query.archivos})
    if (archivos) {
      console.log(archivos.fileName);
      // bring the backend character characteristics to the frontend
      res.render('index', {nombre:archivos.name, ciudad:archivos.city, edad:archivos.age, profesion:archivos.profession, imagen: archivos.fileName})
      res.end()
    } else {
      console.log("You haven't added that character");
      res.render('noCharacter')
    }
  } catch {
    console.log("No se pudo hacer");
    res.status(402).send("Something went wrong please go back and try again!")
  }
})



app.listen(PORT, (error)=>{
  if(error) console.error("This is the error: ",error)
   console.log("Hola como estas desde el servidor desde el puerto: ", PORT);
});
