/*Scatter Plot visualization project*/

//Source Dataset - https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json

//Font Awesome CSS - https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css
//Bootstrap CSS - https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css
//Bootstrap JS - https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js
//D3 Datavisualization Library - https://d3js.org/d3.v5.min.js
//Testing JS - https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js

document.addEventListener('DOMContentLoaded',function() {
  var url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
  req=new XMLHttpRequest();
  req.open("GET",url,true);
  req.send();
  req.onload=function(){
	  
	  
	var dataset=JSON.parse(req.responseText);		//Read file data
	
	
  /* Expected format: JSON Array with these object pairs
  {[  
	{
		"Time": "36:50",
		"Place": 1,
		"Seconds": 2210,
		"Name": "Marco Pantani",
		"Year": 1995,
		"Nationality": "ITA",
		"Doping": "Alleged drug use during 1995 due to high hematocrit levels",
		"URL": "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
	}
  ]}*/
	
	//Sample small data set for testing
	//json = JSON.parse('{[{"Time": "36:50","Place": 1,"Seconds": 2210,"Name": "Marco Pantani","Year": 1995,"Nationality": "ITA","Doping": "Alleged drug use during 1995 due to high hematocrit levels","URL": "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"}]}');  	
	
	
	//We will make the time and year JS date objects, All the other fields can be interpretted as text
	var timeData=[];
	var yearData=[];
	var date;
	for (var i = 0; i<dataset.length; ++i)
	{
		date = new Date(null);
		date.setMinutes(dataset[i].Seconds / 60); // Value for Minutes here
		date.setSeconds(dataset[i].Seconds % 60); // Value for SECONDS here
		timeData.push(date);			//Store time here
		yearData.push(new Date(dataset[i].Year, 1));
		//console.log(dataset[i].Seconds + " - " + dataset[i].Time + " : " + date.toISOString());	//Test output for correct time conversion
		// console.log(dataset[i].Year + " - " + yearData[i].toISOString());	//Test output for correct year conversion
	}
	
	
	const fullwidth = 800;
    const fullheight = 600;
	const padding = 50;

	const width = fullwidth - 2*padding;
    const height = fullheight - 2*padding;
	
	//Get the range we want to display on X axis
	var maxX = d3.max(yearData, (d) => d);
	var minX = d3.min(yearData, (d) => d);
	//console.log("MaxYear: " + maxX + " MinYear: " + minX);	//Test X range
	
	//Get the range we want to display on Y axis
	var maxY = d3.max(timeData, (d) => d);
	var minY = d3.min(timeData, (d) => d);
	//console.log("MaxTime: " + maxY.toISOString() + " MinTime: " + minY.toISOString());	//Test Y range
	
	//Define the X Scale
	var xScale = d3.scaleUtc()
		.domain([minX, maxX])
		.rangeRound([padding, width]) 
		.nice();	
	
	//Define the Y Scale	
	var yScale = d3.scaleUtc()
		.domain([maxY,minY])			//We reverse the Y range because less is better in racing
		.rangeRound([height, padding])
		.nice(); 	
		
   // Define the y and x axis
	var yAxis = d3.axisLeft(yScale);
	var xAxis = d3.axisBottom(xScale);			
		
		
	//Create toolTips DIV
	var toolTips = d3.select("body").append("div")
	  .attr("class", "tooltip")
	  .attr("id", "tooltip")
	  .style("background", "Beige")
	  .style("color", "Black")
	  .style("opacity", 0);	//Hide until mouseover
		
	//Create SVG
	var svg = d3.select("#graph")
		.append("svg")
		.attr("width", fullwidth)
		.attr("height", fullheight);

	// Draw y axis
	svg.append("g")
		.attr("transform", "translate("+padding+",0)")
		.attr("id", "y-axis")
		.call(yAxis
			.tickFormat(d3.utcFormat('%M:%S'))		//Specify showing of time as Minute:Seconds
			.tickPadding(10)
		);


	// Draw x axis 
	svg.append("g")
		.attr("class", "xaxis")   
		.attr("id", "x-axis")
		.attr("transform", "translate(0," + (height) + ")")
		.call(xAxis);

	//Draw data points
	svg.append("g")
		.attr("stroke", "black")
		.attr("stroke-width", 1.5)
		.attr("fill", "none")
		.selectAll("circle")
		.data(dataset)
		.enter().append("circle")
			.attr("cx", (d,i) => xScale(yearData[i]))
			.attr("cy", (d,i) => yScale(timeData[i]))
			.attr("r", 5)
			.attr("class", "dot")   			
			.attr("data-xvalue", (d,i) => yearData[i])   	
			.attr("data-yvalue", (d,i) =>  timeData[i])   				
			.style("fill", function(d) {
				if (d.Doping == "")			//Change fill color based on whether doping occurred or not
				{
					return "steelblue";
				}
				else
				{
					return "red";
				}
			})
			//Tooltip DIV control
			.on("mouseover", function(d,i) {
				toolTips.attr("data-year", yearData[i])
					.html(d.Name + " : " + d.Nationality + "<br/>Year: " + d.Year + " Time: " + d.Time + "<br/>" + d.Doping)
					.style("left", (d3.event.pageX + 15) + "px")
					.style("top", (d3.event.pageY - 50) + "px")
					.style("opacity", .9);
			})
			.on("mouseout", function(d) {
				toolTips.style("opacity", 0);
			})
			.style("opacity", .8);
	
	var legend = svg.selectAll(".legend")
	    .data(dataset)
		.enter().append("g")
		.attr("class", "legend")
		.attr("id", "legend");
		
	
	//Add circles to legend
	legend.append("circle")
			.attr("stroke", "black")
			.attr("stroke-width", 1.5)
			.attr("cx", 0.1 * fullwidth)
			.attr("cy", fullheight - padding)
			.attr("r", 5)
			.attr("fill", "steelblue");
			
	legend.append("circle")
			.attr("stroke", "black")
			.attr("stroke-width", 1.5)
			.attr("cx", 0.3 * fullwidth)
			.attr("cy", fullheight - padding)
			.attr("r", 5)
			.attr("fill", "red");	

	//Add text to legend
	legend.append("text")
		.attr("x", 0.1 * fullwidth + 10)
		.attr("y", fullheight - padding + 5)
		.text("No Doping Allegations");
		
	legend.append("text")
		.attr("x", 0.3 * fullwidth + 10)
		.attr("y", fullheight - padding + 5)
		.text("Riders With Doping Allegations");		


/*
	//Add labels to data points
	svg.append("g")
		.attr("font-family", "sans-serif")
		.attr("font-size", 10)
		.selectAll("text")
		.data(dataset)
		.enter().append("text")
			.attr("x", (d,i) => xScale(yearData[i])+5)
			.attr("y", (d,i) => yScale(timeData[i])+5)
			.text((d,i) => d.Name);	
*/
	};		
		
});
	
	
