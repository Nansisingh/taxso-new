//global declaration
var TaxSoAPI = "https://portal.taxso.in/TaxsoAPI";
//var TaxSoAPI = "https://localhost:44380";
var TrialDays = 14;
var obj={};
var ActualTotalAmount;
var CouponId;
//end


$( document ).ready(function() {
    var signupflag = localStorage.getItem('signupflag');
    var Package = localStorage.getItem('packageFlag');
    var SubscriptionTime = localStorage.getItem('subscriptionTimeFlag');
    if(signupflag=='' || signupflag=='' || signupflag=='trial')
    {
        $("#packageDiv").css("display","none");
        $("#radioSubscriptionDiv").css("display","none");
        $("#makePaymentDiv").css("display","none"); 
        $("#phoneNoDiv").css("display","none"); 
        document.getElementById("signUpHeading").textContent = 'EXPERIENCE PREMIUM PLAN FOR 14 DAYS'; 
    }
    else{
       if(Package!=null && SubscriptionTime!=null)
       {
          if(SubscriptionTime=="MonthlySubscription"){
            document.getElementById("MonthlySubscriptionID").checked = true;
            selectedPackage(Package)
            $("#selectPackage").val(Package);
         
          }
          else if(SubscriptionTime=="YearlySubscription"){
            document.getElementById("YearlySubscriptionID").checked = true;
            selectedPackage(Package)
            $("#selectPackage").val(Package);

          }
          window.localStorage.removeItem('packageFlag');
          window.localStorage.removeItem('subscriptionTimeFlag');
       }

        document.getElementById("signUpHeading").textContent  ='SIGN UP AND PURCHASE A SUBSCRIPTION';
        $("#freeTrailDiv").css("display","none");
        $("#makePaymentDiv").css("display","block");
       
    }

     
});

function processClientOnboarding()
{   
    // var elements = document.getElementById("onboardingForm").elements;
    // for(var i = 0 ; i < elements.length ; i++){
    //     var item = elements.item(i);
    //     obj[item.name] = item.value;
    // }
    let companyName = $("#CompanyName").val();
    let emailTo = $("#EmailTo").val();
    if (companyName != null && (companyName).trim() != "" && (emailTo).trim() != "" && emailTo != null) {
        if (validateEmail(emailTo)) {
            $("#loaderDiv").css("display", "flex");
            $("#onboardingFormDiv").css("display", "none")
            if (emailTo != '') {
                $.post(TaxSoAPI + '/ClientOnboarding/getEmailDetail',
                    { companyName: companyName, emailId: emailTo, action: 'Get email existed or not' }
                    , { contentType: 'application/json; charset=utf-8' })
                    .success(function (res) {
                        let EmailDetail = res;
                        if (EmailDetail != null){
                            if (EmailDetail[0].emailCount < 1) {
                              
                                document.getElementById("submitbtn").setAttribute('disabled', 'true');
                                $.post(TaxSoAPI + '/ClientOnboarding/createTaxSoClient',
                                    { companyName: companyName, emailId: emailTo, subscriptionDays: TrialDays, action: 'client_onboarding', isInTrialSubscription: 1 }
                                    , { contentType: 'application/json; charset=utf-8' })
                                    .success(function (res) {
                                        if (res != null) {
                                            $("#loaderDiv").css("display", "none")
                                            $("#onboardingFormDiv").css("display", "block")
                                            document.getElementById("submitbtn").setAttribute('disabled', 'false');
                                            var password = res.password;
                                            var username = res.username
                                            sendEmailToOnboardngClient(companyName, emailTo, password, username);
                                        }

                                    })
                                    .error(function (err) {
                                        console.log("err" + err);
                                    });
                            }
                            else{
                                errorToaster('The email address you have entered is already registered')
                                $("#loaderDiv").css("display", "none")
                                $("#onboardingFormDiv").css("display", "block")
                            }
                        }
                    })
                    .error(function (err) {
                        console.log("err" + err);
                        $("#submitbtn").attr("disabled", false);
                    });
            }

        }
        else {
            errorToaster('Email id ' + emailTo + ' is not valid :(')
        }
    }
    else {
        document.getElementById("statusdiv").style.display = "block";
        document.getElementById("status").innerHTML = "Please fill required fields!!";
        document.getElementById("status").style.color = "#b31217";
        document.getElementById("status").style.display = "inline";
        setTimeout(function () { document.getElementById("statusdiv").style.display = "none"; }, 3000);
    }
}


function sendEmailToOnboardngClient(companyName,emailId,password,username){
    var info={};
    var name = companyName; 
    //document.getElementById("companyName").innerText = companyName;
    document.getElementById("Username").innerText = username;
    document.getElementById("Password").innerText = password;
    info.EmailTo= emailId;
    info.EmailSubject="Arohar Technologies has received your request";
    info.EmailBody= document.getElementById('emailtemplate').innerHTML;
    info.emailAttachment = "";
    info.emailFrom = "techsupport@arohar.com";
    info.emailSMTPAddress = "us2.smtp.mailhostbox.com";
    info.emailPortNumber = "587";
    info.emailSenderName = "Arohar Technologies";
    info.emailToCc = "";
	info.emailUseSSL = "Yes";
    $.ajax({
        method: 'POST',
        url: 'https://www.arohar.com/EmailWebService.asmx/SendEmail',
        data: "{info:" + JSON.stringify(info) + "}",
        contentType: 'application/json; charset=utf-8',
        processData : false,
        success: function () { 
            successToaster('Your trial request submit. Mail sent to your email id');
            setTimeout(function(){window.location.href='index.html'},4000);
        },
        error: function () {
            document.getElementById("statusdiv").style.display="block";
            document.getElementById("status").innerHTML="Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color="#b31217";
            document.getElementById("status").style.display="inline";
            setTimeout(function(){window.location.href='index.html'},3000);
        },
        failure: function () {
            document.getElementById("statusdiv").style.display="block";
            document.getElementById("status").innerHTML="Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color="#b31217";
            document.getElementById("status").style.display="inline";
            setTimeout(function(){window.location.href='index.html'},3000);
        }
    });
}

function makePayment() {
    var TandCcheckBox = document.getElementById('tandc');
    if (TandCcheckBox.checked) {
        $("#loaderDiv").css("display", "flex")
        $("#onboardingFormDiv").css("display", "none")
        let amount = document.getElementById("totalAmount").innerText;
        amount = amount.replace(/\,/g, ''); // 1125, but a string, so convert it to number
        amount = parseInt(amount, 10);

        let companyName = $("#CompanyName").val();
        let emailTo = $("#EmailTo").val();
        let phoneNo = $("#PhoneNo").val();

        let selectPackage = document.getElementById("selectPackage").value;


        if (selectPackage == 'Silver') {
            var packageType = 'Silver';
            var oneMonth = 1200;
            var oneYear = 8000;
        }
        else if (selectPackage == 'Gold') {
            var packageType = 'Gold';
            var oneMonth = 1500;
            var oneYear = 10000;
        }
        else if (selectPackage == 'Platinum') {
            var packageType = 'Platinum';
            var oneMonth = 1800;
            var oneYear = 12000;
        }
        let subscriptionDays = 14;
        if (document.getElementById('MonthlySubscriptionID').checked) {
            subscriptionDays = 30;
            packageTimePeriod = 'Monthly'
        }

        else if (document.getElementById('YearlySubscriptionID').checked) {
            subscriptionDays = 365;
            packageTimePeriod = 'OneYear'
        }
        if (companyName != '' && emailTo != '' && phoneNo != '' && selectPackage != '') {
            if (validateEmail(emailTo)) {

                $("#loaderDiv").css("display", "flex");
                $("#onboardingFormDiv").css("display", "none")
                if (emailTo != '') {
                    $.post(TaxSoAPI + '/ClientOnboarding/getEmailDetail',
                        { companyName: companyName, emailId: emailTo, action: 'Get email existed or not' }
                        , { contentType: 'application/json; charset=utf-8' })
                        .success(function (res) {
                            let EmailDetail = res;
                            if (EmailDetail != null) {
                                if (EmailDetail[0].emailCount < 1) {

                                    const today = new Date();
                                    const random = (Math.random() + 1).toString(36).substring(7);
                                    let receipt = 'rcptid-' + today.toJSON().slice(0, 13) + "-" + random;
                                    let razorpayApiObj = {};
                                    razorpayApiObj.amount = amount;
                                    razorpayApiObj.receipt = receipt;
                                    $.ajax({

                                        url: TaxSoAPI + '/RazorpayApi/createOrderOnRazorpay',
                                        type: 'POST',
                                        contentType: 'application/json',
                                        data: JSON.stringify(razorpayApiObj),
                                        success: function (res) {
                                            if (res != null) {
                                                let getResponse = JSON.parse(res)
                                                if (getResponse.status == 'created') {
                                                    let companyName = $("#CompanyName").val();
                                                    callRazorpayAPI(getResponse.id, getResponse.amount, emailTo, phoneNo, companyName, subscriptionDays, packageType, packageTimePeriod)
                                                }
                                                else {
                                                    errorToaster('Something went wrong :(')
                                                }
                                            }
                                            else {
                                                errorToaster('Something went wrong :(')
                                            }
                                        },
                                        error: function () {
                                            errorToaster('Something went wrong :(')
                                        }
                                    });
                                }
                                else {
                                    errorToaster('The email address you have entered is already registered')
                                    $("#loaderDiv").css("display", "none")
                                    $("#onboardingFormDiv").css("display", "block")
                                }
                            }
                        })
                        .error(function (err) {
                            console.log("err" + err);
                            $("#submitbtn").attr("disabled", false);
                        });
                }


            }
            else {
                errorToaster('Email id ' + emailTo + ' is not valid :(')
            }

        } else {
            errorToaster('Mandatory fields required :(')
        }
    }
    else {
        errorToaster('Agree to Terms and Conditions Checkbox')
    }
}

 function callRazorpayAPI(orderId,amount,email,phoneNo,companyName,subscriptionDays,packageType,packageTimePeriod){
    var options= {
        "key": "rzp_live_q52PXpipY6g2aN", // Enter the Key ID generated from the Dashboard
        "amount": amount, // Amount is in currency subunits. Default currency INR. Hence, 100 refers to 100 paise
        "currency": "INR",
        "name": "AROHAR TECHNOLOGIES PVT. LTD",
        "description": "Subscription Transaction",
        "image": "https://Portal.Taxso.Net/Portal2/Images/TaxSo-logo-small-new-reg.PNG",
        "order_id": orderId, //This is a sample Order ID. Pass the
       //`id` obtained in the response of Step 1
        "handler": function (response){
        console.log(response.razorpay_payment_id);
        console.log(response.razorpay_order_id);
        console.log(response.razorpay_signature)
        successToaster('Your payment is successful. Mail sent to your email id')    
        $("#loaderDiv").css("display","none")
        $("#onboardingFormDiv").css("display","block")
      //alert(JSON.stringify(response))
       updatePaymentOnServer(response.razorpay_payment_id,response.razorpay_order_id,amount,companyName,email,subscriptionDays,packageType,packageTimePeriod)
    },
    "prefill": {
    "name": "",
    "email": email,
    "contact":phoneNo
    },
    "notes": {
    "address": ""
    },
    "theme": {
    "color": "#3399cc"
    }
   };
   var rzp1 = new Razorpay(options);
   rzp1.on('payment.failed', function (response){
    console.log(response.error.code);
    console.log(response.error.description);
    console.log(response.error.source);
    console.log(response.error.step);
    console.log(response.error.reason);
    console.log(response.error.metadata.order_id);
    console.log(response.error.metadata.payment_id);
    errorToaster('Payment process failed')
   });
   $("#loaderDiv").css("display","none")
   $("#onboardingFormDiv").css("display","block")
   rzp1.open();

//    document.getElementById('rzp-button1').onclick = function(e){
//     alert("rzp-rzp-button1");
//     rzp1.open();
//     e.preventDefault();
//   }
 }

 function updatePaymentOnServer(razorpay_payment_id,razorpay_order_id,amount,companyName,emailId,subscriptionDays,packageType,packageTimePeriod){
   
    $.post( TaxSoAPI + '/ClientOnboarding/createTaxSoClient', 
    {companyName: companyName,emailId:emailId,subscriptionDays:subscriptionDays,action:'client_onboarding',isInTrialSubscription:0,paymentId:razorpay_payment_id,orderId:razorpay_order_id,amount:amount,transactionFor:'Primary Company Created',packageType:packageType,packageTimePeriod:packageTimePeriod,couponCodeId:CouponId}
    ,{contentType: 'application/json; charset=utf-8'})
    .success(function (res) {
        if(res != null){
            $("#loaderDiv").css("display","none")
            $("#onboardingFormDiv").css("display","block")
            document.getElementById("submitbtn").setAttribute('disabled','false');
            var password = res.password;
            var username = res.username
            sendEmailToOnboardngClient(companyName,emailId,password,username);
        }
    })
    .error(function (err) {
        console.log("err" + err);
    });
}
 selectedPackage=(selectObject)=>{
    let selectedPackage = selectObject;  
    if(document.getElementById('MonthlySubscriptionID').checked) {   
        $("#rupeeSign").css("display","");
       document.getElementById("makePaymentBtn").disabled = false;
        
        document.getElementById("makePaymentBtn").disabled = false;
        if(selectedPackage=='Silver')
        {
            ActualTotalAmount=1200;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
        }
        else if(selectedPackage=='Gold'){
            ActualTotalAmount=1500;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
        }
        else if(selectedPackage=='Platinum'){
            ActualTotalAmount=1800;
            
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
        }
    }
    else if(document.getElementById('YearlySubscriptionID').checked){
        $("#rupeeSign").css("display","")
        document.getElementById("makePaymentBtn").disabled = false;
        if(selectedPackage=='Silver')
        {
            ActualTotalAmount=8000;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
        }
        else if(selectedPackage=='Gold'){
            ActualTotalAmount=10000;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
        }
        else if(selectedPackage=='Platinum'){
            ActualTotalAmount=12000;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
        }
    }  
 }
 
 subscriptionTimePeriod=(subscriptionTime)=>{    
    let selectedPackage=document.getElementById("selectPackage").value;
    document.getElementById("makePaymentBtn").disabled = false;
    if(subscriptionTime=='MonthlySubscription') {        
        if(selectedPackage=='Silver')
        {
            $("#rupeeSign").css("display","")
            ActualTotalAmount=1200;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);

        }
        else if(selectedPackage=='Gold'){
            $("#rupeeSign").css("display","")
            ActualTotalAmount=1500;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);

        }
        else if(selectedPackage=='Platinum'){
            $("#rupeeSign").css("display","")
              ActualTotalAmount=1800;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);

        }
    }
    else{       
        if(selectedPackage=='Silver')
        {
            $("#rupeeSign").css("display","")         
            ActualTotalAmount=8000;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);

        }
        else if(selectedPackage=='Gold'){
            $("#rupeeSign").css("display","")
            ActualTotalAmount=10000;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);

        }
        else if(selectedPackage=='Platinum'){
            $("#rupeeSign").css("display","")
            ActualTotalAmount=12000;
            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);

        }       
    }
 }

 function validateEmail (email){
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };


//Toaster's
function successToaster(alertMsg){
    var button = document.getElementById("openAlert");
    button.click();
    document.getElementById("alertTextHeading").textContent ='Awesome!';
    document.getElementById("alertTextMsg").textContent =alertMsg;
    $("#iconBox").css("backgroundColor","#04AA6D")    
    $("#loaderDiv").css("display","none")
    $("#onboardingFormDiv").css("display","block")
    $("#closeAlert").css("backgroundColor","#04AA6D")
    $("#iconBoxIcon").css("color","white")
    var element = document.getElementById("iconBoxIcon");
    $("#myModal").css("display","flex")
    element.classList.add("fa-check");
    element.classList.remove("fa-times");          
    setTimeout(function(){
        var button = document.getElementById("closeAlert");
        button.click();
    }, 5000);
}
function errorToaster(alertMsg){
    var button = document.getElementById("openAlert");
    button.click();
    document.getElementById("alertTextHeading").textContent ='Oops!';
    document.getElementById("alertTextMsg").textContent =alertMsg;
    $("#iconBox").css("backgroundColor","#b31217")    
    $("#loaderDiv").css("display","none")
    $("#onboardingFormDiv").css("display","block")
    $("#closeAlert").css("backgroundColor","#b31217")
    $("#iconBoxIcon").css("color","white")
    var element = document.getElementById("iconBoxIcon");
    $("#myModal").css("display","flex")
    element.classList.remove("fa-check");
    element.classList.add("fa-times");  
    setTimeout(function(){
        var button = document.getElementById("closeAlert");
        button.click();
    }, 5000);
}


  function reDirectToSignUp(flag){
    window.location.href = "Signup.html";
    localStorage.setItem("signupflag", flag);
}


function reDirectToSignUpFromPricingSignUp(package){
    window.location.href = "Signup.html";
    localStorage.setItem("signupflag", 'subscription');
    localStorage.setItem("packageFlag", package);
  
}


function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function ApplyCoupon() {
    var CouponName = document.getElementById('ApplyCouponInput').value;
    var TotalAmount = ActualTotalAmount
   if(TotalAmount != undefined)
   {
    if (CouponName!='') {
        $("#AmountLoaderDiv").css("display", "flex")
        $("#makePaymentBtn").css("display", "none")  
        $("#OrignalCostParagraph").css("display", "none")  
  $.post( TaxSoAPI + '/ClientOnboarding/getCouponDetail', 
    {couponName: CouponName,action:'Get Subscription Coupon For Existing Users'}
    ,{contentType: 'application/json; charset=utf-8'})
    .success(function (res) {   
        let CouponCodeResponse = res;                         
     if (CouponCodeResponse.length>0) {
        $("#CouponCodeLabel").css("display", "none")
        $("#ApplyCouponForm").css("display", "none")
        $("#CouponWarning").css("display", "none")
        $("#CouponValid").css("display", "")
        document.getElementById("CouponName").innerHTML = CouponName;
        CouponId=CouponCodeResponse[0].CouponId;
        if (CouponCodeResponse[0].DiscountPercent != null) {                          

             TotalAmount = TotalAmount - (TotalAmount * CouponCodeResponse[0].DiscountPercent / 100)
            document.getElementById("totalAmount").innerHTML = numberWithCommas(TotalAmount);
           // document.getElementById("CostAfterCouponApply").innerHTML = numberWithCommas(TotalAmount);
            $("#OrignalCost").css("text-decoration", "line-through")
            // $("#CostAfterCouponApply").css("display", "")
            $("#AmountLoaderDiv").css("display", "none")
            $("#makePaymentBtn").css("display", "")
           $("#OrignalCostParagraph").css("display", "")  

        }
        else {                                     
             TotalAmount = TotalAmount - CouponCodeResponse[0].DiscountAmount;
            document.getElementById("totalAmount").innerHTML = numberWithCommas(TotalAmount);
            // document.getElementById("CostAfterCouponApply").innerHTML = numberWithCommas(TotalAmount);
            $("#OrignalCost").css("text-decoration", "line-through")
            //$("#CostAfterCouponApply").css("display", "")
            $("#AmountLoaderDiv").css("display", "none")
            $("#makePaymentBtn").css("display", "")
            $("#OrignalCostParagraph").css("display", "")  

        }    
    }
    else {
        $("#CouponWarning").css("display", "")
        $("#CouponValid").css("display", "none")
        $("#AmountLoaderDiv").css("display", "none")
        $("#makePaymentBtn").css("display", "")
        $("#CostAfterCouponApply").css("display", "none")
        $("#OrignalCostParagraph").css("display", "")  

    }

  
    })
    .error(function (err) {
        console.log("err" + err);
    });
       
    }
}
else{
    errorToaster("Plese select any package")
}

}

function RemoveCouponCode() {

    document.getElementById("totalAmount").innerHTML = numberWithCommas(ActualTotalAmount);
    CouponId='';
 
    $("#CouponCodeLabel").css("display", "")
    $("#ApplyCouponForm").css("display", "")
    $("#CouponValid").css("display", "none")
    $("#OrignalCost").css("text-decoration", "")
    // document.getElementById("CostAfterCouponApply").textContent = '';
    // $("#CostAfterCouponApply").css("display", "none")
    $("#OrignalCostParagraph").css("display", "")  


}

// function onChangeEmail(){
//     let companyName = $("#CompanyName").val();
//     let emailValue= document.getElementById("EmailTo").value;
//     $("#submitbtn").attr("disabled", true);
//     if (emailValue!='') { 
//   $.post( TaxSoAPI + '/ClientOnboarding/getEmailDetail', 
//     { companyName: companyName,emailId: emailValue,action:'Get email existed or not'}
//     ,{contentType: 'application/json; charset=utf-8'})
//     .success(function (res) {   
//         let EmailDetail = res; 
//         $("#submitbtn").attr("disabled", false);
//         if(EmailDetail[0].emailCount>0){
//              $('#selectedEmail').text(emailValue);
//              $('#EmailTo').val('');
//              $("#EmailExistLabel").css("display", "");            
//            }
//         else{
//             $("#EmailExistLabel").css("display", "none");   
//         }
//     })
//     .error(function (err) {
//         console.log("err" + err);
//         $("#submitbtn").attr("disabled", false);
//     });
//     }
//}