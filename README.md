# saucepan
Saucepan helps you to store your uploads.

## Installation
```
npm install --save saucepan
```
## Usage
```
let express = require('express');
let multer = require('multer');
let saucepan = require('saucepan');


let app = express();

var upload = multer();

app.post('/upload', upload.single('img'), (req, res) => {
  if(req.file){
    let options = {
      buffer:req.file.buffer,
    }
    
    saucepan(options).storeToLocal('public/images').then(function(result){
      return res.send(result);
    }).catch(function(err){
      console.log("Error");
    });	
  }
  
});

app.listen(8000);
```

#### options
```saucepan(options)``` will accept an object with following parameters


| Key | Description | Type |
| --- | --- | --- |
| buffer | Buffer representing the file to be stored | Buffer |
