
var drawing, image_orig, image_filtered

const defaults = {
	width: 800,
	height: 800
}

function newSVG(props={}){
	props.width ||= defaults.width
	props.height ||=  defaults.height
	props.appendTo ||= document.body
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("width", props.width.toString());
		svg.setAttribute("height", props.height.toString());
		svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	props.appendTo.append(svg)
	return svg
}

function createCanvas(props={}){
	props.width ||= defaults.width
	props.height ||= defaults.height
	props.image_url ||= defaults.imag_url
	props.appendTo ||= document.body
	console.log(props)
	var new_canvas = document.createElement('canvas');
		new_canvas.setAttribute("width", props.width.toString());
		new_canvas.setAttribute("height", props.height.toString());
		if(props.id)
			new_canvas.id = props.id
	var new_canvas_context = new_canvas.getContext('2d');
	props.appendTo.append(new_canvas)
	if (props.image_url){
		console.log("image url")
		var img = new Image();
		img.crossOrigin = "Anonymous";
		img.onload = function() {
			console.log("image loaded")
			new_canvas_context.drawImage(img, 0, 0);
			new_canvas.append(img)
			if(props.callback)
				props.callback.call()
		}
		img.src = props.image_url
	}
	return new_canvas
}

function canvasToCanvas(canvas_src, canvas_dest){
	
	var canvas_src_context = canvas_src.getContext('2d')
	var canvas_src_image = canvas_src_context.getImageData(0,0,canvas_src.width, canvas_src.height)
	var src_data = canvas_src_image.data
	
	var canvas_dest_context = canvas_dest.getContext('2d')
	var canvas_dest_image = canvas_dest_context.createImageData(canvas_dest.width, canvas_dest.height)
	var dest_data = canvas_dest_image.data
	var myImageData = canvas_dest_context.createImageData(20, 20);

	for (var i = 0; i < canvas_src_image.data.length; i += 4) {
		var avg = (canvas_src_image.data[i] + canvas_src_image.data[i + 1] +  canvas_src_image.data[i + 2]) / 3;
		canvas_dest_image.data[i]   = canvas_src_image.data[i + 1]  // R
		canvas_dest_image.data[i + 1]   = 255 // G
		canvas_dest_image.data[i + 2]   = 255 // G
		canvas_dest_image.data[i + 3]   = 255 // A
	}
	
	

	canvas_dest_context.putImageData(canvas_dest_image, 0, 0);
	console.log(canvas_src_image,canvas_dest_image)
}


 
var onComplete = function(){
	drawing = newSVG()
	image_filtered = createCanvas({width: 300, height: 300, id: "filtered"})
	image_orig = createCanvas({image_url: "images/dude.jpg", width:300, height:300 , id: "original", callback: function(){ canvasToCanvas(image_orig, image_filtered) } })


	//canvasToCanvas(image_orig, image_filtered)
}

document.addEventListener('DOMContentLoaded', onComplete, false);