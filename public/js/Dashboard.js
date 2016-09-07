queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
	
//Start Transformations
	var dataSet = apiData;
	console.log(dataSet);
	/*var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		d.date_posted = dateFormat.parse(d.date_posted);
				d.date_posted.setDate(1);
		d.total_donations = +d.total_donations;
	});
*/
	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	
	var month = ndx.dimension(function(d) { return d.case_resolved_month; });
	var duration = ndx.dimension(function(d) { return d.duration; });
	var origin = ndx.dimension(function(d) { return d.case_origin; });
	var catTier1 = ndx.dimension(function(d) { return d.cat_tier_1; });
	var catTier2 = ndx.dimension(function(d) { return d.cat_tier_2; });
	var catTier3 = ndx.dimension(function(d) { return d.cat_tier_3; });
    /*
	var datePosted = ndx.dimension(function(d) { return d.date_posted; });
	var gradeLevel = ndx.dimension(function(d) { return d.grade_level; });
	var resourceType = ndx.dimension(function(d) { return d.resource_type; });
	var fundingStatus = ndx.dimension(function(d) { return d.funding_status; });
	var povertyLevel = ndx.dimension(function(d) { return d.poverty_level; });
	var state = ndx.dimension(function(d) { return d.school_state; });
	var totalDonations  = ndx.dimension(function(d) { return d.total_donations; });
*/

	//Calculate metrics
	
	var casesByMonth = month.group();
	var casesByDuration = duration.group();
	var casesByOrigin = origin.group();
	var casesByCat1 = catTier1.group();
	var casesByCat2 = catTier2.group();
	var casesByCat3 = catTier3.group();
	var casesByDurHist = duration.group().reduceCount();

	/*
	var projectsByDate = datePosted.group(); 
	var projectsByGrade = gradeLevel.group(); 
	var projectsByResourceType = resourceType.group();
	var projectsByFundingStatus = fundingStatus.group();
	var projectsByPovertyLevel = povertyLevel.group();
	var stateGroup = state.group();
    */
	var all = ndx.groupAll();

	//Calculate Groups
	var totalDurationByCat1 = catTier1.group().reduceSum(function(d) {
		return d.duration;
	}); 

	var netTotalDuration = ndx.groupAll().reduceSum(function(d) {return d.duration;});
/*
	var totalDonationsState = state.group().reduceSum(function(d) {
		return d.total_donations;
	});

	var totalDonationsG	rade = gradeLevel.group().reduceSum(function(d) {
		return d.grade_level;
	});

	var totalDonationsFundingStatus = fundingStatus.group().reduceSum(function(d) {
		return d.funding_status;
	});



	var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});
*/
	//Define threshold values for data
//	var minDate = datePosted.bottom(1)[0].date_posted;
//	var maxDate = datePosted.top(1)[0].date_posted;

//console.log(minDate);
//console.log(maxDate);

    //Charts
	/*
	var dateChart = dc.lineChart("#date-chart");
	var gradeLevelChart = dc.rowChart("#grade-chart");
	var resourceTypeChart = dc.rowChart("#resource-chart");
	var fundingStatusChart = dc.pieChart("#funding-chart");
	var povertyLevelChart = dc.rowChart("#poverty-chart");
	var totalProjects = dc.numberDisplay("#total-projects");
	var netDonations = dc.numberDisplay("#net-donations");
	var stateDonations = dc.barChart("#state-donations");
*/
	var originChart = dc.pieChart("#origin-chart");
	var durationCountChart = dc.barChart("#duration-count");
	var categoryChartTier1 = dc.rowChart("#category-tier-1");
	var categoryChartTier2 = dc.rowChart("#category-tier-2");
	var categoryChartTier3 = dc.rowChart("#category-tier-3");

  selectField = dc.selectMenu('#menuselect')
        .dimension(origin)
        .group(casesByOrigin); 
          
	 dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);

		  originChart
            .height(220)
            //.width(350)
            .radius(90)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(origin)
            .group(casesByOrigin);
    
  durationCountChart
  	.dimension(duration)
    .group(casesByDurHist)
	.x(d3.scale.linear().domain([0,10]))
	.elasticY(true)
	.elasticX(true);
	
durationCountChart.yAxis().tickFormat(d3.format("s"));
durationCountChart.xAxis().tickValues([1,5,10,15,20]);


categoryChartTier1
	.dimension(catTier1)
	.group(casesByCat1)
    .elasticX(true)
	.height(500)
	.cap(20)
        .ordering(function(d) { return -d.value });

categoryChartTier2
	.dimension(catTier2)
	.group(casesByCat2)
    .elasticX(true)
	.height(2500)
    .ordering(function(d) { return -d.value });

categoryChartTier3
	.dimension(catTier3)
	.group(casesByCat3)
    .elasticX(true)
	.height(4500)
    .ordering(function(d) { return -d.value });
	
/*
	durationCountChart
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(duration)
        .group(casesByDurHist)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(casesByDurHist))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
		.controlsUseVisibility(true)
        .yAxis().tickFormat(d3.format("s"));

	totalProjects
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	netDonations
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotalDonations)
		.formatNumber(d3.format(".3s"));

	dateChart
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		.group(projectsByDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);

	resourceTypeChart
        //.width(300)
        .height(220)
        .dimension(resourceType)
        .group(projectsByResourceType)
        .elasticX(true)
        .xAxis().ticks(5);

	povertyLevelChart
		//.width(300)
		.height(220)
        .dimension(povertyLevel)
        .group(projectsByPovertyLevel)
        .xAxis().ticks(4);

	gradeLevelChart
		//.width(300)
		.height(220)
        .dimension(gradeLevel)
        .group(projectsByGrade)
        .xAxis().ticks(4);

  
          fundingStatusChart
            .height(220)
            //.width(350)
            .radius(90)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(fundingStatus)
            .group(projectsByFundingStatus);


    stateDonations
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(state)
        .group(totalDonationsState)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(state))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .yAxis().tickFormat(d3.format("s"));
*/





    dc.renderAll();

};
