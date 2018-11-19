const fs = require('fs');
const sharp = require('sharp');
const shortid = require('shortid');
const fileType = require('file-type');
const AWS = require('aws-sdk');

function Saucepan(options){
	if(typeof options != 'object') {
		throw new TypeError('constructor Saucepan expects an Object as parameter');
	} else {
		this.options = options;
	}

	if(!Buffer.isBuffer(options.buffer)) {
		throw new TypeError('Expected opts.buffer to be Buffer');
	} 
}


Saucepan.prototype.storeToLocal = function(path){

	if(!fs.existsSync(path)){
		//given path doesn't exists
		throw new Error(`Path ${path} doesn't exists`);
    } 
    
	const randomKey = getRandomKey();
	const type = fileType(this.options.buffer);

	return new Promise((resolve,reject)=>{
		sharp(this.options.buffer)
		.toFile(`${path}/${randomKey}.${type.ext}`,function(err,info){
			if(err){
				reject(err);
			}
			resolve(`${randomKey}.${type.ext}`);			
		})
		
	});

}

Saucepan.prototype.storeToS3 = function(s3Params){
	if(typeof s3Params != 'object'){
		throw new TypeError('method storeToS3 expects an Object as parameter');
	}
	if(!s3Params.accessKeyId) {
		throw new TypeError('method storeToS3 expects an Object with accessKeyId');
	}
	if(!s3Params.secretAccessKey){
		throw new TypeError('method storeToS3 expects an Object with secretAccessKey');		
	}
	if(!s3Params.bucket){
		throw new TypeError('method storeToS3 expects an Object with bucket ');		
	}
	let  s3Client = new AWS.S3({
		accessKeyId: s3Params.accessKeyId,
		secretAccessKey: s3Params.secretAccessKey,
	  });

	const randomKey = getRandomKey();
	const type = fileType(this.options.buffer);
	const filePath = randomKey+'.'+type.ext;

	return new Promise((resolve,reject)=>{
		s3Client.putObject({
			Bucket: s3Params.bucket,
			Key: `${randomKey}.${type.ext}`,
			ACL: s3Params.acl || 'public-read',
			Body: this.options.buffer,
			ContentType: type.mime,
		},function(err,data){
			if(err){
				reject(err);
			}
			resolve(Object.assign(data,{path:filePath}));
		});

	});
	
}

function getRandomKey(){
	//ShortId creates amazingly short non-sequential url-friendly unique ids
	return shortid.generate();
}



module.exports =  function(options){
	return new Saucepan(options);
}