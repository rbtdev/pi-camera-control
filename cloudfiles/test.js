process.env.CLOUDINARY_URL = "cloudinary://622766673399467:cORJzuJjoVQYQgjfxJDkR7BXIuU@hegcvexzs";

var cloudinary = require('cloudinary')
cloudinary.uploader.upload("./test.jpg", function (result) { 
 	console.log(result) 
})

