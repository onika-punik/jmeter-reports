/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 50.492011704583376, "KoPercent": 49.507988295416624};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4590539530548025, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.42610336130476234, 500, 1500, "Get characters"], "isController": false}, {"data": [0.45975574771525757, 500, 1500, "Create  character"], "isController": false}, {"data": [0.46644461914022095, 500, 1500, "Update character"], "isController": false}, {"data": [0.47428300295234077, 500, 1500, "Delete character by ID"], "isController": false}, {"data": [0.4697215510698594, 500, 1500, "Get character by ID"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 725186, 359025, 49.507988295416624, 1712.7061278071865, 0, 138276, 1211.0, 2780.0, 3436.0, 17165.99, 3142.0673399798093, 41450.42030788965, 284.6659017965849], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get characters", 147889, 74167, 50.15045067584472, 2049.917012083397, 0, 138090, 1052.0, 2650.9000000000015, 3385.9500000000007, 8638.0, 671.3530199514266, 39811.93441521779, 41.17966143291645], "isController": false}, {"data": ["Create  character", 146406, 73215, 50.008196385394044, 1798.1781006242784, 0, 102332, 1020.5, 2482.0, 3141.7000000000044, 6045.850000000024, 659.6558575850556, 920.9031059635807, 72.78212163427095], "isController": false}, {"data": ["Update character", 145014, 71810, 49.5193567517619, 1649.5924462465669, 0, 138276, 1021.0, 2466.0, 3065.0, 5880.0, 628.4981211887437, 871.5906676091423, 70.33229103913214], "isController": false}, {"data": ["Delete character by ID", 142260, 69209, 48.64965556024181, 1499.3572824406285, 0, 102333, 1022.0, 2493.0, 3199.0, 6020.970000000005, 645.8701268041098, 877.893557600415, 68.98715029413968], "isController": false}, {"data": ["Get character by ID", 143617, 70624, 49.17523691484991, 1553.3934005027304, 0, 102332, 1023.0, 2488.9000000000015, 3203.9500000000007, 7447.0, 662.6142482110149, 913.0024347672128, 41.76763620249558], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 355494, 99.01650302903697, 49.02107873014647], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 400, 0.11141285425806002, 0.055158262845669936], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 523, 0.14567230694241348, 0.07211942867071344], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 2608, 0.7264118097625514, 0.359631873753768], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 725186, 359025, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 355494, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 2608, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 523, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 400, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get characters", 147889, 74167, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 73398, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 522, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 171, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 76, "", ""], "isController": false}, {"data": ["Create  character", 146406, 73215, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 72142, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 855, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 128, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 90, "", ""], "isController": false}, {"data": ["Update character", 145014, 71810, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 71353, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 309, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 75, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 73, "", ""], "isController": false}, {"data": ["Delete character by ID", 142260, 69209, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 68713, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 358, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 78, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 60, "", ""], "isController": false}, {"data": ["Get character by ID", 143617, 70624, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 69888, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 564, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 101, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Broken pipe", 71, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
