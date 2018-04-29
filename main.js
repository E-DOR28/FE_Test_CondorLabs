var jsListObj = new manageInfo();

//Here is the request I made to the service
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		jsListObj.data = JSON.parse(this.response);
		displayRecords();
	}
};
//xhttp.open("GET", "recordsPrueba.json", true);
xhttp.open("GET", "https://api.cebroker.com/v1/cerenewaltransactions/GetLogsRecordData", true);


xhttp.send(null);



function manageInfo() {
	this.data = {};
	this.sortedArray = [];
	this.filteredByDateArray = [];
	this.filteredByStateArray = [];
	this.logsPerCompilance = {};
	this.logsPerMachine = {};
	this.averageTimeGlobal = 0;
	this.avergateTimePerDayArray = [];
	this.dataForChar = [];

	this.filterByDate = function (start, end) {
		var startDate_init = new Date(start+"T00:00:00.00");
		var startDate_end  = end !== undefined ? new Date(end+"T23:59:59.99") : new Date(start+"T23:59:59.99");
			for (var i in this.data) {
				if ((new Date(this.data[i].dt_Start_Log) >= startDate_init) && (new Date(this.data[i].dt_Start_Log) <= startDate_end)) {
					this.filteredByDateArray.push(this.data[i]);
				}
			}
	};

	this.filterByState = function (st_cd) {
		if (st_cd !== "none" && st_cd !== undefined) {
			for (var i in this.filteredByDateArray) {
				if (this.filteredByDateArray[i].cd_cebroker_state === st_cd) {
					this.filteredByStateArray.push(this.filteredByDateArray[i]);
				}
			}
		} else {
			this.filteredByStateArray = this.filteredByDateArray;
		}
	};

	this.sortByValue  = function (field){
		for(var i in this.filteredByStateArray) {
			// Push each JSON Object entry in array by [value, key]
			this.sortedArray.push([this.filteredByStateArray[i], this.filteredByStateArray[i][field]]);
		}
		this.sortedArray.sort();
	};

	this.NumRequestPerField = function () {
		var RequestPerCompilance = [];
		var RequestPerMachine = [];
		var countsPerCompilance = {};
		var countsPerMachine = {};

		for(var i in this.filteredByStateArray) {
			// Push each JSON Object entry in array by [value, key]
			RequestPerCompilance.push(this.filteredByStateArray[i]["ds_compl_status_returned"]);
			RequestPerMachine.push(this.filteredByStateArray[i]["cd_machine"]);
		}
		
		RequestPerCompilance.forEach(function(x) { countsPerCompilance[x] = (countsPerCompilance[x] || 0)+1; });
		RequestPerMachine.forEach(function(x) { countsPerMachine[x] = (countsPerMachine[x] || 0)+1; });
		
		this.logsPerCompilance = countsPerCompilance;
		this.logsPerMachine = countsPerMachine;
	};


	this.CalculateResponseTime = function () {
		var responseTime = 0;
		var responseTimeArray = [];
		var averageResponse = 0;
		var startDate = "";

		for(var i in this.filteredByStateArray) {

			startDate = this.filteredByStateArray[i]["dt_Start_Log"];
			responseTime = new Date(startDate).getTime() - new Date (this.filteredByStateArray[i]["dt_end_log"]).getTime();
			startDate = new Date(startDate).getFullYear()+"-"+("0"+(new Date(startDate).getMonth()+1)).slice(-2)+"-"+("0"+(new Date(startDate).getDate())).slice(-2);
			// Push each JSON Object entry in array by [value, key]
			averageResponse += responseTime/(1000*60*60*24);
			responseTimeArray.push([startDate, (responseTime/(1000*60*60*24))]);
		}


		var holder = {};
		var countResponsesPerDay = [];

		responseTimeArray.forEach(function (d) {
		    if(holder.hasOwnProperty(d[0])) {
		    	holder[d[0]] = holder[d[0]] + d[1]; 
		    	countResponsesPerDay[d[0]] = (countResponsesPerDay[d[0]] || 0)+1;
		    } else {
		       holder[d[0]] = d[1];
		    }
		});


		for(var prop in holder) {
		    this.avergateTimePerDayArray.push({date: prop, average_time: (holder[prop]/(countResponsesPerDay[prop]+1)) });   
		}


		this.averageTimeGlobal = averageResponse/responseTimeArray.length;
		
	};


	this.displayList = function (fisrtRecord) {
		var items = "";
		var pagesCtrl = "";
		var recordsLength = this.sortedArray.length;
		var actualPage = 1;
		var lastRecord = 19;

		if (!fisrtRecord) fisrtRecord = 0;

		if (recordsLength <= 20) {
			lastRecord = recordsLength;
			numPages = 1;
			if (lastRecord === 0)
				pagesCtrl = 'Record '+0+' to '+lastRecord+' | Page '+actualPage+' of '+numPages;
			else 
				pagesCtrl = 'Record '+(fisrtRecord+1)+' to '+lastRecord+' | Page '+actualPage+' of '+numPages;
		} else {
			numPages = Math.ceil(recordsLength/20);
			if (fisrtRecord === 0) {
				lastRecord = 20;
				pagesCtrl = 'Record '+(fisrtRecord+1)+' to '+lastRecord+' | Page '+actualPage+' of '+numPages+
				'&nbsp;&nbsp; <button class="GoBackBtn" onclick="moveOnPages('+(fisrtRecord+20)+')">Next</button>';
			} else {
				actualPage = Math.floor(fisrtRecord/20)+1;
				if (actualPage === numPages) {
					lastRecord = recordsLength;
					pagesCtrl = 'Record '+(fisrtRecord+1)+' to '+lastRecord+' | Page '+actualPage+' of '+numPages+
					'&nbsp;&nbsp; <button class="GoBackBtn" onclick="moveOnPages('+(fisrtRecord-20)+')">Back</button>';
				} else {
					lastRecord = fisrtRecord + 20;
					pagesCtrl = 'Record '+(fisrtRecord+1)+' to '+lastRecord+' | Page '+actualPage+' of '+numPages+
					'&nbsp;&nbsp; <button class="GoBackBtn" onclick="moveOnPages('+(fisrtRecord-20)+')">Back</button>'+
					'&nbsp;&nbsp; <button class="GoBackBtn" onclick="moveOnPages('+(fisrtRecord+20)+')">Next</button>';
				}
			}
		}

		for(var n=fisrtRecord;n<lastRecord;n++){
			items += 
				'<div class="items">'+
				'<div class="col-5">'+this.sortedArray[n][0].cd_cebroker_state+'</div>'+
				'<div class="col-5">'+this.sortedArray[n][0].pro_cde+'</div>'+
				'<div class="col-5">'+this.sortedArray[n][0].cd_profession+'</div>'+
				'<div class="col-5">'+this.sortedArray[n][0].id_license+'</div>'+
				'<div class="col-10">'+this.sortedArray[n][0].dt_end.substring(0,10)+'</div>'+
				'<div class="col-10">'+this.sortedArray[n][0].ds_compl_status_returned+'</div>'+
				'<div class="col-5">'+this.sortedArray[n][0].id_client_nbr+'</div>'+
				'<div class="col-20">'+this.sortedArray[n][0].dt_Start_Log+'</div>'+
				'<div class="col-20">'+this.sortedArray[n][0].dt_end_log+'</div>'+
				'<div class="col-10">'+this.sortedArray[n][0].cd_environment+'</div>'+
				'<div class="col-5">'+this.sortedArray[n][0].cd_machine+'</div>'+
				'</div>';
		}

		return {"list" : items, "ctrls" : pagesCtrl};
	}

}

function moveOnPages(fisrtRecord) {
	var displayedRecords = {};

	displayedRecords = jsListObj.displayList(fisrtRecord);
	document.getElementById("listItems").innerHTML = displayedRecords.list; 
	document.getElementById("PagesControl").innerHTML = displayedRecords.ctrls;
}

function displayRecords() {
		jsListObj.filteredByDateArray = [];
		jsListObj.filteredByStateArray = [];
		jsListObj.sortedArray = [];
		var displayedRecords = {};
		var useRangeChk = document.getElementById("dtRange");
		var filterStateChk =  document.getElementById("stState");
		var startLogDate =  document.getElementById("startDate");
		var fieldToOrder =  document.getElementById("logData");
		var endLogDate = useRangeChk.checked === true ? document.getElementById("endDate") : "";
		var filterStateValue = filterStateChk.checked === true ? document.getElementById("cd_state") : "none";

		jsListObj.filterByDate(startLogDate.value,endLogDate.value);
		jsListObj.filterByState(filterStateValue.value);
		jsListObj.sortByValue(fieldToOrder.value);
		
		displayedRecords = jsListObj.displayList(0);
		document.getElementById("listItems").innerHTML = displayedRecords.list; 
		document.getElementById("PagesControl").innerHTML = displayedRecords.ctrls;

		jsListObj.NumRequestPerField();
		jsListObj.CalculateResponseTime();

}

// This are the events that give the functionality to the interface objetcs
function handleClick(chkBox, element){
	document.getElementById(element).disabled = chkBox.checked === true ? false : true;
}