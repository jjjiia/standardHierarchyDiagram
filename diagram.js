var files = ["block_group.csv",
"census_tract.csv",
"county_subdivision.csv",
"county.csv",
"division.csv",
"nation.csv",
"place.csv",
"region.csv",
"school_district.csv",
"state_legislative_district_lower.csv",
"state_legislative_district_upper.csv",
"subminor_civil_division.csv",
"urban_area.csv",
"ZIP_Code_Tabulation_Area.csv"]
var colors = {
	nation:"#000",
	regions:"#6178d9",
	divisions:"#7854d9",
	states:"#5eb24c",
	counties:"#d54684",
	tracts:"#95469c",
	groups:"#4bbbb1",
	blocks:"#333",
	subminor:"#d5453e",
	blank:"#000"
}

var nodesDictionary = {}

// cons

var promises = [d3.csv("labels.csv"),d3.csv("maxmin.csv"),d3.csv("links.csv")]
// for(var f in files){
// 	promises.push(d3.csv(files[f]))
// }
var w = 840
var h = 900
var spaceX = 45
var spaceY = 70

Promise.all(promises)
.then(function(data){
	ready(data)
})

function ready(data){
	var nodes = data[0]
	var maxMin = data[1]
	var links = data[2]

	var svg = d3.select("#diagram").append("svg").attr("width",w).attr("height",h)
	
	for(var n in nodes){
		if(nodes[n].label!=undefined){
			var nodeName = cleanString(nodes[n].label)
			//console.log(nodeName)
			nodesDictionary[nodeName]=nodes[n]
		}
	}
	console.log(nodesDictionary)
	//var maxMinDictionary = {}
	for(var m in maxMin){
		if(maxMin[m].geo!=undefined){
			var nodeName = cleanString(maxMin[m].geo)
			console.log(nodeName)
			if(Object.keys(nodesDictionary).indexOf(nodeName)>-1){
				nodesDictionary[nodeName]["maxMin"]=maxMin[m]
			}
			//console.log(nodeName)
		}
	}
	console.log(nodesDictionary)
	
	drawLinks(links,nodes,svg)
	drawDiagram(nodes,maxMin,svg)
}


function drawDiagram(data,maxMinData,svg){
	//console.log(data)
	
	svg.append("text").text("Standard Hierarchy of Census Geographic Entities").attr("x",w/2).attr("y",spaceY).attr("text-anchor","middle")
	.style("font-weight",800)
	.style("font-size","18px")
	
	svg.selectAll(".labelOutline")
	.data(data)
	.enter()
	.append("text")
	.attr("class",function(d){
			return "labelOutline _"+d.fontClass
	})
	.text(function(d){
		if(d.colorClass=="blank"){return ""}
		return d.label
	})
	.attr("stroke-width","12px")
	.style("stroke","#fff")
	.attr("x",function(d,i){ return d.x*spaceX+w/2})
	.attr("y",function(d){return d.y*spaceY+spaceY*2+5})
	.attr("text-anchor",function(d){return d.anchor})
	
	svg.selectAll(".label")
	.data(data)
	.enter()
	.append("text")
	.attr("class",function(d){
			return "label _"+d.fontClass
	})
	.text(function(d){
		if(d.colorClass=="blank"){return ""}
		return d.label
	})
	.attr("x",function(d,i){ return d.x*spaceX+w/2})
	.attr("y",function(d){return d.y*spaceY+spaceY*2+5})
	.attr("text-anchor",function(d){return d.anchor})
	.attr("fill",function(d){return colors[d.colorClass]})
	
	
	
	svg.selectAll(".count_outline")
	.data(data)
	.enter()
	.append("text")
	.attr("class",function(d){
			return "count_outline"
	})
	.text(function(d){
		if(d["maxMin"]!=undefined){
			console.log(d)
			return parseInt(d.maxMin.count)
		}
	})
	.style("font-size","12px")

	.attr("stroke-width","5px")
	.style("stroke","#fff")
	.attr("x",function(d,i){ return d.x*spaceX+w/2})
	.attr("y",function(d){return d.y*spaceY+spaceY*2+18})
	.attr("text-anchor",function(d){return d.anchor})
	
	svg.selectAll(".count")
	.data(data)
	.enter()
	.append("text")
	.attr("class",function(d){
			return "count"
	})
	.text(function(d){
		if(d["maxMin"]!=undefined){
			console.log(d)
			return parseInt(d.maxMin.count)
		}
	})
	.style("font-size","12px")
	.attr("x",function(d,i){ return d.x*spaceX+w/2})
	.attr("y",function(d){return d.y*spaceY+spaceY*2+18})
	.attr("text-anchor",function(d){return d.anchor})
	.attr("fill",function(d){return colors[d.colorClass]})
	
	// svg.selectAll(".dot")
// 	.data(data)
// 	.enter()
// 	.append("circle")
// 	.attr("class","dot")
// 	.attr("r",2)
// //	.attr("text",function(d){return d.geographies})
// 	.attr("cx",function(d,i){return d.x*spaceX+w/2})
// 	.attr("cy",function(d){return d.y*spaceY+spaceY*2+2})
}
function cleanString(string){
	var string = string.replace(/[^\w\s]/gi, '')
	string = string.toLowerCase()
	return string.split(" ").join("").split("%").join("").split("_").join("")
}

function drawLinks(links,nodes,svg){
	var linkPath = d3.line()//.curve(d3.curveBasis)	
	
	// console.log(links)
// 	console.log(nodes)
	for(var l in links){
		var link = links[l]
		var source = link.source
		var target = link.target
		if(source!=undefined && target!=undefined){
		//console.log(source,cleanString(target))
			var sourceX = nodesDictionary[cleanString(source)].x
			var sourceY = nodesDictionary[cleanString(source)].y
			var targetX = nodesDictionary[cleanString(target)].x
			var targetY = nodesDictionary[cleanString(target)].y
			// console.log([target])
// 			console.log(nodes)
// 			console.log(targetCoords)
			var lineData = [[sourceX*spaceX+w/2,sourceY*spaceY+spaceY*2],[targetX*spaceX+w/2,targetY*spaceY+spaceY*2]]
			
			
		//	console.log(lineData)
			var path = svg//.append("g")//.selectAll("#_"+cleanString(source)+"_"+cleanString(target))
			.append("path")
			.attr("id","_"+cleanString(source)+"_"+cleanString(target))
			.attr("d",function(){
 					return linkPath(lineData)
			})
			.attr('stroke', colors[nodesDictionary[cleanString(source)].colorClass])
			
			var pathLength = path.node().getTotalLength();			
			path.attr("pathLength",pathLength)
			//.attr("stroke-dasharray", "2 5")
			//.attr("stroke-dasharray",pathLength+" "+pathLength)//pathLength + " " + pathLength)
			//.attr("stroke-dashoffset",pathLength)
			//.attr("stroke-dashoffset",0)
		}
	}
}