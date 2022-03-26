var express = require('express');
var fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	const directoryPath = path.join("/Users/appleguest/Projects/zigzag", 'public');
	var file_list = []
	fs.readdir(directoryPath, (err, files) => {
	  	 file_list = files
		console.log(files, directoryPath)

		res.render('all', {locals:{file_list:  files}});
		console.log(err)

	
	});

});

module.exports = router;
