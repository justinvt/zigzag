
var drawing, image_orig, image_filtered
var i = 0

const defaults = {
	width: 400,
	height: 400
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
	
	// spread is just a horizontal blue (1 -> image.width)
	var spread = 12
	
	for (var i = 0; i < canvas_src_image.data.length; i += 4) {
		/*
		canvas_dest_image.data[i]   = canvas_src_image.data[i]  
		canvas_dest_image.data[i + 1]   = canvas_src_image.data[i + 1]  
		canvas_dest_image.data[i + 2]   = canvas_src_image.data[i + 2]  
		canvas_dest_image.data[i + 3]   = 255
		*/
		
		canvas_dest_image.data[i]   = (canvas_src_image.data[i]  + canvas_src_image.data[i - (spread * 4)] +  canvas_src_image.data[i + (spread * 4)] )/ 3
		canvas_dest_image.data[i + 1]   = (canvas_src_image.data[i + 1]  + canvas_src_image.data[i + 1 - (spread * 4)] +  canvas_src_image.data[i + 1  +  (spread * 4)] )/ 3
		canvas_dest_image.data[i + 2]   = (canvas_src_image.data[i + 2]  + canvas_src_image.data[i + 2 - (spread * 4)] +  canvas_src_image.data[i + 2 + (spread * 4)] )/ 3
		canvas_dest_image.data[i + 3]   = 255 // 
		
	}
	canvas_dest_context.putImageData(canvas_dest_image, 0, 0);
	console.log(canvas_src_image,canvas_dest_image)
}
function drawLine(svg_drawing, image, start,  endCondition ){
	
	//start ||= [0,40]
	
	var cur = [start[0], start[1]]
	endCondition ||= function(){ return (cur & cur[0] > svg_drawing.width & cur[1] >  svg_drawing.height & cur[0] < 0 & cur[1] < 0) }
	var context = image.getContext('2d')

	while(cur[0] < 400){
			
			var x_d = 1
			var y_d = 0
			var last_line_drawn = [cur, [ cur[0] + x_d, cur[1] + y_d]]
			var line_path = `m${cur[0]} ${cur[1]} l${x_d} ${y_d}`
		
			//console.log("cursor", cur)
			if(context && context.getImageData(cur[0], cur[1], 1, 1)){
				var x =  cur[0];//parseInt(x_i - rect.left);
				var y =  cur[1];//parseInt(y_i - rect.top);
				var pix = context.getImageData(x, y, 1, 1).data
				var red =  (pix[0]/255.0)
				var green = (pix[1]/255.0)
				var blue =  (pix[2]/255.0)
				var white = 1 - (red * green * blue)
				var pix_str =  white  * 2
			}
			
			var full_path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			full_path.setAttribute('d', line_path);
			full_path.setAttribute('fill', 'none');
			full_path.setAttribute('stroke', "#000");
			full_path.setAttribute('stroke-width', pix_str.toFixed(4) + "px")
			svg_drawing.appendChild(full_path)
			cur[0] += x_d;
			cur[1] += y_d;
			i++
			console.log("iterat", i)
			
	}
    
	start[1] = start[1] + 10
	start[0] = 0
	if (start[1] < 400)
		drawLine(svg_drawing, image, [start[0], start[1]]);
}


 
var onComplete = function(){
	drawing = newSVG()
	image_filtered = createCanvas({ id: "filtered"})
	image_orig = createCanvas({image_url: "images/dude.jpg", id: "original", 
		callback: function(){ 
			canvasToCanvas(image_orig, image_filtered);
			drawLine(drawing, image_filtered, [0,40]);
		 }
	 })
	
}


document.addEventListener('DOMContentLoaded', onComplete, false);