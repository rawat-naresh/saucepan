# saucepan
saucepan helps you to store your uploads.

[![npm](https://img.shields.io/npm/v/saucepan.svg)](https://github.com/rawat-naresh/saucepan)

## Installation

```
npm install --save saucepan
```
## Creating an instance 
```
let saucepan = require('saucepan');
let instance = saucepan(options);
```
#### options
```saucepan(options)``` accepts an object with following parameters

| Key | Description | Type | optional |
| ------ | ------ | ------ | ----------------------------- |
| buffer | Buffer representing the file | Buffer |false |
| original | Set to false if you don't want to store the original image | Boolean | true defaults:true |
| sizes | Represents the sizes of the image. ```sizes``` is an array of objects having two keys ```path``` and ```xy```. ```path``` is a string that will be concatnated to the resized images and ```xy``` indicated the height and width of the image. | Array | true |




## Usage
#### Storing to server directory

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

method ```storeToLocal(path) ``` accepts a path in the server directory. If the path doesn't exists it'll throw an error.

#### Storing to S3 bucket

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
    
  let s3Options = {
    bucket:"BUCKET-NAME",
    accessKeyId:"ACCESSKEYID",
    secretAccessKey:"SECRETACCESSKEY",
  };
  saucepan(options).storeToS3(s3Options).then(function(results){
    console.log(results);
  }).catch(function(err){
    console.log(err)
  });
 }
  
});

app.listen(8000);
```
#### options
method ```storeToS3(S3options)``` will accept an object with following parameters

| Key | Description | Type | optional |
| --- | --- | --- | --- |
| bucket | S3 bucket name | String | false |
| accessKeyId | S3 access key | String | false |
| secretAccessKey | S3 secret access key | String | false |
| acl | S3 ACL | String | true;defaults:'public-read'

