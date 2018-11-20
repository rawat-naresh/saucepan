const fs = require('fs');
const sharp = require('sharp');
const shortid = require('shortid');
const fileType = require('file-type');
const AWS = require('aws-sdk');

function Saucepan(options){
	
	this.configs = {
		original:true,
		sizes:[],
	};

	if(typeof options != 'object') 
		throw new TypeError('Saucepan expects an Object as a parameter');
	else
		Object.assign(this.configs,options);
	
	if(!Buffer.isBuffer(this.configs.buffer)) 
		throw new TypeError('Expected opts.buffer to be Buffer');

	if(typeof this.configs.original != 'boolean')
		throw new TypeError('Expected opts.original to be Boolean');	

	if(this.configs.sizes){
		
		if(Array.isArray(this.configs.sizes) && this.configs.sizes.length > 0){
			this.configs.sizes.forEach((item)=>{
				if(item.path == 'undefined' || item.xy == 'undefined' || isNaN(item.xy) || item.xy < 1 )
					throw new TypeError('Invalid opts.sizes');	
			});
		}
		else
			throw new TypeError('Expected opts.sizes to be an Array of sizes');	
	}

	if(this.configs.original) {
		this.configs.sizes.push({path:'original',xy:null});
	}

}


Saucepan.prototype.storeToLocal = function(path){
	let self = this;
	if(!fs.existsSync(path))
		throw new Error(`Path ${path} doesn't exists`);
     
	const randomKey = getRandomKey();
	const type = fileType(this.configs.buffer);

	const resize = size => sharp(this.configs.buffer)
	 				.resize(size.xy)
	 				.toFile(`${path}/${randomKey}-${size.path}.${type.ext}`);

	return Promise.all(this.configs.sizes.map(resize)).then(results =>
		Promise.resolve(results.map((result,index)=>{
			return {filename:`${randomKey}-${self.configs.sizes[index].path}.${type.ext}`}
		}))
	).catch(err => new Promise.reject(err))
}

Saucepan.prototype.storeToS3 = function(s3Params){
	let self = this;
	if(typeof s3Params != 'object')
		throw new TypeError('method storeToS3 expects an Object as parameter');

	if(!s3Params.accessKeyId) 
		throw new TypeError('method storeToS3 expects an Object with accessKeyId');
	
	if(!s3Params.secretAccessKey)
		throw new TypeError('method storeToS3 expects an Object with secretAccessKey');		
	
	if(!s3Params.bucket)
		throw new TypeError('method storeToS3 expects an Object with bucket ');		
	
	let  s3Client = new AWS.S3({
		accessKeyId: s3Params.accessKeyId,
		secretAccessKey: s3Params.secretAccessKey,
	  });

	const randomKey = getRandomKey();
	const type = fileType(this.configs.buffer);
	const filePath = randomKey+'.'+type.ext;


	const resize = size => sharp(this.configs.buffer)
	.resize(size.xy)
	.toBuffer();

	const s3Upload = resizedImage => {

		return new Promise((resolve,reject)=>{
			s3Client.putObject({
				Bucket: s3Params.bucket,
				Key: resizedImage.key,
				ACL: s3Params.acl || 'public-read',
				Body: resizedImage.buffer,
				ContentType: type.mime,
			},function(err,data){
				if(err)
					reject(err);
				else
					resolve(Object.assign(data,{path:resizedImage.key}));
			});
		});
	}

	return Promise.all(this.configs.sizes.map(resize)).then(function(results){
		let resultWithKey = results.map((item,index)=>{
			return {
				buffer:item,
				key:`${randomKey}-${self.configs.sizes[index].path}.${type.ext}`
			}
		});
		return Promise.all(resultWithKey.map(s3Upload))
	}
	).then(function(results){
		return Promise.resolve(results);
	}).catch(err => Promise.reject(err))	
}

function getRandomKey(){
	//ShortId creates amazingly short non-sequential url-friendly unique ids
	return shortid.generate();
}



module.exports =  function(options){
	return new Saucepan(options);
}