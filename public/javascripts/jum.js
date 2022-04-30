var dict_en;;
var verbose = true;
var test_mode = false;
var slowmo = false
var timeout
var just_answered = false
var last_answer;
var wait_to_guess = 500;

function populateDictionary(callback){

  var req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open('GET', "http://127.0.0.1:3000/en.js", true);
  req.onload  = function() {
     dict_en = req.response;
     console.log("Done getting words")
     callback.call()
   // do something with jsonResponse
  };
  req.send(null);
}

function dictCallback(){

}
populateDictionary(dictCallback)

top.constants = {
  channels: function(){
    return Array.from(document.querySelectorAll('[href^="/channels"]')).map(a => { return {url:  a.attributes["href"].value, title: a.attributes["aria-label"].value}})
  },
  scramble_text: "First person to guess",
  token:  "NTkyMDkwODUyMjQ4MTI1NDQ0.Ya8T0w.f2DXhjG-V7zoSJDlIsodabZMcTE",
  channel_id: "830170925537165352",
  server_id: "582689404615917579",
  channel_url: (x =>  {return `https://discord.com/api/v9/channels/${x}/messages`}),
   search_url: ((x,serv_id) =>  {return `https://discord.com/api/v9/guilds/${serv_id}/messages/search?content=${x}`})
}

Array.prototype.pick_random = function () {
  return this[Math.floor((Math.random()*this.length))];
}

Array.prototype.at = function (i) {
  return  i < 0 ? this[this.length + i] : this[i]
}


function currentChannel(){
 return document.querySelectorAll('[class*="selected"][class*="cont"] a')[0].attributes.href.value.match(/\d+$/gi).toString()
}
function serverFind(part){
  var r = new RegExp(part, "gi")
  return top.constants.channels().filter(s => s.title.match(r))[0].url.match(/\/(\d+)\//gi)[0].replace(/[^\d]+/g,'')
}
function channelFind(part){
  var r = new RegExp(part, "gi")
  return top.constants.channels().filter(s => s.title.match(r))[0].url.match(/\d+$/gi)[0].replace(/[^\d]+/g,'')
}
// Sorted by frequency
String.prototype.charMap = function(){
  var letters = new Set(this.toString())
  return Array.from(letters).map(l =>
     [l, this.toString().match( new RegExp(l,"g") ).length]
   ).sort((b,a) => a[1] - b[1])
}

// Sorted by alpgabet
String.prototype.letterMap = function(){
  return Object.fromEntries(
   this.toString().charMap().sort((b,a) => a[0] - b[0])
  )
} 

String.prototype.letterMapPlus = function(){
  var lmap = {}
  lmap.word = this.toString()
  var lett = this.toString().letterMap()
  lett["word"] =  this.toString()
  var m = Object.assign( lmap, lett);
  return lett

} 

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function compareChars(w1,w2){
  return JSON.stringify(w1.charMap()) ==   JSON.stringify(w2.charMap()) 
}
function slowDown(){
  slowmo = false
}
String.prototype.postAsComment = function(testing){

   
  // Pass a "false" as an argument to actually post the
  // answer in the public channel
  if(testing){
    console.log(
    `%c ${ this.toString() } %c was accepted as your answer to the jumble, 
    but this function is being run in testing  mode`,
     "font-weight: bold;color:blue;",
     ""
     )
    return  this.toString() 
  }
  request = new XMLHttpRequest();
  request.withCredentials = true;
  request.open("POST", top.constants.channel_url(currentChannel()));
  request.setRequestHeader("authorization", top.constants.token);
  request.setRequestHeader("accept", "/");
  request.setRequestHeader("authority", "discord.com");
  request.setRequestHeader("content-type", "application/json");
  request.addEventListener('loadend', function(){
        just_answered = true
  });
  request.send(JSON.stringify({ 
    content: this.toString() 
  }));
}

String.prototype.searchFor= function(testing){
  // Pass a "false" as an argument to actually post the
  // answer in the public channel
  if(testing){
    console.log(
    `%c ${ this.toString() } %c was accepted as your answer to the jumble, 
    but this function is being run in testing  mode`,
     "font-weight: bold;color:blue;",
     ""
     )
    return  this.toString() 
  }
  request = new XMLHttpRequest();

  request.onload = function() {
    console.log(`Loaded: ${request.status} ${request.response}`);
  };
  request.withCredentials = true;
  request.open("GET", top.constants.search_url(this.toString(), top.constants.server_id));
  request.setRequestHeader("authorization", top.constants.token);
  request.setRequestHeader("accept", "/");
  request.setRequestHeader("authority", "discord.com");
  request.setRequestHeader("content-type", "application/json");
  request.send(JSON.stringify({ 
    content: this.toString() 
  }));

}

function solveJumble(jumble){

  var begin = Date.now()

  var letters = new Set(jumble)
  var word_length =  jumble.length
  var possible = dict_en.filter(w => w.length == word_length)

  jumble.charMap().map( l => {

    possible = possible.filter( w => 
      {
        var match =  w.match(new RegExp(l[0],"g"))
        return Boolean(match) && match.length == l[1]
      })
  })
  //compareWords(...[jumble, possible].flat())
  return possible
}

function sampleJumble(min_length = 6, max_length = 15){
  var sample = shuffle (
        dict_en.filter(w => (w.length > min_length  && w.length < max_length) ) )[0]
  return shuffle(sample.match(/\w/g)).join("");
}

function scrablefromElement(element, words=top.constants.scramble_text) { 
  return element.textContent.match(words,"gi")
}

function recentScrambleWord(words=top.constants.scramble_text) { 
   var past = Array.from(document.querySelectorAll("[class*='messageContent']")).map(el => el.textContent)
                    .filter(a => a.match(words,"gi"))
  return  past.length && past.at(-1).match(/\w+$/gi)[0]
}

function findWord(words=top.constants.scramble_text) { 
  return document.evaluate(`//*[contains(text(),"${words}")]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
}

function provokeRespomse(){
  `${top.constants.scramble_text} ${sampleJumble()}`.postAsComment()
}

function compareWords(...words){
  words = Array.from(words)
  console.assert( [...new Set(["ss", "ss"].map( w => w.length ))].length == words.length, "Different letter counts")
  console.table( words.map( w => { return {word: w, length: w.length}}) , ["word", "length"])
  console.table( words.map( w => { return w.letterMapPlus() } ))
}

 function guessit(jumble_word=false, live=true){
  //  console.clear()
  just_answered = false
 //  console.time("solving");
    jumble_word ||= recentScrambleWord()
    if(jumble_word){
    
       //console.log(`Jumbled word is ${jumble_word} - this was ${sample ? "a sample word"  : "scraped from a actual disocrd post"}`)
       var solution = solveJumble( jumble_word )
       if(solution != undefined && solution.length){
         var choose_one = solution[0]

         //console.log("Jumble Solved as ", solution, " choosing one", choose_one)
         var normalized_solution = choose_one.replace(/[^\w]+/g," ").trim()
         var past = Array.from(document.querySelectorAll("[class*='markup']")).filter(el => el.textContent.includes(normalized_solution))
         if(normalized_solution != last_answer)
            normalized_solution.postAsComment(false)
         last_answer = normalized_solution
       }
    }  
 //    console.timeEnd("solving");  
 }


var observeDOM = (function(){
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  return function( obj, callback ){
    if( !obj || obj.nodeType !== 1 ) return; 

    if( MutationObserver ){
      // define a new observer
      var mutationObserver = new MutationObserver(callback)

      // have the observer observe foo for changes in children
      mutationObserver.observe( obj, { childList:true, subtree:true })
      return mutationObserver
    }
    
    // browser support fallback
    else if( window.addEventListener ){
      obj.addEventListener('DOMNodeInserted', callback, false)
      obj.addEventListener('DOMNodeRemoved', callback, false)
    }
  }
})()

// Observe a specific DOM element:

var observe = function(){ 
  observeDOM( document.querySelector('ol'), function(m){ 

      var addedNodes = [], removedNodes = [];

      m.forEach(record => record.addedNodes.length & addedNodes.push(...record.addedNodes))
           m.forEach(added =>  {
            added.addedNodes.forEach(a => {
             var match_found = a.textContent.match(top.constants.scramble_text,"gi")
            if(match_found){
              var scramble = a.textContent.match(/\w+$/,"gi")[0]
              console.log("scrambke found in ", a.textContent, " as ", scramble )
              //var guess = function() { guessit(scramble) }
              setTimeout(function(){guessit(scramble) }, wait_to_guess)
            }
           } )
          })
   // console.log('Added:', addedNodes.map(a => a.textContent).join, 'Removed:', removedNodes);
  })
}

function selectText() {
	console.log("idname", this)
    if (document.body.createTextRange) {
        var rr = document.body.createTextRange();
        rr.moveToElementText(nn);
        rr.select();
    } else if (window.getSelection) {
		var nn = document.getElementById(idname);
		console.log(idname)
		
        var selection = window.getSelection();
        var rr = document.createRange();
        rr.selectNodeContents(nn);
        selection.removeAllRanges();
        selection.addRange(rr);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}


var onComplete = function(){
	document.getElementById("sample").onclick = function(){
		document.querySelector("input").value = sampleJumble()
		document.querySelectorAll(".word_choice").forEach( t => t.remove())
		document.querySelector("input").focus()
	}
	document.querySelector("input").onmouseout= 	 function(){ 
	//	var jumble_text = 
		document.querySelectorAll(".word_choice").forEach( t => t.remove())
		var solved = solveJumble(this.value)
		solved.forEach(w => {
		    // create a new div element
		    var solved_el = document.createElement("input");
			solved_el.type="text"
			solved_el.id = w
			solved_el.className = "word_choice"
			solved_el.value = w
		    // and give it some content
		    var solved_word = document.createTextNode(w);

		    // add the text node to the newly created div
		    solved_el.appendChild(solved_word);
			
		    // add the newly created element and its content into the DOM
		   // const currentDiv = document.getElementById("div1");
		    //document.body.insertBefore(newDiv, currentDiv);
			solved_el.style.fontSize = "5em"
			document.body.append(solved_el)
			solved_el.onmouseover = function(e){
				var node = e.target
				node.focus();
				node.select();
				
			}
			
		})

	}
}

var after_dict = function(){

	document.querySelector("input")[0].focus()
	observe
}

document.addEventListener('DOMContentLoaded', onComplete, false);
