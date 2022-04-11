
var drawing, image_orig, image_filtered, workspace
var i = 0
var  line_history = Array(10).fill()
 
 
const defaults = {
	width: 400,
	height: 400,
	row_spacing: 5,
	amplitude: 1.3,
	stroke: 0.8
}

function applyConvolution(sourceImageData, outputImageData, kernel) {
  const src = sourceImageData.data;
  const dst = outputImageData.data;
  
  const srcWidth = sourceImageData.width;
  const srcHeight = sourceImageData.height;
  
  const side = Math.round(Math.sqrt(kernel.length));
  const halfSide = Math.floor(side / 2);
  
  // padding the output by the convolution kernel
  const w = srcWidth;
  const h = srcHeight;
  
  // iterating through the output image pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
        
      // calculating the weighed sum of the source image pixels that
      // fall under the convolution kernel
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide;
          const scx = x + cx - halfSide;
          
          if (scy >= 0 && scy < srcHeight && scx >= 0 && scx < srcWidth) {
            let srcOffset = (scy * srcWidth + scx) * 4;
            let wt = kernel[cy * side + cx];
            r += src[srcOffset] * wt;
            g += src[srcOffset + 1] * wt;
            b += src[srcOffset + 2] * wt;
            a += src[srcOffset + 3] * wt;
          }
        }
      }
      
      const dstOffset = (y * w + x) * 4;
      dst[dstOffset] = r;
      dst[dstOffset + 1] = g;
      dst[dstOffset + 2] = b;
      dst[dstOffset + 3] = a;
    }
  }
  return outputImageData;
}

function blur(sourceImageData, outputImageData) {
	
    return applyConvolution(sourceImageData, outputImageData, [
         1 / 16, 2 / 16, 1 / 16,
         2 / 16, 4 / 16, 2 / 16,
         1 / 16, 2 / 16, 1 / 16
       ]);
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
	var spread = 18
	/*
	for (var i = 0; i < canvas_src_image.data.length; i += 4) {
		/*
		canvas_dest_image.data[i]   = canvas_src_image.data[i]  
		canvas_dest_image.data[i + 1]   = canvas_src_image.data[i + 1]  
		canvas_dest_image.data[i + 2]   = canvas_src_image.data[i + 2]  
		canvas_dest_image.data[i + 3]   = 255
		
		
		canvas_dest_image.data[i]   = (canvas_src_image.data[i]  + canvas_src_image.data[i - (spread * 4)] +  canvas_src_image.data[i + (spread * 4)] + canvas_src_image.data[i - ( canvas_src_image.width * spread * 4 )] + canvas_src_image.data[i + ( canvas_src_image.width * spread * 4 )])/5
		canvas_dest_image.data[i + 1]   = (canvas_src_image.data[i + 1]  + canvas_src_image.data[i + 1 - (spread * 4)] +  canvas_src_image.data[i + 1  +  (spread * 4)] + canvas_src_image.data[i + 1 + ( canvas_src_image.width * spread * 4 )]  + canvas_src_image.data[i + 1 - ( canvas_src_image.width * spread * 4 )])/ 5
		canvas_dest_image.data[i + 2]   = (canvas_src_image.data[i + 2]  + canvas_src_image.data[i + 2 - (spread * 4)] +  canvas_src_image.data[i + 2 + (spread * 4)] + canvas_src_image.data[i + 2 + ( canvas_src_image.width * spread * 4 )] + canvas_src_image.data[i + 2 - ( canvas_src_image.width * spread * 4 )])/ 5
		canvas_dest_image.data[i + 3]   = 255 // 
		
	}
	*/
	
	var dest_data_changed = blur(canvas_src_image, canvas_dest_image) 
	canvas_dest_context.putImageData(dest_data_changed, 0, 0);
	console.log(canvas_src_image,canvas_dest_image)
}

function replaceLineWithPoly(line){
		var height0 = parseFloat(line.getAttribute("stroke-width").match(/[\d\.]+/g)[0]) * 0.03
		var origin0 =  line.getAttribute("d").match(/(?<=m)([\d\.]+(\s)*)./g)[0].split(" ").map( n => parseFloat(n) )
		var coords00 = [origin0[0], origin0[1] - height0  ]
		var coords01 = [origin0[0], origin0[1] + height0 ]
		console.log("Path 1",  origin0, height0)
	//console.log("Path 2",  origin1, height1)
			
	if(line.nextSibling){		
		var height1 = parseFloat(line.nextSibling.getAttribute("stroke-width").match(/[\d\.]+/g)[0]) * 0.03
		var origin1 = line.nextSibling.getAttribute("d").match(/(?<=m)([\d\.]+(\s)*)./g)[0].split(" ").map( n => parseFloat(n) )
		var coords10 = [origin0[0] + 1, origin1[1] - height1  ]
		var coords11 = [origin0[0] + 1, origin0[1] + height1 ]

		var points = [ coords00[0], coords00[1],   coords01[0] , coords01[1], coords11[0] ,coords11[1] , coords10[0], coords10[1]].join(",")
		var polyg = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		polyg.setAttribute('points', points);
		polyg.setAttribute('fill', '#666');
		polyg.setAttribute('stroke', "#aa3");
		polyg.setAttribute('stroke-width', "0.82")
		drawing.appendChild(polyg)
	}
	return line
}

function replaceAll(){
	var paths =  document.getElementsByTagName('path');
	Array.from(paths,  path => {
		replaceLineWithPoly(path) 
		path.remove()
		//return path
	 })
  
	
}

function createWorkspace(){
	var new_workspace = document.createElement('div');
	new_workspace.id = "workspace"
	document.body.appendChild(new_workspace)
	return new_workspace
}

function frequencyMask(svg_drawing, image,start,endCondition){
	start ||= [0,0]
	
	var cur = [start[0], start[1]]
	endCondition ||= function(){ return (cur & cur[0] > svg_drawing.width & cur[1] >  svg_drawing.height & cur[0] < 0 & cur[1] < 0) }
	var context = image.getContext('2d')
	
	var group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
		var line_path = `M${cur[0]} ${cur[1]} L `
	while(cur[0] <  svg_drawing.getAttribute("width") || i < 4000){
			
		var x_d = 0.5
		
			//console.log("cursor", cur) 
			if(context && context.getImageData(cur[0], cur[1], 1, 1)){
				var x =  cur[0];//parseInt(x_i - rect.left);
				var y =  cur[1];//parseInt(y_i - rect.top);
				var pix = context.getImageData(x, y, 1, 1).data
				var red =  (pix[0]/255.0)
				var green = (pix[1]/255.0)
				var blue =  (pix[2]/255.0)
				var white =  (red * green * blue )
				var black	=  1 - (white)^2
				var pix_str =  white
			}
			var  frequency = black 
			var ang_frequency = frequency * (Math.PI * 2) 
			var amplitude = defaults.amplitude
			var fun = function(t){
			match_vert = 0
				match_vert = -(Math.asin(cur[1]/amplitude*ang_frequency)-t)
				//console.log("match", match_vert)
				return start[1] + amplitude * Math.sin((1/ang_frequency)*(t - 0))
			 }
			var y_d = fun(i)
			 line_path += ` ${cur[0]+x_d} ${fun(i)} `
		
			 var slp = (fun(i)-fun(i-1 )) -  fun(i-1)
			 var last_height=fun(i)-fun(i-1 )
			// console.log("slp + yd)", slp, last_height)
			
			var last_line_drawn = [
					[ 
						cur[0],
						fun(i-1)
					], 
					[ 
						cur[0] + 1, 
						fun(i) 
					]
			]
			var slope = last_line_drawn[1][1] - last_line_drawn[0][1]

			cur[0] += x_d;
			//cur[1] += y_d;
			i++
		//	console.log("iterat", i)
			
	}
	var full_path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
	full_path.setAttribute('d', line_path);
	full_path.setAttribute('fill', 'none');
	full_path.setAttribute('stroke', "#000");
		full_path.setAttribute('freq_over_one', 1/frequency);
			full_path.setAttribute('freq', frequency);
		full_path.setAttribute('start_yd', last_height);
					full_path.setAttribute('slope', slope);
	//full_path.setAttribute('stroke-width', pix_str.toFixed(4) + "px")
	full_path.setAttribute('stroke-width', defaults.stroke + "px")
	group.appendChild(full_path)
	svg_drawing.appendChild(group)
	start[1] = start[1] + defaults.row_spacing
	start[0] = 0
	if (start[1] < svg_drawing.getAttribute("height"))
		drawLine(svg_drawing, image, [start[0], start[1]]);
}

function drawLine(svg_drawing, image, start,  endCondition ){
	frequencyMask(svg_drawing, image,start,endCondition)

}


 
var onComplete = function(){
	drawing = newSVG()
	workspace = createWorkspace()

	image_orig = createCanvas({image_url: "images/bw.png", id: "original", appendTo: workspace,
		callback: function(){ 
			canvasToCanvas(image_orig, image_filtered);
			drawLine(drawing, image_filtered, [0,0]);
			//replaceAll()
		 }
	 })
	 
	 image_filtered = createCanvas({ id: "filtered", appendTo: workspace})
	
}


document.addEventListener('DOMContentLoaded', onComplete, false);