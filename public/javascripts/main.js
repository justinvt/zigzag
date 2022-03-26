const defaults = {}
function newSVG(props={}){
	props.width ||= 800
	props.height ||= 800
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("width", props.width.toString());
		svg.setAttribute("height", props.height.toString());
		svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
		if (props.appendTo)
			props.appendTo.append(svg)
	return svg
}

function createCanvas3(props={}){
	props.width ||= 800
	props.height ||= 800
	var new_canvas = document.createElement('canvas');
	var new_canvas_context = new_canvas.getContext('2d');
	new_canvas.setAttribute("width", props.width.toString());
	new_canvas.setAttribute("height", props.height.toString());
	if (props.appendTo){
		props.appendTo.append(new_canvas)
	}
	if (props.image_url){
		var img = new Image();
		img.crossOrigin = "Anonymous";
		img.onload = function() {
			cvs.width = img.width;
			cvs.height = img.height;
			ctx.drawImage(img, 0, 0);
			redraw();
			toggleBlur()
		}
	}
	return new_canvas
}






var onComplete = function(){
	 newSVG({appendTo: document.body})
}

document.addEventListener('DOMContentLoaded', onComplete, false);