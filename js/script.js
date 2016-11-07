var myApp = angular.module('myApp', ['angularUtils.directives.dirPagination']);

var leg_results = [];
var phpscriptAPI = "http://cs-server.usc.edu:39744/api.php";
function findAndRemove(array, property, value) {
  array.forEach(function(result, index) {
    if(result[property] === value) {
      array.splice(index, 1);
    }    
  });
}

function checkifpresent(array, property, value) {
  var flag = 0;
    array.forEach(function(result, index) {
    if(result[property] === value) {
        flag =1;
    }    
  });
    if(flag==1)return true;
    return false;
}

function getArrayIndex(array, property, value) {
  var i = -1;
    array.forEach(function(result, index) {
    if(result[property] === value) {
        i = index;
    }    
  });
    return i;
}

function callAPI(link){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", link, false);
    Httpreq.send(null);
    return JSON.parse(Httpreq.responseText); 
}

function MyController($scope) {
  $scope.currentPage = 1;
  $scope.pageSize = 10;
  $scope.results = [];
  $scope.resultsbyhouse = [];
  $scope.resultsbysenate = [];
  $scope.f = "";
  $scope.fh = "";
  $scope.fs = "";  
  $scope.abf = "";
  $scope.nbf = "";
    $scope.chf = "";
    $scope.csf = "";
    $scope.cjf = "";
  $scope.reverse = false;
  $scope.bill_results = [];
  $scope.new_results = [];
  $scope.resultsComHouse = [];
  $scope.resultsComSenate = [];
  $scope.resultsComJoint = [];
  $scope.favlegisResults = [];  
  $scope.currentlegis; 
  $scope.favCommResults = [];  
  $scope.favBillResults = [];  
  $scope.currentBill;    
    
    if(localStorage.getItem('fav_legislator') === null){
        //alert("failed");
    }else{
        //alert("passed");
        $scope.favlegisResults = JSON.parse(localStorage.fav_legislator);
    }    
    
    if(localStorage.getItem('fav_committee') === null){
        //alert("failed");
    }else{
        //alert("passed");
        $scope.favCommResults = JSON.parse(localStorage.fav_committee);
    } 
    
    if(localStorage.getItem('fav_bill') === null){
        //alert("failed");
    }else{
        //alert("passed");
        $scope.favBillResults = JSON.parse(localStorage.fav_bill);
    } 
    
    
    var results = makeTable();
    for (var i = 0; i < results.length; i++) {
    var legislator = results[i];
    var p,n,c,cimg,d,s;
    if(legislator.party=="R"){
        p = "r.png"; 
    }else{
        p = "d.png";
    }
    n = legislator.last_name+','+legislator.first_name;
    if(legislator.chamber=="house"){  
        c = "House"; 
        cimg = "h.png";
    }else{
        c = "Senate";
        cimg = "s.svg";
    }
    if(legislator.district==null)
    {
        d = "N.A.";
    }else{
        d = "District "+legislator.district;
    }
    s = legislator.state_name;
    bid = legislator.bioguide_id;
    $scope.results.push({party:p,name:n,chamber:c,district:d,state:s,cimage:cimg,bioid:bid});
    if(c=="House")
    {
        $scope.resultsbyhouse.push({party:p,name:n,chamber:c,district:d,state:s,cimage:cimg,bioid:bid});
    }
    else{
        $scope.resultsbysenate.push({party:p,name:n,chamber:c,district:d,state:s,cimage:cimg,bioid:bid});
    }
    }
 
    $scope.showLegislatorDetails= function(bioguide_id){
        makeLegislatorDetails(bioguide_id);
        $('#myCarousel').carousel(1);    
        $scope.currentlegis = bioguide_id;         
    };
    
    $scope.showFavLegislatorDetails= function(bioguide_id){
        makeLegislatorDetails(bioguide_id);
        $('#myCarousel').carousel(1);
        getLegislatorPage();
        $scope.currentlegis = bioguide_id;
    };
    
    $scope.deleteFavLegislator = function(bioguide_id){
        //alert("raeac "+bioguide_id);        
        findAndRemove($scope.favlegisResults,'bioid',bioguide_id);
        localStorage.fav_legislator = JSON.stringify($scope.favlegisResults);
        
        if($scope.currentlegis==bioguide_id){
        document.getElementById("favbutton").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='addfavarray()'><span class='glyphicon glyphicon-star' style='color:white; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";
        }
    };
    
        $scope.deleteFavCommittee = function(comm_id){    
            findAndRemove($scope.favCommResults,'cid',comm_id);
            localStorage.fav_committee = JSON.stringify($scope.favCommResults);
            if(getArrayIndex($scope.resultsComHouse,'cid',comm_id) != -1 ){
                var index = getArrayIndex($scope.resultsComHouse,'cid',comm_id);
                $scope.resultsComHouse[index].color = 'white';
            }else if(getArrayIndex($scope.resultsComSenate,'cid',comm_id) != -1 ){
            var index = getArrayIndex($scope.resultsComSenate,'cid',comm_id);
            $scope.resultsComSenate[index].color = 'white';
        }
        else if(getArrayIndex($scope.resultsComJoint,'cid',comm_id) != -1 ){
            var index = getArrayIndex($scope.resultsComJoint,'cid',comm_id);
            $scope.resultsComJoint[index].color = 'white';
        }  
    };
    
    $scope.deleteFavBill = function(bill_id){    
        findAndRemove($scope.favBillResults,'bill_id',bill_id);
        localStorage.fav_bill = JSON.stringify($scope.favBillResults);
        
        if($scope.currentBill==bill_id){
        document.getElementById("favbuttonbill").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='addFavBillArray()'><span class='glyphicon glyphicon-star' style='color:white; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>"; }
    };
    
    $scope.addFavCommArray1 = function(comm_id){
        addFavCommArray(comm_id);
    }
    
    $scope.addFavBillArray1 = function(bill_id){
        addFavBillArray(bill_id);
    }
    
    //bill infos
    var activebill_results = makeActiveBill();
    var newbill_results = makeNewBill();
    for (var i = 0; i < activebill_results.length; i++) {
        var bill = activebill_results[i];
        var bid,bt,t,c,cimg,intro,s;
        bid = bill.bill_id;
        bt = bill.bill_type;
        t= bill.official_title;
        if(bill.chamber=="house"){  
            c = "House"; 
            cimg = "h.png";
        }else{
            c = "Senate";
            cimg = "s.svg";
        }
        intro = getDate(bill.introduced_on);
        s = bill.sponsor.title+". "+bill.sponsor.last_name+", "+bill.sponsor.first_name;
        $scope.bill_results.push({bill_id:bid,bill_type:bt,title:t,chamber:c,cimage:cimg,intro:intro,sponsor:s});
    }
    
    for (var i = 0; i < newbill_results.length; i++) {
        var bill = newbill_results[i];
        var bid,bt,t,c,cimg,intro,s;
        bid = bill.bill_id;
        bt = bill.bill_type;
        t= bill.official_title;
        if(bill.chamber=="house"){  
            c = "House"; 
            cimg = "h.png";
        }else{
            c = "Senate";
            cimg = "s.svg";
        }
        intro = getDate(bill.introduced_on);
        s = bill.sponsor.title+". "+bill.sponsor.last_name+", "+bill.sponsor.first_name;
        $scope.new_results.push({bill_id:bid,bill_type:bt,title:t,chamber:c,cimage:cimg,intro:intro,sponsor:s});
    }  
    
    $scope.showBillDetails= function(bill_id){
        makeBillDetails(bill_id);
        $('#billCarousel').carousel(1); 
        $scope.currentBill=bill_id; 
    };
    
    $scope.showFavBillDetails= function(bill_id){
        makeBillDetails(bill_id);
        $('#billCarousel').carousel(1);
        getBillsPage();
        $scope.currentBill=bill_id; 
    };
    
    var link =phpscriptAPI+"/committees?&chamber=house&per_page=all&apikey=6a516af642a845cfaf2478313971bf81";
    var comhouseresults = makeComResults(link);
    link = phpscriptAPI+"/committees?&chamber=senate&per_page=all&apikey=6a516af642a845cfaf2478313971bf81";
    var comsenateresults = makeComResults(link);
    link = phpscriptAPI+"/committees?&chamber=joint&per_page=all&apikey=6a516af642a845cfaf2478313971bf81";
    var comjointresults = makeComResults(link);
    
    pushintoarray(comhouseresults,$scope.resultsComHouse);
    pushintoarray(comsenateresults,$scope.resultsComSenate);
    pushintoarray(comjointresults,$scope.resultsComJoint);
}

function deletefavarray(){
    document.getElementById("favbutton").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='addfavarray()'><span class='glyphicon glyphicon-star' style='color:white; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";    
    var scope = angular.element($("#myc")).scope();
    var bioguide_id = scope.currentlegis;
    scope.$apply(function(){
        scope.deleteFavLegislator(bioguide_id);    
    });    
}

function deletefavbillarray(){
    document.getElementById("favbuttonbill").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='addFavBillArray()'><span class='glyphicon glyphicon-star' style='color:white; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";    
    var scope = angular.element($("#myc")).scope();
    var bill_id = scope.currentBill;
    scope.$apply(function(){
        scope.deleteFavBill(bill_id);    
    });    
}
/*
function deletefavcommarray(){    
    var scope = angular.element($("#myc")).scope();
    var bioguide_id = scope.currentlegis;
    
    scope.$apply(function(){
        scope.deleteFavLegislator(bioguide_id);    
    });    
}*/

function addFavCommArray(comm_id){
    var scope = angular.element($("#myc")).scope();
   
    if(checkifpresent(scope.favCommResults,'cid',comm_id)==true){
        scope.deleteFavCommittee(comm_id);
        
        /*if(getArrayIndex(scope.resultsComHouse,'cid',comm_id) != -1 ){
            var index = getArrayIndex(scope.resultsComHouse,'cid',comm_id);
            scope.resultsComHouse[index].color = 'white';
        }else if(getArrayIndex(scope.resultsComSenate,'cid',comm_id) != -1 ){
        var index = getArrayIndex(scope.resultsComSenate,'cid',comm_id);
        scope.resultsComSenate[index].color = 'white';
    }
    else if(getArrayIndex(scope.resultsComJoint,'cid',comm_id) != -1 ){
        var index = getArrayIndex(scope.resultsComJoint,'cid',comm_id);
        scope.resultsComJoint[index].color = 'white';
    }  */      
        return;
    }
    
    if(getArrayIndex(scope.resultsComHouse,'cid',comm_id) != -1 ){
        var index = getArrayIndex(scope.resultsComHouse,'cid',comm_id);
        scope.resultsComHouse[index].color = 'yellow';
    }else if(getArrayIndex(scope.resultsComSenate,'cid',comm_id) != -1 ){
        var index = getArrayIndex(scope.resultsComSenate,'cid',comm_id);
        scope.resultsComSenate[index].color = 'yellow';
    }
    else if(getArrayIndex(scope.resultsComJoint,'cid',comm_id) != -1 ){
        var index = getArrayIndex(scope.resultsComJoint,'cid',comm_id);
        scope.resultsComJoint[index].color = 'yellow';
    }
    
    var link_info = "http://congress.api.sunlightfoundation.com/committees?committee_id="+comm_id+"&apikey=6a516af642a845cfaf2478313971bf81";

    var jsonInfo = callAPI(link_info);  
    var com = jsonInfo.results[0];
        var cid,name,parent,c,cimg,office,phone;
        cid = com.committee_id;
        name = com.name;
        parent= com.parent_committee_id;
        if(com.chamber=="house"){ 
            c = "House"; 
            cimg = "h.png";
        }else if(com.chamber=="senate"){
            c = "Senate";
            cimg = "s.svg";
        }else{
            c = "Joint";
            cimg = "s.svg";
        }    
        scope.favCommResults.push({cid:cid,name:name,parent:parent,chamber:c,cimage:cimg,sub:com.subcommittee});
        localStorage.fav_committee = JSON.stringify(scope.favCommResults);
}

function addFavBillArray(){
    document.getElementById("favbuttonbill").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='deletefavbillarray()'><span class='glyphicon glyphicon-star' style='color:yellow; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";    
    
    var scope = angular.element($("#myc")).scope();
    var bill_id = scope.currentBill;
   
    var link_info = "http://congress.api.sunlightfoundation.com/bills?bill_id="+bill_id+"&apikey=6a516af642a845cfaf2478313971bf81";

    var jsonInfo = callAPI(link_info);  
        var bill = jsonInfo.results[0];
        var bid,bt,t,c,cimg,intro,s;
        bid = bill.bill_id;
        bt = bill.bill_type;
        t= bill.official_title;
        if(bill.chamber=="house"){  
            c = "House"; 
            cimg = "h.png";
        }else{
            c = "Senate";
            cimg = "s.svg";
        }
        intro = getDate(bill.introduced_on);
        s = bill.sponsor.title+". "+bill.sponsor.last_name+", "+bill.sponsor.first_name;
    scope.$apply(function(){    
    scope.favBillResults.push({bill_id:bid,bill_type:bt,title:t,chamber:c,cimage:cimg,intro:intro,sponsor:s});
        localStorage.fav_bill = JSON.stringify(scope.favBillResults);
    });  
}

function addfavarray(){
    document.getElementById("favbutton").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='deletefavarray()'><span class='glyphicon glyphicon-star' style='color:yellow; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";
    
    var scope = angular.element($("#myc")).scope();
    var bioguide_id = scope.currentlegis;
    
    //to check if legislator already present in list
    if(checkifpresent(scope.favlegisResults,'bioid',bioguide_id) == true){
        alert("already present");
        return;
    }
    
    var imageLink = "https://theunitedstates.io/images/congress/original/"+bioguide_id+".jpg";
    var link_info = "http://congress.api.sunlightfoundation.com/legislators?bioguide_id="+bioguide_id+"&apikey=6a516af642a845cfaf2478313971bf81";

    var jsonInfo = callAPI(link_info);    
    var legislator = jsonInfo.results[0];
    
    var p,n,c,cimg,d,s;
    if(legislator.party=="R"){
        p = "r.png"; 
    }else{
        p = "d.png";
    }
    n = legislator.last_name+','+legislator.first_name;
    if(legislator.chamber=="house"){  
        c = "House"; 
        cimg = "h.png";
    }else{
        c = "Senate";
        cimg = "s.svg";
    }
    s = legislator.state_name;
    bid = legislator.bioguide_id;
    scope.$apply(function(){ scope.favlegisResults.push({image:imageLink,party:p,name:n,chamber:c,state:s,cimage:cimg,bioid:bioguide_id,email:legislator.oc_email});
    localStorage.fav_legislator = JSON.stringify(scope.favlegisResults);
    });  
}

function pushintoarray(comhouseresults,resultsComHouse){
    for (var i = 0; i < comhouseresults.length; i++){
        var com = comhouseresults[i];
        var cid,name,parent,c,cimg,office,phone,color;
        cid = com.committee_id;
        name = com.name;
        parent= com.parent_committee_id;
        if(com.chamber=="house"){ 
            c = "House"; 
            cimg = "h.png";
        }else if(com.chamber=="senate"){
            c = "Senate";
            cimg = "s.svg";
        }else{
            c = "Joint";
            cimg = "s.svg";
        }
        phone = com.phone;
        office = com.office;
        if(com.office==null){
            office = "N.A.";
        }
        
        var scope = angular.element($("#myc")).scope();
        if(checkifpresent(scope.favCommResults,'cid',com.committee_id)==true){
            color = 'yellow';
        }else{
            color = 'white';
        }
        resultsComHouse.push({color:color,cid:cid,name:name,parent:parent,chamber:c,cimage:cimg,contact:phone,office:office});
    }
}

function makeBillDetails(bill_id){
    var bill_link = "http://congress.api.sunlightfoundation.com/bills?bill_id="+bill_id+"&apikey=6a516af642a845cfaf2478313971bf81";
    var json_obj = callAPI(bill_link);
    var bill_info = json_obj.results[0];
    document.getElementById("info_bill_id").innerHTML =  bill_info.bill_id;
    document.getElementById("info_bill_type").innerHTML = bill_info.bill_type;
    document.getElementById("info_bill_title").innerHTML = bill_info.official_title;
    document.getElementById("info_bill_chamber").innerHTML = bill_info.chamber;
    if(bill_info.history.active==true){
        document.getElementById("info_bill_status").innerHTML = "Active";
    }else{
        document.getElementById("info_bill_status").innerHTML = "New";
    }
    document.getElementById("info_bill_intro").innerHTML = getDate(bill_info.introduced_on);
    document.getElementById("info_bill_vstatus").innerHTML = bill_info.last_version.version_name;
    document.getElementById("info_sponsor").innerHTML = bill_info.sponsor.title+". "+bill_info.sponsor.last_name+", "+bill_info.sponsor.first_name;
    document.getElementById("info_bill_congurl").innerHTML = "<a href='"+bill_info.urls.congress+"' target='_blank'>URL</a>";
    document.getElementById("info_bill_url").innerHTML = "<a href='"+bill_info.last_version.urls.pdf+"' target='_blank'>Link</a>";
    document.getElementById("info_bill_pdf").innerHTML = "<object  width='100%' height='100%' data='"+bill_info.last_version.urls.pdf+"' type='application/pdf'></object>";
    
    var scope = angular.element($("#myc")).scope();
    if(checkifpresent(scope.favBillResults,'bill_id',bill_id) == true){
        document.getElementById("favbuttonbill").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='deletefavbillarray()'><span class='glyphicon glyphicon-star' style='color:yellow; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";
    }else{
        document.getElementById("favbuttonbill").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='addFavBillArray()'><span class='glyphicon glyphicon-star' style='color:white; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";
    }
}

function makeComResults(link){
    "use strict";
    var json_obj = callAPI(link);
    return json_obj.results;
}

function makeActiveBill(){
    "use strict";
    var link = "http://congress.api.sunlightfoundation.com/bills?history.active=true&per_page=50&apikey=6a516af642a845cfaf2478313971bf81";
    var json_obj = callAPI(link);
    return json_obj.results;
}

function makeNewBill(){
    "use strict";
    var link = "http://congress.api.sunlightfoundation.com/bills?history.active=false&per_page=50&apikey=6a516af642a845cfaf2478313971bf81";
    var json_obj = callAPI(link);
    return json_obj.results;    
}

function ProgressCtrl($scope){
    $scope.max = 200;
}

myApp.controller('MyController', MyController);
myApp.controller('ProgressCtrl', ProgressCtrl);

function getDate(date){
    var newdate="";
    var arr = date.split("-");
    newdate = arr[1]+"-"+arr[2]+"-"+arr[0];
    return newdate;
}

function makeLegislatorDetails(bioguide_id){
    var imageLink = "https://theunitedstates.io/images/congress/original/"+bioguide_id+".jpg";
    var link_info = "http://congress.api.sunlightfoundation.com/legislators?bioguide_id="+bioguide_id+"&apikey=6a516af642a845cfaf2478313971bf81";
    var link_bills = "http://congress.api.sunlightfoundation.com/bills?sponsor_id="+bioguide_id+"&apikey=6a516af642a845cfaf2478313971bf81";
    //alert(link_bills);
    var link_committee = "http://congress.api.sunlightfoundation.com/committees?member_ids="+bioguide_id+"&apikey=6a516af642a845cfaf2478313971bf81";
    var jsonInfo = callAPI(link_info);
    var jsonBill = callAPI(link_bills);
    var jsonCommittee = callAPI(link_committee);
    document.getElementById("leg_image").innerHTML = "<img style='height:180px;width:140px' src='"+imageLink+"'>";
    var leg_info = jsonInfo.results[0];
    document.getElementById("info_leg_name").innerHTML = leg_info.title+". "+leg_info.last_name + ", " + leg_info.first_name;
    document.getElementById("info_leg_email").innerHTML = "<a href=mailto:"+leg_info.oc_email+" target='_blank'>"+leg_info.oc_email+"</a>";
    document.getElementById("info_leg_chamber").innerHTML = "Chamber: "+ leg_info.chamber;
    document.getElementById("info_leg_contact").innerHTML = "Contact: <span style='color:#0000EE'>"+leg_info.phone+"</span>";
    if(leg_info.party == "R"){
        document.getElementById("info_leg_party").innerHTML = "<img style='height:20px;width:20px' src='images/r.png'> Republican";
    }else{
        document.getElementById("info_leg_party").innerHTML = "<img style='height:20px;width:20px' src='images/d.png'> Democrat";
    }
    
    document.getElementById("info_leg_stterm").innerHTML = getDate(leg_info.term_start);
    document.getElementById("info_leg_endterm").innerHTML = getDate(leg_info.term_end);
    
    var now = new Date();
    var startTerm = new Date(leg_info.term_start);
    var endTerm = new Date(leg_info.term_end);
    var valueofProgressBar = Math.floor((now.getTime() - startTerm.getTime())/(endTerm.getTime() - startTerm.getTime())*100);
    
    
   document.getElementById("info_leg_term").innerHTML = "<div class='progress' style='height:25px;'><div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='"+valueofProgressBar+"'  aria-valuemin='0' aria-valuemax='100' style='width:"+valueofProgressBar+"%'>"+valueofProgressBar+"%</div></div>";
    document.getElementById("info_leg_office").innerHTML = leg_info.office;
    document.getElementById("info_leg_state").innerHTML = leg_info.state_name;
    document.getElementById("info_leg_fax").innerHTML = "<span style='color:#0000EE'>"+leg_info.fax+"</span>";
    document.getElementById("info_leg_birthday").innerHTML = getDate(leg_info.birthday);
    
    var social = "";
    if(leg_info.facebook_id!=null){
        social += "<a href='https://www.facebook.com/"+leg_info.facebook_id+"'  target=_blank><img style='height:20px;width:20px' src='images/f.png'></a> ";
    }
    if(leg_info.twitter_id!=null){
        social += "<a href='https://www.twitter.com/"+leg_info.twitter_id+"'  target=_blank><img style='height:20px;width:20px' src='images/t.png'></a> ";
    }
    if(leg_info.website!=null){
        social += "<a href='"+leg_info.website+"'  target=_blank><img style='height:20px;width:20px' src='images/w.png'></a> ";
    }
    document.getElementById("info_leg_social").innerHTML = social;
        
    
    var comTable = "<tbody>";
    comTable += "<tr><th width='60'>Chamber</th><th width='100'>Committee Id</th><th>Name</th></tr>";
    var CommResults = jsonCommittee.results;
     
    for(var i=0 ; i<5 && i< CommResults.length; i++){
        comTable += "<tr><td>"+ CommResults[i].chamber+"</td><td>"+CommResults[i].committee_id+"</td><td>"+CommResults[i].name+"</td></tr>";
    }
    comTable +="</tbody>";
    
    document.getElementById("comtable").innerHTML = comTable;
    
    
    
    var billTable = "<tbody>";
    billTable += "<tr><th width='80px'>Bill ID</th><th  width='300px'>Title</th><th  width='60px'>Chamber</th><th width='120px'>Bill Type</th><th>Congress</th><th>Link</th></tr>";
    var BillResults = jsonBill.results;
     
    for(var i=0 ; i<5 && i< BillResults.length; i++){
        billTable += "<tr><td>"+ BillResults[i].bill_id+"</td><td>"+BillResults[i].official_title+"</td><td>"+BillResults[i].chamber+"</td><td>"+BillResults[i].bill_type+"</td><td>"+BillResults[i].congress+"</td>";
        
        if(BillResults[i].last_version!=null && BillResults[i].last_version.urls!=null && BillResults[i].last_version.urls.pdf!=null)
        billTable += "<td><a href='"+BillResults[i].last_version.urls.pdf+"' target='_blank'>Link<a></td></tr>";
    }
    billTable +="</tbody>";
    
    document.getElementById("billtable").innerHTML = billTable;
    
    var scope = angular.element($("#myc")).scope();
    
    if(checkifpresent(scope.favlegisResults,'bioid',bioguide_id) == true){
    document.getElementById("favbutton").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='deletefavarray()'><span class='glyphicon glyphicon-star' style='color:yellow; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";
    }else{
    document.getElementById("favbutton").innerHTML = "<button type='button' class='btn btn-default pull-right' onclick='addfavarray()'><span class='glyphicon glyphicon-star' style='color:white; text-shadow:0 0 1px  black,0 0 1px  black,0 0 1px  black,0 0 1px  black ;'></span></button>";
        
    }
}

function toggleNavBar() {
    "use strict";
    if (document.getElementById("navBarLeft").style.visibility === "hidden") {
        document.getElementById("navBarLeft").style.visibility = "visible";
        document.getElementById("mainWindow").style.marginLeft = "11%";
        document.getElementById("mainWindow").style.width = "89%";
    } else {
        document.getElementById("navBarLeft").style.visibility = "hidden";
        document.getElementById("mainWindow").style.marginLeft = "0";
        document.getElementById("mainWindow").style.width = "100%";
    }
}

function makeTable() {
    "use strict";
    //http://congress.api.sunlightfoundation.com/
    var link = phpscriptAPI+"/legislators?per_page=all&apikey=6a516af642a845cfaf2478313971bf81";
    var json_obj = callAPI(link);
    var results = json_obj.results;
    results.sort(function(a, b) {
        var string1 = a.state_name;
        var string2 = b.state_name;        
       return string1.localeCompare(string2);});
    
    leg_results = results;
    
    var stateArr = ['All States','Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
    
    var states_select = ""; 
    
    for(var i=0;i<stateArr.length;i++){
        states_select += "<option>"+stateArr[i]+"</option>"
    }                         
    document.getElementById("state_select").innerHTML = states_select;

    return results;
}

function setStateFilter(){
    var selection = document.getElementById("state_select");
    var fil = selection.options[selection.selectedIndex].innerHTML;
    
    var scope = angular.element($("#myc")).scope();
    if(fil=="All States"){
       scope.$apply(function(){
        scope.f = "";
        scope.currentPage = 1;
    }) 
    }else{
    scope.$apply(function(){
        scope.f = fil;
        scope.currentPage = 1;
    })
    }
}

function setHouseFilter(){
    var selection = document.getElementById("house_input").value;
    
    var scope = angular.element($("#myc")).scope();
    scope.$apply(function(){
        scope.fh = selection;
        scope.currentPage = 1;
    })
    
}

function setSenateFilter(){
    var selection = document.getElementById("senate_input").value;
    
    var scope = angular.element($("#myc")).scope();
    scope.$apply(function(){
        scope.fs = selection;
        scope.currentPage = 1;
    })
}

function setActiveBillFilter(){
    var selection = document.getElementById("activebill_input").value;
    
    var scope = angular.element($("#myc")).scope();
    scope.$apply(function(){
        scope.abf = selection;
        scope.currentPage = 1;
    })
}

function setNewBillFilter(){
    var selection = document.getElementById("newbill_input").value;
    
    var scope = angular.element($("#myc")).scope();
    scope.$apply(function(){
        scope.nbf = selection;
        scope.currentPage = 1;
    })
}

function setCommHouseFilter(){
    var selection = document.getElementById("commhouse_input").value;
    
    var scope = angular.element($("#myc")).scope();
    scope.$apply(function(){
        scope.chf = selection;
        scope.currentPage = 1;
    })
}

function setCommSenateFilter(){
    var selection = document.getElementById("commsenate_input").value;
    
    var scope = angular.element($("#myc")).scope();
    scope.$apply(function(){
        scope.csf = selection;
        scope.currentPage = 1;
    })
}

function setCommJointFilter(){
    var selection = document.getElementById("commjoint_input").value;
    
    var scope = angular.element($("#myc")).scope();
    scope.$apply(function(){
        scope.cjf = selection;
        scope.currentPage = 1;
    })
}

function getBillsPage(){    
    $('#billsdiv').css('display','block');
    $('#legis').css('display','none');
    $('#committeesdiv').css('display','none');
    $('#favorites').css('display','none');    
}

function getLegislatorPage(){    
    $('#billsdiv').css('display','none');
    $('#legis').css('display','block');
    $('#committeesdiv').css('display','none');
    $('#favorites').css('display','none');  
}

function getCommitteesPage(){    
    $('#billsdiv').css('display','none');
    $('#legis').css('display','none');
    $('#committeesdiv').css('display','block');
    $('#favorites').css('display','none');  
}

function getFavoritesPage(){    
    $('#billsdiv').css('display','none');
    $('#legis').css('display','none');
    $('#committeesdiv').css('display','none');
    $('#favorites').css('display','block');  
}