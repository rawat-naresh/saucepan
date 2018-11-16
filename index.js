const fs = require('fs');
const sharp = require('sharp');
const shortid = require('shortid');
function Saucepan(options){
	if(!options) {
		throw new TypeError('Expected options')
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


	return sharp(this.options.buffer)
		.toFile(`${path}/${randomKey}.jpg`)
		.then(function(result){
			return new Promise((resolve)=>{
				resolve(`${randomKey}.jpg`);
			})
		});
}

function getRandomKey(){
	//ShortId creates amazingly short non-sequential url-friendly unique ids
	return shortid.generate();
}



module.exports =  function(options){
	return new Saucepan(options);
}