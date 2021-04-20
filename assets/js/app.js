// ======================================================================== 
// Create a function that automatically rezise the chart/ responsive chart. 
// ======================================================================== 
// makeResponsive();

function makeResponsive() {

    // Select the SVG area
    var svgArea =d3.select("body").select("svg");

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // ============================================================================
    // Set up Chart dimentions by the current width & height of the browser window.
    // ============================================================================

    // var svgWidth = parseFloat(d3.select('#scatter').style('width'));
    // var svgHeight = .70*svgWidth;
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight / 1.5;

    // Margins
    var margin = {
        top: 50,
        right: 200,
        bottom: 110,
        left: 150
    };

    // Chart dimentions
    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    // Create svg container
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append chart group to the svg and move it to the top left
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // ==========================
    // Import data from csv file 
    // ==========================

    d3.csv("assets/data/data.csv").then(censusData => {
        
        // Step 1: Parse data to convert to numerical values
        // =================================================
        censusData.forEach(data => {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });
    
        // Step 2: Create x & y Scale parameters 
        // =====================================

        var chosenXAxis = "poverty";
        var chosenYAxis = "healthcare";

        var activelabels = d3.select(`#${chosenXAxis}-${chosenYAxis}`); //initial active info
        activelabels.style("display", "block");
        
        var xLinearScale = d3.scaleLinear()
        .domain(domainX(censusData, chosenXAxis))
        .range([0, chartWidth]);

        var yLinearScale = d3.scaleLinear()
        .domain(domainY(censusData, chosenYAxis))
        .range([chartHeight, 0]);

        // Step 3: Create axis function
        // ================================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append axes to the chartgroup
        // ================================
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Step 5: Create x and y lables
        // =============================
        var xLabel = chartGroup.append("g").attr('transform',`translate(${chartWidth/2},${chartHeight*1.12})`)
        var yLabel = chartGroup.append("g").attr('transform',`translate(0,${chartHeight/2})rotate(-90)`)
        
        // x and y Axis labels - 1
        // ---------------------------
        var poverty = xLabel.append("text")
            .attr('y', 5)
            .text("In Poverty (%)")
            .attr("class", "x-Axis label aText active")
            .attr("value", "poverty");

        var healthcare = yLabel.append("text")
            .attr('y', -25)
            .text("Lacks HealthCare (%)")
            .attr("value", "healthcare")
            .attr("class", "y-Axis label aText active");

        // x and y Axis labels - 2
        // ---------------------------
        var age = xLabel.append("text")
            .attr('y', 20)
            .text("Age (Median)")
            .attr("value", "age")
            .attr("class", "x-Axis label aText inactive")

        var smokes = yLabel.append("text")
            .attr('y', -39)
            .attr("class", "y-Axis label aText inactive")
            .attr("value", "smokes")
            .text("Smokes (%)");

        // x and y Axis labels - 3
        // ---------------------------
        var income = xLabel.append("text")
            .attr('y', 37)
            .attr("class", "x-Axis label aText inactive ")
            .attr("value", "income")
            .text("HouseHold Income (Median)");

        var obese = yLabel.append("text")
            .attr('y', -55)
            .attr("class", "y-Axis label aText inactive")
            .attr("value", "obesity")
            .text("obese (%)");


        // Step 6: Create Circles and append data points
        // ==============================================
        var circlesGroup = chartGroup.append("g")
            .selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r",10)
            .attr("fill", "black")
            .attr("opacity", "0.9")
            .classed("stateCircle", true);
        
        var stateLabels = chartGroup.append("g")
            .selectAll("text")
            .data(censusData)
            .enter()
            .append("text")
            .style("fill", "white")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]) - 5)
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .classed("stateText", true)
            .text(d => d.abbr);

        // Call update tooltip function
        updateTooltip(chosenXAxis, chosenYAxis, circlesGroup, stateLabels);

        // Step 7: Create event listener for axes change
        // ======================================
        xLabel.selectAll("text").on("click", function () {
            
            // Store clicked values
            var xAxisVal = d3.select(this).attr("value");

            if (xAxisVal !== chosenXAxis) {

                activelabels.style("display", "none") //to hide current info label

                chosenXAxis = xAxisVal;

                // create new xLinearScale domain and update
                xLinearScale.domain(domainX(censusData, chosenXAxis));

                //update new x Axis scale
                updateXAxis(xLinearScale, xAxis); 

                // Now update circles, statelabels and tooltip
                updatePlot(circlesGroup, stateLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                updateTooltip(chosenXAxis, chosenYAxis, circlesGroup, stateLabels);

                // Now switch statement for updating clicked statement active and others inactive
                switch (chosenXAxis) {
                    case "poverty":
                        poverty.attr("class", "active");
                        age.attr("class", "inactive");
                        income.attr("class", "inactive");
                        activelabels = d3.select(`#${chosenXAxis}-${chosenYAxis}`);
                        activelabels.style("display", "block");
                        break;

                    case "age": 
                        age.attr("class", "active");
                        poverty.attr("class", "inactive");
                        income.attr("class", "inactive");
                        activelabels = d3.select(`#${chosenXAxis}-${chosenYAxis}`);
                        activelabels.style("display", "block");
                        break;

                    case "income": 
                        income.attr("class", "active");
                        poverty.attr("class", "inactive");
                        age.attr("class", "inactive");
                        activelabels = d3.select(`#${chosenXAxis}-${chosenYAxis}`);
                        activelabels.style("display", "block");
                        break;
                
                    default:
                        break;
                };
            };
        });

        // On clicking Y-axis-Labels
        yLabel.selectAll("text").on("click", function () {
            
            // Store clicked values
            var yAxisVal = d3.select(this).attr("value");

            if (yAxisVal !== chosenYAxis) {
                
                // Hide current info label
                activelabels.style("display", "block");

                // Assign new value to y Axis
                chosenYAxis = yAxisVal;

                // Create new yLinearScale and update
                yLinearScale.domain(domainY(censusData, chosenYAxis));

                // update y Axis label
                updateYAxis(yLinearScale, yAxis);

                // Now update circles, statelabels and tooltip
                updatePlot(circlesGroup, stateLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                updateTooltip(chosenXAxis, chosenYAxis, circlesGroup, stateLabels);

                // Now switch statement for updating clicked statement active and others inactive
                switch (chosenYAxis) {
                    case "healthcare":
                        healthcare.attr("class", "active");
                        smokes.attr("class", "inactive");
                        obese.attr("class", "inactive");
                        activelabels = d3.select(`#${chosenXAxis}-${chosenYAxis}`);
                        activelabels.style("display", "block");
                        break;

                    case "smokes":
                        smokes.attr("class", "active");
                        healthcare.attr("class", "inactive");
                        obese.attr("class", "inactive");
                        activelabels = d3.select(`#${chosenXAxis}-${chosenYAxis}`);
                        activelabels.style("display", "block");
                        break;

                    case "obesity":
                        obese.attr("class", "active");
                        smokes.attr("class", "inactive");
                        healthcare.attr("class", "inactive");
                        activelabels = d3.select(`#${chosenXAxis}-${chosenYAxis}`);
                        activelabels.style("display", "block");
                        break;    
                
                    default:
                        break;
                };
            };
        }); 
    
    }).catch(function (error) {
        console.log(error);
    });

};


// Step 8: Function to find x and y scale for domain
// =================================================
function domainX(dataset, factor) {
    var domain = d3.extent(dataset, data => data[factor]);
    return domain;
};

function domainY(dataset, factor) {
    var maxVal = d3.max(dataset, data => data[factor]);
    var domain = [0, maxVal];
    return domain;
};

// Now create transition update function
function updateXAxis(xLinearScale, xAxis) {
    var newXAxis = d3.axisBottom(xLinearScale);

    // Transition from old to new axis
    xAxis.transition()
        .duration(1000)
        .call(newXAxis);
};

function updateYAxis(yLinearScale, yAxis) {
    var newYAxis = d3.axisLeft(yLinearScale);

    // Transition from old to new axis
    yAxis.transition()
        .duration(1000)
        .call(newYAxis);
};

// Function to update scatter plot
function updatePlot(circlesGroup, stateLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis) {
    
    // Transition new circlesGroup by changing position according to new values.
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]));

    // Transition new stateLabels by changing position according to new values.
    stateLabels.transition()
        .duration(1000)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]) + 3.5)
};

// Step 9: Function to update Tooltip
// ==================================
function updateTooltip(chosenXAxis, chosenYAxis, circlesGroup, stateLabels) {
    
    // Create variable for Tooltip
    var toolTipX = "";
    var toolTipY = "";
    var unitX = "";
    var unitY = "%";

    // Switch statement for xAxis values
    switch (chosenXAxis) {
        case "poverty":
            toolTipX = "Poverty";
            unitX = "%";
            break;

        case "age":
            toolTipX = "Age";
            // unitX = "%";
            break;

        case "income":
            toolTipX = "Household Income";
            // unitX = "%";
            break;
    
        default:
            break;
    }

    // Switch statement for yAxis values
    switch (chosenYAxis) {
        case "healthcare":
            toolTipY = "Lacks Healthcare";
            unitY = "%";
            break;

        case "smokes":
            toolTipY = "Smokes";
            unitY = "%";
            break;

        case "obesity":
            toolTipY = "Obesity";
            unitY = "%";
            break;
    
        default:
            break;
    };

    // Step 10: Initialize tooltip
    // ====================================
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -80]) 
        .html(function (d) {
        return(`<strong>${d.state}</strong><br>${toolTipX}: ${d[chosenXAxis]}${unitX}<br>${toolTipY}: ${d[chosenYAxis]}${unitY}`);  
        });

    // Step 11: Create tooltip in the chart
    // ====================================
    circlesGroup.call(toolTip);
    stateLabels.call(toolTip);

    // Create event Listener to hide and display tooltip
    // =================================================
    circlesGroup.on("mouseover", d => {
            toolTip.show(d, this);
        })
        .on("mouseout", d => {
            toolTip.hide(d);
        });

    stateLabels.on("mouseover", d => {
            toolTip.show(d, this)
        })
        .on("mouseout", d => {
            toolTip.hide(d);
    });
    
};

makeResponsive();
