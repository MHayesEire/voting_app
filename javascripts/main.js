/*
window.onload = function() {
    if (window.jQuery) {  
        // jQuery is loaded  
       //alert("Yeah!");
      $(document).ready(function() {
         //alert("Yeah!");     
    
});
    } else {
        // jQuery is not loaded
      //  alert("Doesn't Work");
    }
}


//alert("Here");
$(function(){
 $('.OLDagg').on('click', function(e){
  alert("Here");
     var parameters = { poll: $(this).val() };
       $.get( '/getAgg',parameters, function(data1) {
       $('#results').html(JSON.stringify(data1));
       alert("Here");
       alert(JSON.stringify(data1)); 
       
       ///
       
       google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);
      function drawChart() {

        var data = new google.visualization.DataTable();
              data.addColumn('string', 'Votes');
              data.addColumn('number', 'Total');
              data.addRows([
                  ['data1._id[i]', data1.count],
      
              ]);

        var options = {
          title: 'data1._id'
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }
       
       ////
     });
 });
});

*/
//alert("Here");
function validateForm(){
       // alert("Here2");
    //var a=parseInt(document.forms["form"]["option"].value,10);
    var a = document.forms["form"]["option"].value;
   // alert(a);
    var b=parseInt(document.forms["form"]["choice_input"].value,10);
   // alert(b);
        if(a === 0){
            alert("Please Fill All Required Field");
            return false;
            }
        if( a === 1 ) //|| b== null || b== "")
      {
      alert("Please Fill All Required Field");
      return false;
      }
    }