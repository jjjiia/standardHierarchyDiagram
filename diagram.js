//change to click to see geo
//layout = population and land
//most
//no pop
//

var files = ["s_block_groups.csv",
"s_census_tracts.csv",
"s_county_subdivisions.csv",
"s_counties.csv",
"s_divisions.csv",
"s_nation.csv",
"s_places.csv",
"s_regions.csv",
"s_school_districts.csv",
"s_state_legislative_districts.csv",
"s_states.csv",
// "s_state_legislative_district_upper.csv",
"s_subminor_civil_divisions.csv",
"s_urban_areas.csv",
"s_ZIP_Code_Tabulation_Areas.csv"]
var colors = {
	nation:"#000",  
	regions:"#7368d3",
	divisions:"#bf50ce",
	states:"#48b263",
	counties:"#cd5136",
	tracts:"#48b263",
	groups:"#4bbbb1",
	blocks:"#333",
	subminor:"#cd5136",
	blank:"#000"
}
var fileNameToColor = {
	nation:"nation",
	ZIP_Code_Tabulation_Areas:"regions",
	urban_areas: "regions",
	school_districts: "states",
	state_legislative_districts: "states",
	counties:"counties",
	places: "states",
	regions:"regions",
	county_subdivisions: "counties",
	divisions:"divisions",
	block_groups:"groups",
	census_tracts: "tracts",
	subminor_civil_divisions:"subminor",
	states:"states"
}
//Congressional_Districts,435,761179,NA,761179,NA
var nodesDictionary = {}

var filesPromises =[]
for(var f in files){
	filesPromises.push(d3.csv(files[f]))
}
// cons

var promises = [d3.csv("labels.csv"),d3.csv("maxmin.csv"),d3.csv("links.csv"),d3.csv("histo.csv")].concat(filesPromises)
// for(var f in files){
// 	promises.push(d3.csv(files[f]))
// }
var w = 750
var h = 900
var spaceX = 38
var spaceY = 70

Promise.all(promises)
.then(function(data){
	ready(data)
})
var maxLimit = {
	ZIP_Code_Tabulation_Areas:130000,
	urban_areas: 2500000,
	school_districts: 1000000,
	state_legislative_districts: 550000,
	counties: 2500000,
	places: 1000000,
	county_subdivisions: 1200000,

	block_groups:20000,
	census_tracts: 20000,
	subminor_civil_divisions:20000 ,
	states:20000000
}

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
	//console.log(nodesDictionary)
	//var maxMinDictionary = {}
	for(var m in maxMin){
		if(maxMin[m].geo!=undefined){
			var nodeName = cleanString(maxMin[m].geo)
			//console.log(nodeName)
			if(Object.keys(nodesDictionary).indexOf(nodeName)>-1){
				nodesDictionary[nodeName]["maxMin"]=maxMin[m]
			}
			//console.log(nodeName)
		}
	}
	//console.log(nodesDictionary)
	
	drawLinks(links,nodes,svg)
	drawDiagram(nodes,maxMin,svg)
	//drawChart(data[3])
	// console.log(data)
	// console.log(maxMin)
	var scatterLayers = ["regions","divisions","states"]
	
	
	var histoData = data[3]
	
	for(var i in histoData){
		
		if(scatterLayers.indexOf(histoData[i].geo)>-1){
			var geo = histoData[i].geo
			var chartColor = colors[geo]
			
			var scatterData = data[files.indexOf("s_"+histoData[i].geo+".csv")+4]
			drawScatter(scatterData,geo,chartColor)
			
		}else if(histoData[i].geo=="nation"){
			drawNation(histoData)
		}else if(histoData[i].bins!=undefined ){
			var chartColor = colors[fileNameToColor[histoData[i].geo]]
			drawChart(histoData[i],600,40,300,chartColor)
		}
	}
	
	d3.selectAll("#nation").style("display","block")
}
function drawNation(data){
	//console.log(data)
	var w = 400
	var h = 700
	var p = 60
	var barH = 40
	var nationDiv = d3.select("#detail").append("div").attr("id","nation").attr("class","detailChart")
	var nationTitle = nationDiv.append("div").html("Overview of population range for each geography")
	var nationSvg = nationDiv.append("svg").attr("width",w+p*7).attr("height",h)
	
	var xScale = d3.scaleLinear().domain([0,parseInt(data[0].max)]).range([5,w])
	var xAxis = d3.axisTop().scale(xScale).ticks(4)
	nationSvg.append("g").call(xAxis).attr("transform","translate("+p*4+","+(p-10)+")")
	
	nationSvg.selectAll(".nationBars")
	.data(data)
	.enter()
	.append("rect")
	.attr("x",function(d){
		if(d.geo=="nation"){
			return 0
		}
		return xScale(parseInt(d.min))
	})
	.attr("y",function(d,i){return i*barH+barH/8-1})
	.attr("height",function(d,i){return 2})//barH/4})
	.attr("width",function(d,i){
		if(d.geo=="nation"){
			return xScale(parseInt(d.max))
		}
		//console.log(parseInt(d.max)-parseInt(d.min))
		return xScale(parseInt(d.max)-parseInt(d.min))+5
	})
	.attr("transform","translate("+p*4+","+p+")")
	.attr("fill",function(d){
		return colors[fileNameToColor[d.geo]]
	})
	
	nationSvg.selectAll(".nationBars")
	.data(data)
	.enter()
	.append("circle")
	.attr("cx",function(d){
		if(d.geo=="nation"){
			return 0
		}
		return xScale(parseInt(d.min))
	})
	.attr("cy",function(d,i){return i*barH+barH/8})
	.attr("r",3)
	// .attr("height",function(d,i){return barH/4})
// 	.attr("width",function(d,i){
// 		return 2
// 		if(d.geo=="nation"){
// 			return xScale(parseInt(d.max))
// 		}
// 		//console.log(parseInt(d.max)-parseInt(d.min))
// 		return xScale(parseInt(d.max)-parseInt(d.min))
// 	})
	.attr("transform","translate("+p*4+","+p+")")
	.attr("fill",function(d){
		return colors[fileNameToColor[d.geo]]
	})
	
	nationSvg.selectAll(".nationBars")
	.data(data)
	.enter()
	.append("circle")
	.attr("cx",function(d){
		 if(d.geo=="nation"){
 			return xScale(parseInt(d.max))
 		}
		return xScale(parseInt(d.max))+10
	})
	.attr("cy",function(d,i){return i*barH+barH/8})
	.attr("r",3)
	// .attr("height",function(d,i){return barH/4})
// 	.attr("width",function(d,i){
// 		return 2
// 		if(d.geo=="nation"){
// 			return xScale(parseInt(d.max))
// 		}
// 		//console.log(parseInt(d.max)-parseInt(d.min))
// 		return xScale(parseInt(d.max)-parseInt(d.min))
// 	})
	.attr("transform","translate("+p*4+","+p+")")
	.attr("fill",function(d){
		return colors[fileNameToColor[d.geo]]
	})
	
	
	nationSvg.selectAll(".nationLabel")
	.data(data)
	.enter()
	.append("text")
	.attr("class","nationLabel _5")
	.attr("x",function(d){
		if(d.geo=="nation"){
			return xScale(parseInt(d.max))+15
		}
		return xScale(parseInt(d.max))+20
	})
	.attr("y",function(d,i){return i*barH+barH/4})
	.text(function(d,i){
		var min = numberWithCommas(d.min)
		var max = numberWithCommas(d.max)
		var geo = d.geo.split("_").join(" ")
		if(d.geo=="nation"){
			return "with "+ max+" residents"
		}
		return "each with "+min+" to "+max+" residents"
	})
	.attr("transform","translate("+p*4+","+p+")")
	.attr("fill",function(d){
		return colors[fileNameToColor[d.geo]]
	})
	.attr("opacity",.5)
	
	nationSvg.selectAll(".nationGeoLabel")
	.data(data)
	.enter()
	.append("text")
	.attr("class","nationGeoLabel _5")
	.attr("x",function(d){
		if(d.geo=="nation"){
			return -5
		}
		return xScale(parseInt(d.min))-5
	})
	.attr("y",function(d,i){return i*barH+barH/4})
	.text(function(d,i){
		var min = numberWithCommas(d.min)
		var max = numberWithCommas(d.max)
		var geo = d.geo.split("_").join(" ")
		return geo
	})
	.attr("transform","translate("+p*4+","+p+")")
	.attr("fill",function(d){
		return colors[fileNameToColor[d.geo]]
	})
	.style("text-anchor","end")
}

function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


function drawScatter(data,geo,chartColor){
	//console.log(chartColor)
	var scatterW = 500
	var scatterH = 300
	var scatterP = 80
	var maxPop = d3.max(data, function(d) {return parseInt(d["population"]); })
	var maxArea = d3.max(data, function(d) {return parseFloat(d["area"]); })

	//console.log(maxPop,maxArea)
	var scatterDiv = d3.select("#detail").append("div").attr("id",cleanString(geo))
	.attr("class","detailChart")
	var titleDiv = scatterDiv.append("div").html(geo)
	var scatterSvg = scatterDiv.append('svg')
	.attr("width",scatterW+scatterP*3)
	.attr("height",scatterH+scatterP*2)
	
	
	scatterSvg.append("text").text("population").attr("x",scatterW/2)
	.attr("y",scatterH+scatterP*1.5)
	
	scatterSvg.append("text").text("area").attr("x",0).attr("y",0)
	.attr("transform","rotate(90) translate("+scatterP*2+","+(-scatterP*.2)+")")
	
	
	if(geo=="states"){
		var xScale = d3.scaleSqrt().domain([0,maxPop]).range([0,scatterW])
		var yScale = d3.scaleSqrt().domain([0,maxArea]).range([scatterH,0])	
	}
	else{
		var xScale = d3.scaleLinear().domain([0,maxPop]).range([0,scatterW])
		var yScale = d3.scaleLinear().domain([0,maxArea]).range([scatterH,0])
	}
	
	
	var xAxis = d3.axisBottom().scale(xScale).ticks(5)
	scatterSvg.append("g").call(xAxis).attr("transform","translate("+scatterP+","+(scatterH+scatterP)+")")
	
	var yAxis = d3.axisLeft().scale(yScale).ticks(6)
	scatterSvg.append("g").call(yAxis).attr("transform","translate("+scatterP+","+scatterP+")")
	
	scatterSvg.selectAll("circle")
	.data(data)
	.enter()
	.append("circle")
	.attr("r",6)
	.attr("cx",function(d,i){return xScale(parseInt(d.population))})
	.attr("cy",function(d,i){return yScale(parseFloat(d.area))})
	.attr("opacity",.5)
	.attr("fill",chartColor)
	.attr("transform","translate("+scatterP+","+scatterP+")")
		.style("cursor","pointer")
	.on("mouseover",function(e,d){
			d3.select(this).attr("opacity",1)
			d3.select("#chartPopup")
		.html(d.name+"<br>"+numberWithCommas(d.population)
		+" residents<br>"+numberWithCommas(d.area)+" sq. miles")
			.style("left",(event.clientX+10)+"px")
			.style("top",(event.clientY+10)+"px")
			.style("visibility","visible")
	})
	.on("mouseout",function(e,d){
			d3.select(this).attr("opacity",.5)
		d3.select("#chartPopup").style("visibility","hidden")
	})
	if(geo!="states"){
		scatterSvg.selectAll(".regionText")
		.data(data)
		.enter()
		.append("text")
		.attr("class","regionText")
		.text(function(d){return d.name})
		.attr("x",function(d,i){return xScale(parseInt(d.population))})
		.attr("y",function(d,i){return yScale(parseFloat(d.area))+15})
		.style("font-size","11px")
		.style("text-anchor","middle")
		.attr("opacity",1)
		.attr("fill",chartColor)
		.attr("transform","translate("+scatterP+","+scatterP+")")
		.style("cursor","pointer")
		
		.on("mouseover",function(e,d){
			d3.select(this).attr("opacity",1)
			d3.select("#chartPopup")
			.html(d.name+"<br>"+numberWithCommas(d.population)
			+" residents<br>"+numberWithCommas(d.area)+" sq. miles")
			.style("left",(event.clientX+10)+"px")
			.style("top",(event.clientY+10)+"px")
			.style("visibility","visible")
		})
		.on("mouseout",function(e,d){
			d3.select(this).attr("opacity",.5)
			d3.select("#chartPopup").style("visibility","hidden")
		})
	}
	
	
	
	
}

function drawChart(data, w, p, ch, chartColor){
	// var w = 600
	// var p = 40
	// var ch = 300
	var barInterval = data.interval
	// for(var i in data){
		// 		var chartColor = colors[fileNameToColor[data[i].geo]]
		// 		if(data[i].bins!=undefined && data[i].geo!="nation" && data[i].geo!="regions" && data[i].geo!="states"&& data[i].geo!="divisions"){
		var histoData = data.bins.replace("[[","").replace("]]","").split("\'").join("").split("], [")
			//console.log(histoData)
			var histoDataArray = []
			for(var h in histoData){
				var bin = histoData[h].split(",")
				histoDataArray.push(bin)
			}
			var min = d3.min(histoDataArray, function(d) {return parseInt(d[1]); })
			var max = d3.max(histoDataArray, function(d) {return parseInt(d[1]); })
			// console.log(histoDataArray)
	// 		console.log(min,max)
	//
	// 		console.log(data[i].min)
	// 		console.log(data[i].max)
			
			var barW = 8//w/histoDataArray.length+1
			var geo = data.geo
			
			var chartDiv = d3.select("#detail").append("div").attr("id",cleanString(geo))
			.attr("class","detailChart")
			var titleDiv = chartDiv.append("div").html(geo.split("_").join(" "))
			var chartSvg = chartDiv.append("svg").attr("width",w+p*2).attr("height",ch+p*2)
			var yScale = d3.scaleSqrt().domain([1,max]).range([5,ch])
			var yScaleFlip= d3.scaleSqrt().domain([max,1]).range([1,ch])
			
			var xScale = d3.scaleLinear().domain([0,maxLimit[geo]]).range([0,w-p*2])
			
			
			
			var yAxis = d3.axisLeft().scale(yScaleFlip).ticks(3)
			chartSvg.append("g").call(yAxis).attr("transform","translate("+p*2+","+p+")")
			
			var xAxis = d3.axisBottom().scale(xScale).ticks(5)
			chartSvg.append("g").call(xAxis).attr("transform","translate("+p*2+","+(ch+p)+")")
			// var xAxis =
			chartSvg.append("text").text("population").attr("x",w/2).attr("y",ch+p*1.8)
			chartSvg.append("text").text("# of "+data.geo.split("_").join(" ")).attr("x",0).attr("y",0)
			.attr("transform","rotate(90) translate("+p+","+(-p*.5)+")")
			
			var pastMax =0
			
			chartSvg.selectAll(".bars_"+geo)
			.data(histoDataArray)
			.enter()
			.append("rect")
			.attr("x",function(d){
				//console.log(data.interval)
				var bin = d[0].replace("_","")
				var pop = bin*data.interval
				if(pop>maxLimit[geo]){
					pastMax+=parseInt(d[1])
				}
				return xScale(pop)
			})
			.attr("y",function(d,i){return ch-yScale(parseInt(d[1]))})
			.attr("width",barW)
			.attr("height",function(d,i){return yScale(parseInt(d[1]))})
			.attr("opacity",.5)
			.attr("fill",function(d,i){
				return chartColor
			})
			.attr("transform","translate("+p*2+","+p+")")
			.style("cursor","pointer")
			.on("mouseover",function(e,d){
				d3.select(this).attr("opacity",1)

				var bin =parseInt(d[0].replace("_",""))
				var maxValue = numberWithCommas(parseInt(bin*barInterval)+parseInt(barInterval))
				var count = numberWithCommas(parseInt(d[1]))
				var minValue = numberWithCommas(bin*barInterval)
				
				d3.select("#chartPopup")
				.html(count+" "+data.geo.split("_").join(" ")+"<br>"
					+"have between "+minValue+" - "+maxValue+" residents")
				.style("left",(event.clientX+10)+"px")
				.style("top",(event.clientY+10)+"px")
				.style("visibility","visible")
			})
			.on("mouseout",function(e,d){
				d3.select(this).attr("opacity",.5)
				d3.select("#chartPopup").style("visibility","hidden")
			})
			//console.log(geo, maxLimit[geo],pastMax)
		//break
	//	}
	//}
}


function drawDiagram(data,maxMinData,svg){
	//console.log(data)	
	svg.append("text").text("Standard Hierarchy of Census GeographicEntities")
	.attr("x",w/2).attr("y",spaceY).attr("text-anchor","middle")
	.style("font-weight",800)
	.style("font-size","18px")
	
	svg.selectAll(".labelOutline")
	.data(data)
	.enter()
	.append("text")
	.attr("class",function(d){
			return "labelOutline _"+d.fontClass
	})
	.attr("id",function(d){
		return cleanString(d.label)+"_outline"
	})
	.text(function(d){
		if(d.colorClass=="blank"){return ""}
		return d.label
	})
	.attr("stroke-width","10px")
	.style("line-cap","round")
	.style("stroke","#fff")
	.style("fill-opacity",0)
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
	.attr("id",function(d){
		return cleanString(d.label)
	})
	.text(function(d){
		if(d.colorClass=="blank"){return ""}
		return d.label
	})
	.attr("x",function(d,i){ return d.x*spaceX+w/2})
	.attr("y",function(d){return d.y*spaceY+spaceY*2+5})
	.attr("text-anchor",function(d){return d.anchor})
	.style("text-shadow","1px 1px 10px white")
	.attr("fill",function(d){
		if(d["maxMin"]!=undefined){
			return colors[d.colorClass]
		}else{
			return "#000"
		}
	})
	.style("opacity",function(d){
		console.log(d)
		if(d["maxMin"]!=undefined || d["label"]=="nation"){
			return 1
		}else{
			return .5
		}
	})
	.style("cursor",function(d){
	 if(d["maxMin"]!=undefined){
		 return "pointer"
	 }
	})
	.on("click",function(e,d){
		var chartId = cleanString(d.label)
		//console.log(chartId)
		d3.selectAll(".detailChart").style("display","none")
		d3.selectAll("#"+chartId).style("display","block")
		
	})
	 .on("mouseover",function(e,d){
		// console.log(d)
		 if(d["maxMin"]!=undefined){
			 d3.select(this).style("text-shadow","2px 2px 2px gold")
		 }
	 })
	 .on("mouseout",function(e,d){
		d3.select(this).style("text-shadow","1px 1px 8px white")
	 	
	 })
	// 		var string = ""
	// 		if(d["maxMin"]!=undefined){
	// 			var itemId = d3.select(this).attr("id")
	// 			d3.select("#"+itemId+"_outline").style("stroke","gold")
	// 			//console.log(d)
	// 			if(d.label=="NATION"){
	// 				string+="Population:"+parseInt(d.maxMin.maxPop).toLocaleString("en-US")+"<br>"
	//
	// 			}else{
	// 				string+=d.maxMin.count
	// 				+" "+d.label+"<br><br>Minimum Population: <br> "+parseInt(d.maxMin.minPop).toLocaleString("en-US")+"<br>"+d.maxMin.minPopName
	// 				+"<br><br>Maximum Population "+d.label+": <br>"+parseInt(d.maxMin.maxPop).toLocaleString("en-US")+"<br>"+" - "+d.maxMin.maxPopName+"<br>"
	// 			}
	// 			d3.select("#detail").html(string)
	// 		}
	// 	})
	// 	.on("mouseout",function(e,d){
	// 			d3.select("#detail").html("")
	//
	// 			var itemId = d3.select(this).attr("id")
	// 			d3.select("#"+itemId+"_outline").style("stroke","white")
	// 	})
	
	
	// svg.selectAll(".count_outline")
// 	.data(data)
// 	.enter()
// 	.append("text")
// 	.attr("class",function(d){
// 			return "count_outline"
// 	})
// 	.text(function(d){
// 		if(d["maxMin"]!=undefined){
// 			return parseInt(d.maxMin.count).toLocaleString("en-US")
// 		}
// 	})
// 	.style("font-size","14px")
//
// 	.attr("stroke-width","5px")
// 	.style("stroke","#fff")
// 	.attr("x",function(d,i){ return d.x*spaceX+w/2})
// 	.attr("y",function(d){return d.y*spaceY+spaceY*2+18})
// 	.attr("text-anchor",function(d){return d.anchor})
//
//
// 	svg.selectAll(".count")
// 	.data(data)
// 	.enter()
// 	.append("text")
// 	.attr("class",function(d){
// 			return "count"
// 	})
// 	.text(function(d){
// 		if(d["maxMin"]!=undefined){
// 			//console.log(d)
// 			return parseInt(d.maxMin.count).toLocaleString("en-US")
// 		}
// 	})
// 	.style("font-size","14px")
// 	.attr("x",function(d,i){ return d.x*spaceX+w/2})
// 	.attr("y",function(d){return d.y*spaceY+spaceY*2+18})
// 	.attr("text-anchor",function(d){return d.anchor})
// 	.attr("fill",function(d){return colors[d.colorClass]})
	
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
			.attr('stroke', function(){
				if(nodesDictionary[cleanString(target)]["maxMin"]==undefined ||nodesDictionary[cleanString(source)]["maxMin"]==undefined){
					return "#aaa"
				}
				return colors[nodesDictionary[cleanString(source)].colorClass]
			})
			.style("opacity",function(){
				if(nodesDictionary[cleanString(target)]["maxMin"]!=undefined){
					return 1
				}else{
					return .5
				}
			})
			
			
			var pathLength = path.node().getTotalLength();			
			path.attr("pathLength",pathLength)
			//.attr("stroke-dasharray", "2 5")
			//.attr("stroke-dasharray",pathLength+" "+pathLength)//pathLength + " " + pathLength)
			//.attr("stroke-dashoffset",pathLength)
			//.attr("stroke-dashoffset",0)
		}
	}
}