 $(document).ready(() => {

     let userId = $(".username").text();
     let triggerOptions = $(".triggerOptionsButton").text();
     let signupKey = $(".signupCatcher").text();
     let triggerUserOptions = $(".triggerUserOptions").text();

     console.log("signupKey: ", signupKey);
     console.log("userId: ", userId);
     console.log("triggerOptions: ", triggerOptions);
     console.log("tiggerUserOptions: ", triggerUserOptions);


     getCharts(userId, triggerOptions, triggerUserOptions, signupKey, getQuery)

     function getCharts(str, options, userOptions, signup, callbackQuery) {

         let queryLink = "";
         let divTagHolder = "";
         let chartWidth;
         let chartHeight;
         let is3D = false;
         /* if retrieve USER polls only */
         if (str !== "" && options === "") {
             console.log("prva");
             queryLink = "/polls/getOwnCharts/" + str;
             divTagHolder = "Own";
             chartWidth = 260;
             chartHeight = 175;
             callbackQuery(queryLink, is3D, chartWidth, chartHeight, divTagHolder);
             /* if retrieve user polls for Poll Options   */
         } else if (str !== "" && options !== "") {
             console.log("druga");
             queryLink = "/polls/getOwnCharts/" + str
             divTagHolder = "Own"
             chartWidth = 600;
             chartHeight = 400;
             is3D = true;
             callbackQuery(queryLink, is3D, chartWidth, chartHeight, divTagHolder);
         } else if (str.length === 0 && signup.length === 0 && userOptions.length === 0) {
             /* if retrieve ALL polls only */
             console.log("tretja");
             queryLink = "/polls/getDataCharts/";
             chartWidth = 260;
             chartHeight = 175;
             callbackQuery(queryLink, is3D, chartWidth, chartHeight, divTagHolder);
             /* if no retrieve */
         } else if (str.length === 0 && signup !== "" && userOptions !== "") {
             console.log('TRIEEE, ne zgodi se nec');

         }
     }

     function getQuery(_link, _is3D, _width, _height, _divTag) {

         // perform xmlHTTP query
         $.get(_link, (data) => {
             let titleArr = [];
             let titleObj;
             let holder;


             holder = data;
             holder.forEach((item, index) => {
                 function drawChart() {
                     // Create the data table.
                     var data = new google.visualization.DataTable();
                     data.addColumn('string', 'Poll');
                     data.addColumn('number', 'Count');
                     let arr = [];
                     for (let i in item.polls) {
                         arr.push([item.polls[i].poll, item.polls[i].count])
                     }
                     data.addRows(arr);
                     // Set chart options
                     var options = {
                         'title': item.title,
                         'width': _width,
                         'height': _height,
                          is3D:_is3D
                     };
                     // Instantiate and draw our chart, passing in some options.
                     let chart = new google.visualization.PieChart(document.getElementById('chart_div' + _divTag + index.toString()));
                     chart.draw(data, options);
                     // let options = JSON.stringify(titleObj);
                 }
                 // callback for google charts 
                 google.charts.setOnLoadCallback(drawChart);
             });
         });
     }
 });
