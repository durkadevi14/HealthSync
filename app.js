const express = require('express');
const {Web3} = require('web3');
const fs = require("fs");
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname); 
  }
});
const upload = multer({ storage: storage });
//Set up view engine from ejs library
const app = express();
//Set up view engine
app.set('view engine', 'ejs');
//This line of code tells Express to serve static files (such as images, CSS, JavaScript files, or PDFs)
//from the public directory
app.use(express.static('public'))
//enable form processing
app.use(express.urlencoded({
    extended: false
}));

//start the server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// declare the global variables
var account = '';
var noOfHealths=0;
var loading= true;  
var addObj = null;
var addFunc = null;
var addEnabled = null;
var listOfHealths = [];   
 
// Define routes - home page
app.get('/', async(req, res) => {   
    console.log("home page");
    console.log(addFunc)
    console.log(noOfHealths);
    console.log(listOfHealths);
    try {
      //console.log(listOfHealths);
      res.render('index', {
            acct: account,
            cnt: noOfHealths,
            Healths: listOfHealths,
            status: loading,
            addObject : JSON.stringify(addObj),
            addFunction : addFunc,
            addStatus : addEnabled
      });
    } catch (error) {
        console.error('Error in home route:', error);
        res.status(500).send('Server error');
    }
});

app.post('/web3ConnectData', express.json(), async (req, res) => {
  try {
    const { HealthDataRead, contractAddress, acct, nHealths } = req.body;
    console.log(HealthDataRead);
    console.log(contractAddress);
    console.log(acct);
    console.log("web3ConnentData");
    //console.log(nHealths);
    noOfHealths = nHealths;
    account = acct;
    console.log(nHealths);
    listOfHealths = [];
    // Create a comprehensive Health  object with all related information
    for (let i = 0; i < nHealths; i++) {
      console.log(i);
      //console.log(HealthDataRead[i].HealthCount);
      //console.log(HealthDataRead[i].ownershipInfo);
      const HealthData = 
      {        
        id: i+1,
        HealthInfo : formatHealthInfo(HealthDataRead[i].HealthInfo),
        ownership: formatOwnershipInfo(HealthDataRead[i].ownershipInfo),
        vaccinations: formatVaccinationInfo(HealthDataRead[i].vaccinationInfo),
        training: formatTrainingInfo(HealthDataRead[i].trainingInfo),
      };
      listOfHealths.push(HealthData);
    }    //console.log(listOfHealths);
    loading = false;
    // Send response back to frontend
    res.json({
      success: true,
      data: listOfHealths,
      message: 'Health  data processed successfully'
    });
  } catch (error) {
      console.error('Error in web3ConnectData:', error);
      res.status(500).json({
          success: false,
          message: error.message
      });
  }
});

// Helper functions to format different types of data
function formatHealthInfo(HealthInfo) {
  //console.log(HealthInfo);
  return {
    id: HealthInfo[0],
    name: HealthInfo[1],
    dateOfBirth: HealthInfo[2],
    gender: HealthInfo[3],
    price: HealthInfo[4],
    status: HealthInfo[5],
    // Add any other Health -specific fields
  };
}

function formatOwnershipInfo(ownershipInfo) {
  return ownershipInfo.map(record => ({
    ownerId: record[0],
    ownerName: record[1],
    transferDate: record[2],
    phone: record[3],
    email: record[4],
    // Add any other ownership-specific fields
  }));
}

function formatVaccinationInfo(vaccinationInfo) {
  return vaccinationInfo.map(record => ({
    vaccineName: record[0],
    dateAdministered: record[1],
    doctorname: record[2],
    clinic: record[3],
    phone: record[4],
    email: record[5],
    // Add any other vaccination-specific fields
  }));
}

function formatTrainingInfo(trainingInfo) {
  return trainingInfo.map(record => ({
    trainingType: record[0],
    traninerName: record[1],
    organization: record[2],
    phone: record[3],
    trainingDate: record[4],
    progress: record[5],
    // Add any other training-specific fields
  }));
}

//In your Express app, add this new endpoint:
app.get('/loading-status', (req, res) => {
  res.json({ loading: loading });
});

app.get('/Health/:id', (req, res) => {
  try {
      const HealthId = req.params.id;
      //console.log("HealthId ");
      console.log(HealthId);
      console.log(listOfHealths);
      //console.log(listOfHealths);
      //console.log(listOfHealths.id.toString());
      console.log(HealthId.toString);
      // Find the index of the Health  based on HealthId
      const index = listOfHealths.findIndex(listOfHealths => 
                                   listOfHealths.id.toString() === HealthId.toString());
      console.log("get Health  information")
      console.log(index)
      console.log(listOfHealths[index]);
      if (index === -1) {
        console.log("Health  not found");
        return res.status(404).send("Health  not found");
      }
      res.render('Health', {acct: account, HealthData: listOfHealths[index], loading:false});
  }
  catch (error) {
      console.error('Error in Health  registration:', error); 
      res.status(500).send('Error finding Health ');
  }
});

// Define routes - to add the Health  using the path /addHealth 
app.get('/addHealth', (req, res) => {
  // call the addHealth .ejs file for the path /addHealth 
  res.render('addHealth', { acct: account} );   
});

// Define routes - to add the Health  using the path /addHealth  post method for the addHealth  form
app.post('/addHealth', upload.single('image'), async (req, res) => {
  try {
      // Extract data from request body
      const { HealthId, name, dob, gender, price } = req.body;
   
      // Handle image upload
      const image = req.file ? req.file.filename : null;
      
      // Validate required fields
      if (!HealthId || !name || !dob || !gender || !price) {
          return res.status(400).json({ 
              error: 'Missing required fields' 
          });
      }
      addFunc = "addHealthInfo";
      addEnabled = true;
      //addObj = [ HealthId, name, dob, gender, price ] ;
       addObj = {'HealthId': HealthId,  'name': name, 'dob': dob,
                  'gender': gender, 'price': price };
                  
      console.log(addObj);
      res.redirect('/');   
  } catch (error) {
    console.error('Error in Health  registration:', error);
    res.status(500).send('Error adding Health ');
  }
});

app.post('/setFunc', async (req, res) => {
  addEnabled = null;
  res.json({
    success: true,
     message: 'set data successfully'
  });
});

app.get('/addVaccination/:id', (req, res) => {
  const HealthId = req.params.id;
  res.render('addVaccination', { acct: account, HealthId : HealthId} ); 
});

app.post('/addVaccination', async (req, res) => {
  try {
      // Extract data from request body
      const { vaccineName, dateAdministered, doctorname, clinic, phone  , email, HealthId } = req.body;
      console.log([vaccineName, dateAdministered, doctorname, clinic, phone, email, HealthId]);
      
      // Validate required fields
      if (!HealthId || !vaccineName || !dateAdministered || !doctorname || !clinic || !phone || !email ) {
          return res.status(400).json({ 
              error: 'Missing required fields' 
          });
      }
      addFunc = "addVaccination";
      addEnabled = true;
 
      addObj = {'HealthId': HealthId,  'vaccine': vaccineName, 'dateOfVaccine': dateAdministered,
                  'doctor': doctorname, 'clinic': clinic, 'contact' : phone, 'emailId': email };
      res.redirect('/');   
  } catch (error) {
      console.error('Error in adding Health  vaccine information:', error);
      res.status(500).send('Error adding Health  vaccine');
  }
});

app.get('/addTraining/:id', (req, res) => {
  const HealthId = req.params.id;
  res.render('addTraining', { acct: account, HealthId : HealthId} ); 
});

app.post('/addTraining', async (req, res) => {
  try {
      // Extract data from request body
      const { trainingType, trainerName, organization, trainingDate, phone, progress, HealthId } = req.body;
      console.log([trainingType, trainerName, organization, trainingDate, phone, progress, HealthId]);
      // Validate required fields
      if (!HealthId || !trainerName || !organization || !trainingDate || !phone || !progress || !trainingType ) {
          return res.status(400).json({ 
              error: 'Missing required fields' 
          });
      }
      addFunc = "addTraining";
      addEnabled = true;
      addObj = {'HealthId': HealthId,  'name': trainerName, 'org': organization,
                  'trainingDate': trainingDate, 'contact': phone, 'progress': progress, 'trainingType': trainingType };
      res.redirect('/');     
  } catch (error) {
      console.error('Error in Health  training information:', error);
      res.status(500).send('Error adding Health  training');
  }
});

/*app.get('/addRecord/:id', (req, res) => {
  const HealthId = req.params.id;
  res.render('addOwner', { HealthId: HealthId }); 
});*/

app.get('/addOwner/:id', (req, res) => {
  const HealthId = req.params.id;
  console.log("Health ID:", HealthId);
  res.render('addOwner', { acct: account, HealthId: HealthId });
});


app.post('/addOwner', async (req, res) => {
  try {
      const { ownerId, name, transferDate, contact, emailId, HealthId } = req.body;
      console.log([ownerId, name, transferDate, contact, emailId, HealthId]);

      if (!HealthId || !name || !ownerId || !transferDate || !contact || !emailId) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      addFunc = "addOwner";
      addEnabled = true;
      addObj = { HealthId, name, ownerId, transferDate, contact, emailId };

      res.redirect('/');     
  } catch (error) {
      console.error('Error in Health  owner information:', error);
      res.status(500).send('Error adding Health  owner');
  }
});


app.post('/buyHealth/:id', (req, res) => {
  try {
  
      const  HealthId   = req.params.id;
      console.log("buyhealth");
      console.log(req.params.id);
      console.log(req.body);
      console.log(HealthId) 

      const {HealthCost} = req.body;

      console.log(HealthCost);
      if (!HealthId  || !HealthCost) {
        return res.status(400).json({ 
            error: 'Missing required fields' 
        });
      } 
      addFunc = "buyHealth";
      addEnabled = true;
      addObj = {'HealthId': HealthId, 'HealthCost': HealthCost};  
      res.redirect('/');  
  }catch (error) {
    console.error('Error in Health  id for buy Health :', error);
    res.status(500).send('Error buy Health  ');
  }
});
