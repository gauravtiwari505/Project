var provSelectCount = 0; //made global variable so parallel coord js can read it
//var admDivID = "CC_2";
//var admDivName = "VARNAME_2";
var admDivID = "FIPS_CNTRY"; //adm2code
var admDivName = "CNTRY_NAME"; //

//Vietnam Map Settings
//var north = 18.2;
//var east = 114.5;
//var scale = 2450;
//var north = 18.2;
//var east = 147.8;
//var scale = 450;

//China Map Settings 113.5760, 43.4549
//var north = 43;
//var east = 163;
//var scale = 400;

//Argentina Map Settings
//var north = -34;
//var east = -40;
//var scale = 850;

//Malaysia Map Settings
//var north = 5;
//var east = 110;
//var scale = 2050;

$(document).ready(function(){
    // ======================= Loading the Map ============================
    var mapData;
    var proj;
    var path;
    var t; // the projection's default translation
    var s; // the projection's scale 
    
    var svg;//for the overlay map
    var svg_mi;
    
    var counties;//for the overlay map
    var counties_mi;//for the overlay map
    
    var svg_choro;//for the choropleth map
    var svg_choro_mi;
    
    var choropleth;// for the choropleth map
    var choropleth_mi;// for the choropleth map
    
    // projection centered and zoomed in on the Vietnam data  .parallels([ east, north ])
    //    proj = d3.geo.albers().origin([ 113.8, 18.2 ]).scale(2450);
    //proj = d3.geo.albers().origin([ east, north ]).parallels([ east, north ]).scale(scale);
    //proj = d3.geo.mercator().scale(12000).center([106.5760,15.4549]);//.translate([150,300]);
    proj = d3.geo.mercator().scale(850).center([0,0]);
    // path tags created based on the projection given
    path = d3.geo.path().projection(proj);
    //t = proj.translate(); // the projection's default translation
    //s = 2800 // the projection's default scale 
    
    // appends an svg tag to element id=chart
    svg = d3.select("#choropleth_map")
    .append("svg")
    .attr("class","explorationMap")
    .attr("id","zoom");

    // appends a g tag to the svg element
    counties = svg.append("g")
    .attr("id", "country")
    .attr("class", "choro_map");
    
    //----------------------------------
    svg_choro = d3.select("#choropleth_selector")
    .append("svg")
    .attr("class","explorationMap");

    // appends a g tag to the svg element
    choropleth = svg_choro.append("g")
    .attr("id", "choropleth")
    .attr("class", "Blues");
    //*******************************************
    
    // appends an svg tag to element id=chart
    svg_mi = d3.select("#choropleth_map_mi")
    .append("svg")
    .attr("class","explorationMap")
    .attr("id","zoom");

    // appends a g tag to the svg element
    counties_mi = svg_mi.append("g")
    .attr("id", "counties_mi")
    .attr("class", "choro_map");
    
    //------------------------------------
    svg_choro_mi = d3.select("#choropleth_selector_mi")
    .append("svg")
    .attr("class","explorationMap");

    // appends a g tag to the svg element
    choropleth_mi = svg_choro_mi.append("g")
    .attr("id", "choropleth_mi")
    .attr("class", "Blues");
    //*******************************************    

    d3.json("./map2.geojson", function(json) {
                      
        mapData = json.features;
        
        //*******************************************
        choropleth.selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("title", mapData ? title : null)
        .attr("prov_name", mapData ? title : null)
        .attr("id", mapData ? identify_choro : null)
        .attr("d", path);
        
        //---------------------------------------
                
        counties.selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("title", mapData ? title : null)
        .attr("prov_name", mapData ? title : null)
        .attr("id", mapData ? identify_choro_base : null)
        .attr("d", path);
                
        $("#counties path").tooltip({
            effect: 'fade',
            opacity: 0.8
        });
                
        $('#counties path').css({
            'fill':'rgba(215,0,54,0.0)'
        });
        
        //this function can be found in box_and_scatterplot.js, not here
        
        
        //*******************************************
        
        choropleth_mi.selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("title", mapData ? title : null)
        .attr("prov_name", mapData ? title : null)
        .attr("id", mapData ? identify_choro_mi : null)
        .attr("d", path);
        
        //---------------------------------------
                
        counties_mi.selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("title", mapData ? title : null)
        .attr("prov_name", mapData ? title : null)
        .attr("id", mapData ? identify_choro_base_mi : null)
        .attr("d", path);
                
        $("#counties_mi path").tooltip({
            effect: 'fade',
            opacity: 0.8
        });
                
        updateCountryMap();
        $('#counties_mi path').css({
            'fill':'rgba(215,0,54,0.0)'
        });
        
        //this function can be found in parallel-coordinates-d3.js, not here
        shadeChoropleth();
        shadeMoranMaps("clusterMap");
        $('#loadingDiv').fadeOut(100);
        
    });

    // ======================= Map functions ============================


    function identify_choro_base(d) {
        return "p" + d.properties[admDivID].toString();
    }
    
    function identify_choro(d) {
        return "cpm" + d.properties[admDivID].toString();
    }

    function identify_choro_base_mi(d) {
        return "m" + d.properties[admDivID].toString();
    }
    
    function identify_choro_mi(d) {
        return "cpmmi" + d.properties[admDivID].toString();
    }

    function title(d) {
       return d.properties[admDivName];
    } 

    function quantize(d) {
        return "q" + Math.min(8, ~~(data[d.id] * 9 / 12)) + "-9";
    }
            
    // ======================= Map-Page Functions ============================
   
    // Function that executes everytime a province is clicked
    function updateCountryMap(){
        $('#counties path').click(function () {
            if(provSelectCount == 0){
                $('#counties path').css({
                    'fill':''
                });
                
                $('#counties_mi path').css({
                    'fill':''
                });                
                
                d3.select("#scatterplotPlot").classed("selecting",false);
                d3.select("#boxplotPlot").classed("selecting",false);                
                d3.selectAll(".scatterplotPoints").classed("selected",false);
                d3.selectAll(".boxplotPoints").classed("selected",false);
                
            }
            
            d3.select('#scatterplotBrush').call(scatterplotBrush.clear());
            d3.select('#boxplotBrush').call(boxplotBrush.clear());

            // Select specific Background line
            var adm2code = this.id.toString().slice(1);
            
            // Ensure that the equivalent value is the same as the default specified in the css or elsewhere
            if(!(d3.select('#b'+adm2code).attr('class')=="boxplotPoints selected") ||
                !(d3.select('#s'+adm2code).attr('class')=="scatterplotPoints selected")){
                $(this).css({
                    'fill':"rgba(124,240,10,0.0)"
                });
                $('#m'+adm2code).css({
                    'fill':"rgba(124,240,10,0.0)"
                });
                

                d3.select("#scatterplotPlot").classed("selecting",true);
                d3.select("#boxplotPlot").classed("selecting",true);
                d3.select('#s'+adm2code).classed("selected",true);
                d3.select('#b'+adm2code).classed("selected",true);
                
                provSelectCount++;
                
            }else{
                $(this).css({
                    'fill':''
                });
                $('#m'+adm2code).css({
                    'fill':''
                });                

                d3.select("#scatterplotPlot").classed("selecting",true);
                d3.select("#boxplotPlot").classed("selecting",true);
                d3.select('#s'+adm2code).classed("selected",false);
                d3.select('#b'+adm2code).classed("selected",false);
                //d3.select('#l'+adm2code).style("stroke","").style("stroke-width","");
                
                provSelectCount--;
                
                if(provSelectCount==0){
                    $('#counties path').css({
                        'fill':"rgba(124,240,10,0.0)"
                    });
                    
                    $('#counties_mi path').css({
                        'fill':"rgba(124,240,10,0.0)"
                    });                             

                    //Shows on Parallel Coord
                    // Hide foreground - using a mixture of jQuery & d3 selectors. No diff between them.
                    d3.select("#scatterplotPlot").classed("selecting",false);
                    d3.select("#boxplotPlot").classed("selecting",false);
                }                
            }
        });
        
        $('#counties_mi path').click(function() {
            
            if(provSelectCount == 0){
                $('#counties path').css({
                    'fill':''
                });
                
                $('#counties_mi path').css({
                    'fill':''
                });                
                
                d3.select("#scatterplotPlot").classed("selecting",false);
                d3.select("#boxplotPlot").classed("selecting",false);                
                d3.selectAll(".scatterplotPoints").classed("selected",false);
                d3.selectAll(".boxplotPoints").classed("selected",false);
                
            }
            
            d3.select('#scatterplotBrush').call(scatterplotBrush.clear());
            d3.select('#boxplotBrush').call(boxplotBrush.clear());

            // Select specific Background line
            var adm2code = this.id.toString().slice(1);
            
            // Ensure that the equivalent value is the same as the default specified in the css or elsewhere
            if(!(d3.select('#b'+adm2code).attr('class')=="boxplotPoints selected") ||
                !(d3.select('#s'+adm2code).attr('class')=="scatterplotPoints selected")){
                $(this).css({
                    'fill':"rgba(124,240,10,0.0)"
                });
                $('#p'+adm2code).css({
                    'fill':"rgba(124,240,10,0.0)"
                });                

                d3.select("#scatterplotPlot").classed("selecting",true);
                d3.select("#boxplotPlot").classed("selecting",true);
                d3.select('#s'+adm2code).classed("selected",true);
                d3.select('#b'+adm2code).classed("selected",true);
                
                provSelectCount++;
                
            }else{
                $(this).css({
                    'fill':''
                });
                $('#p'+adm2code).css({
                    'fill':''
                });

                d3.select("#scatterplotPlot").classed("selecting",true);
                d3.select("#boxplotPlot").classed("selecting",true);
                d3.select('#s'+adm2code).classed("selected",false);
                d3.select('#b'+adm2code).classed("selected",false);
                //d3.select('#l'+adm2code).style("stroke","").style("stroke-width","");
                
                provSelectCount--;
                
                if(provSelectCount==0){
                    $('#counties path').css({
                        'fill':"rgba(124,240,10,0.0)"
                    });
                    
                    $('#counties_mi path').css({
                        'fill':"rgba(124,240,10,0.0)"
                    });                             

                    // Hide foreground - using a mixture of jQuery & d3 selectors. No diff between them.
                    d3.select("#scatterplotPlot").classed("selecting",false);
                    d3.select("#boxplotPlot").classed("selecting",false);
                }                
            }
        });        
        
    }

});