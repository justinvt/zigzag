var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	const directoryPath = path.join(__dirname, 'public');
	var file_list = []
	fs.readdir(directoryPath, (err, files) => {
	  	 file_list = files
	
	});
 
	res.render('all');

});

module.exports = router;
