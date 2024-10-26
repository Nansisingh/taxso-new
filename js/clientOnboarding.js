//global declaration
var TaxSoAPI = "https://portal.taxso.in/TaxsoAPI";
//var TaxSoAPI = "https://localhost:44380";
var TrialDays = 14;
var obj = {};
var ActualTotalAmount;
var CouponId;
var statelist;
var email = "";
var AmountForRazorPay = "";
var timerInterval;
var timeOfOTPExpiry;
//end

// document.onkeydown = function(e) {
//     if(e.keyCode == 123) {
//     return false;
//     }
//     if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
//     return false;
//     }
//     if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
//     return false;
//     }
//     if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
//     return false;
//     }
//     }
$(document).ready(function () {

    var PackageType = localStorage.getItem('PackageType');
    var IsFreeTrial = localStorage.getItem('IsFreeTrial');
    var PlanType = localStorage.getItem('PlanType');
    console.log(PackageType, PlanType);
    var signupflag = localStorage.getItem('signupflag');
    var Package = localStorage.getItem('packageFlag');
    var SubscriptionTime = localStorage.getItem('subscriptionTimeFlag');
    if (signupflag == '' || signupflag == '' || signupflag == 'trial') {
        $("#packageDiv").css("display", "none");
        $("#radioSubscriptionDiv").css("display", "none");
        $("#makePaymentDiv").css("display", "none");
        $("#phoneNoDiv").css("display", "none");
        document.getElementById("signUpHeading").textContent = 'EXPERIENCE PREMIUM PLAN FOR 14 DAYS';
    } else {
        if (PackageType != null && PlanType != null && IsFreeTrial != "1") {
            if (PlanType == "month") {
                document.getElementById("MonthlySubscriptionID").checked = true;
                selectedPackage(PackageType)
                $("#selectPackage").val(PackageType);

            } else if (PlanType == "year") {
                document.getElementById("YearlySubscriptionID").checked = true;
                selectedPackage(PackageType)
                $("#selectPackage").val(PackageType);

            }
            // window.localStorage.removeItem('PackageType');
            // window.localStorage.removeItem('PlanType');
        } else if (IsFreeTrial == "1") {
            FreeTrial();
            //window.localStorage.removeItem('IsFreeTrial');
        }

        // document.getElementById("signUpHeading").textContent = 'SIGN UP AND PURCHASE A SUBSCRIPTION';
        //  $("#freeTrailDiv").css("display", "none");
        //  $("#makePaymentDiv").css("display", "block");

    }
    GetStateList();


});


function processClientOnboarding() {
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
            // if (emailTo != '') {
            //     $.post(TaxSoAPI + '/ClientOnboarding/getEmailDetail',
            //         { companyName: companyName, emailId: emailTo, action: 'Get email existed or not' }
            //         , { contentType: 'application/json; charset=utf-8' })
            //         .success(function (res) {
            //             let EmailDetail = res;
            //             if (EmailDetail != null){
            //                 if (EmailDetail[0].emailCount < 1) {

            document.getElementById("submitbtn").setAttribute('disabled', 'true');
            $.post(TaxSoAPI + '/ClientOnboarding/createTaxSoClient', { companyName: companyName, emailId: emailTo, subscriptionDays: TrialDays, action: 'client_onboarding', isInTrialSubscription: 1 }, { contentType: 'application/json; charset=utf-8' })
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
            //                 }
            //                 else{
            //                     errorToaster('The email address you have entered is already registered')
            //                     $("#loaderDiv").css("display", "none")
            //                     $("#onboardingFormDiv").css("display", "block")
            //                 }
            //             }
            //         })
            //         .error(function (err) {
            //             console.log("err" + err);
            //             $("#submitbtn").attr("disabled", false);
            //         });
            // }

        } else {
            errorToaster('Email id ' + emailTo + ' is not valid :(')
        }
    } else {
        document.getElementById("statusdiv").style.display = "block";
        document.getElementById("status").innerHTML = "Please fill required fields!!";
        document.getElementById("status").style.color = "#b31217";
        document.getElementById("status").style.display = "inline";
        setTimeout(function () { document.getElementById("statusdiv").style.display = "none"; }, 3000);
    }
}


function sendEmailToOnboardngClient(companyName, emailId, password, username, flag) {
    var info = {};
    var name = companyName;
    //document.getElementById("companyName").innerText = companyName;
    document.getElementById("Username").innerText = username;
    document.getElementById("Password").innerText = password;
    document.getElementById("TemplateCompanyName").innerText = companyName;
    document.getElementById("TemplateEmailId").innerText = emailId;


    info.emailId = emailId;
    // info.EmailSubject = "Arohar Technologies has received your request";
    if (flag == "registered") {
        document.getElementById("RegisteredTemplateCompanyName").innerText = companyName;
        document.getElementById("RegisteredTemplateEmailId").innerText = emailId;
        document.getElementById("RegisteredUsername").innerText = username;
        document.getElementById("RegisteredPassword").innerText = password;
        info.EmailBody = document.getElementById('emailtemplateregistered').innerHTML;

    } else {
        info.EmailBody = document.getElementById('emailtemplatesubscription').innerHTML;
    }
    // info.emailAttachment = "";
    // info.emailFrom = "techsupport@arohar.com";
    // info.emailPassword="JcOTI%@9"
    // info.emailSMTPAddress = "us2.smtp.mailhostbox.com";
    // info.emailPortNumber = "587";
    // info.emailSenderName = "Arohar Technologies";
    // info.emailToCc = "";
    // info.emailUseSSL = "Yes";
    info.companyName = $("#CompanyName").val();
    $.ajax({
        method: 'POST',
        url: TaxSoAPI + '/ClientOnboarding/SendNotification',
        data: JSON.stringify(info),
        contentType: 'application/json; charset=utf-8',
        processData: false,
        success: function () {
            // successToaster('Your trial request submitted. Mail sent to your email id');
            // setTimeout(function () { window.location.href = 'index.html' }, 8000);
        },
        error: function () {
            document.getElementById("statusdiv").style.display = "block";
            document.getElementById("status").innerHTML = "Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color = "#b31217";
            document.getElementById("status").style.display = "inline";
            setTimeout(function () { window.location.href = 'index.html' }, 5000);
        },
        failure: function () {
            document.getElementById("statusdiv").style.display = "block";
            document.getElementById("status").innerHTML = "Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color = "#b31217";
            document.getElementById("status").style.display = "inline";
            setTimeout(function () { window.location.href = 'index.html' }, 5000);
        }
    });
}

function makePayment() {
    var TandCcheckBox = document.getElementById('tandc');
    let companyName = $("#CompanyName").val();
    let emailTo = $("#EmailTo").val();
    let gstin = $("#Gstinno").val();
    email = emailTo;
    let stateId = $("#selectState").val();
    $('#errorCompanyName').css('display', 'none');
    $('#errorEmailTo').css('display', 'none');
    $('#errorGstin').css('display', 'none');
    $('#errortandc').css('display', 'none');
    if (TandCcheckBox.checked) {
        // let amount = document.getElementById("totalAmount").innerText;
        // amount = amount.replace(/\,/g, ''); // 1125, but a string, so convert it to number
        // amount = parseInt(amount, 10);
        let amount = AmountForRazorPay;

        let companyName = $("#CompanyName").val();
        let emailTo = $("#EmailTo").val();
        let Gstinno = $("#Gstinno").val();

        let selectPackage = document.getElementById("selectPackage").value;


        if (selectPackage == 'Silver') {
            var packageType = 'SILVER';
            var oneMonth = 1200;
            var oneYear = 8000;
        } else if (selectPackage == 'Gold') {
            var packageType = 'GOLD';
            var oneMonth = 1500;
            var oneYear = 10000;
        } else if (selectPackage == 'Platinum') {
            var packageType = 'PLATINUM';
            var oneMonth = 1800;
            var oneYear = 12000;
        }
        let subscriptionDays = 14;
        if (document.getElementById('MonthlySubscriptionID').checked) {
            subscriptionDays = 30;
            packageTimePeriod = 'Monthly'
        } else if (document.getElementById('YearlySubscriptionID').checked) {
            subscriptionDays = 365;
            packageTimePeriod = 'OneYear'
        }
        let uniqueGstinFlag = CheckUniqueGstin();
        if (uniqueGstinFlag == 0) {
            if (companyName != '' && emailTo != '' && Gstinno != '' && selectPackage != '') {
                if (validateEmail(emailTo)) {

                    if (emailTo != '') {
                        const today = new Date();
                        const random = (Math.random() + 1).toString(36).substring(7);
                        let receipt = 'rcptid-' + today.toJSON().slice(0, 13) + "-" + random;
                        let razorpayApiObj = {};
                        razorpayApiObj.receipt = receipt;
                        razorpayApiObj.packageType = packageType;
                        razorpayApiObj.packageTimePeriod = packageTimePeriod;
                        $("#validatebutton").prop("disabled", false);
                        $.ajax({

                            url: TaxSoAPI + '/RazorpayApi/createOrderOnRazorpayWebsite',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(razorpayApiObj),
                            success: function (res) {
                                if (res) {
                                    let getResponse = res
                                    let companyName = $("#CompanyName").val();
                                    callRazorpayAPI(getResponse, emailTo, Gstinno, companyName, subscriptionDays, packageType, packageTimePeriod, stateId)

                                } else {
                                    errorToaster('Something went wrong :(')
                                }
                            },
                            error: function () {
                                errorToaster('Something went wrong :(')
                            }
                        });

                    }


                } else {
                    // errorToaster('Email id ' + emailTo + ' is not valid :(')
                    var emailspan = document.getElementById('errorEmailTo');
                    emailspan.textContent = 'Email id ' + emailTo + ' is not valid ';
                    $('#errorEmailTo').css('display', 'block');
                }

            } else {
                errorToaster('Mandatory fields required :(')
            }
        }
    }
}

function callRazorpayAPI(Options, email, Gstinno, companyName, subscriptionDays, packageType, packageTimePeriod, stateId) {
    
    Options = JSON.parse(Options);
    Options['prefill'] = { 'name': '', 'email': email};
    Options['handler'] = function (response) {
        $('#loaderDiv').css('display', 'none');
        $('#onboardingFormDiv').css('display', 'none');
        updatePaymentOnServer(response.razorpay_payment_id, response.razorpay_order_id, Options.amount, companyName, email, subscriptionDays, packageType, packageTimePeriod, Gstinno, stateId)
    };
    Options['notes'] = { 'address': '' };
    Options['theme'] = { 'color': '#3399cc' };
    Options['modal'] = {
        'ondismiss': function () {
            onCloseRazorPay();
        }
    };
    var rzp1 = new Razorpay(Options);
    rzp1.on('payment.failed', function (response) {
        console.log(response.error.code);
        console.log(response.error.description);
        console.log(response.error.source);
        console.log(response.error.step);
        console.log(response.error.reason);
        console.log(response.error.metadata.order_id);
        console.log(response.error.metadata.payment_id);
        errorToaster('Payment process failed')


    });

    $("#loaderDiv").css("display", "none")
    $("#onboardingFormDiv").css("display", "block")
    rzp1.open();
    $("#submitbtn").css("display", "none");
    $("#paymentloader").css("display", "inline");

    //    document.getElementById('rzp-button1').onclick = function(e){
    //     alert("rzp-rzp-button1");
    //     rzp1.open();
    //     e.preventDefault();
    //   }
}

function updatePaymentOnServer(razorpay_payment_id, razorpay_order_id, amount, companyName, emailId, subscriptionDays, packageType, packageTimePeriod, Gstinno, stateid) {
    $("#submitbtn").css("display", "block");
    thanksmsgheading = document.getElementById("thanksmsg");
    if (packageType == 'SILVER') {
        thanksmsgheading.innerHTML = thanksmsgheading.innerHTML + (email);
    } else {
        thanksmsgheading.innerHTML = thanksmsgheading.innerHTML + '(' + email + ')' + '<br>Your Payment Reference No :' + razorpay_payment_id;
    }
    document.getElementById("TemplatePaymentNo").innerText = razorpay_payment_id;
    document.getElementById("TemplatePlan").innerText = packageType + " ( ₹ " + AmountForRazorPay + "/" + packageTimePeriod + " )";

    $.post(TaxSoAPI + '/ClientOnboarding/createTaxSoClient', { companyName: companyName, emailId: emailId, subscriptionDays: subscriptionDays, action: 'client_onboarding', isInTrialSubscription: 0, paymentId: razorpay_payment_id, orderId: razorpay_order_id, amount: amount, transactionFor: 1, packageType: packageType, packageTimePeriod: packageTimePeriod, couponCodeId: CouponId, GSTinNO: Gstinno, StateId: stateid }, { contentType: 'application/json; charset=utf-8' })
        .success(function (res) {
            if (res != null) {
                $("#loaderDiv").css("display", "none");
                $("#formdiv").css("display", "none");
                $("#thanksdiv").css("display", "block");
                document.getElementById("submitbtn").setAttribute('disabled', 'false');
                var password = res.password;
                var username = res.username
                sendEmailToOnboardngClient(companyName, emailId, password, username, "notregistered");
            }
        })
        .error(function (err) {
            console.log("err" + err);
        });
}
selectedPackage = (selectObject) => {
    let selectedPackage = selectObject;
    if (document.getElementById('MonthlySubscriptionID').checked) {
        $("#rupeeSign").css("display", "");
        document.getElementById("makePaymentBtn").disabled = false;


        if (selectedPackage == 'Silver') {
            $('#submitbtn').css('display', 'block');
            $('#RegisterButton').css('display', 'none');
            $('#radioSubscriptionDiv').css('display', 'block');
            ActualTotalAmount = 199;

            //document.getElementById("offerprice").textContent = '00';
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            //document.getElementById("gstprice").textContent = '00';
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            //ActualTotalAmount = ActualTotalAmount+gst;
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);

            //  document.getElementById("totalprice").textContent = '00';

            // document.getElementById("totalAmount").textContent = '00';
            //  document.getElementById("OrignalCost").textContent ='00';
            //  document.getElementById("ActualPrice").textContent = '00';




            document.getElementById('selectPackage').style.backgroundImage = 'url(https://mybillbook.in/static-assets/images/pricing%20page/bluecrown.svg)';
            document.getElementById('selectPackage').style.backgroundRepeat = 'no-repeat';
            document.getElementById('selectPackage').style.backgroundPosition = 'left';
            document.getElementById('selectPackage').style.backgroundSize = '24px';
            $('#packageimg').attr('src', 'https://mybillbook.in/static-assets/images/pricing%20page/bluecrown.svg');
            $('#packagename').text('Silver');
            $('#packagename').css('color', '#485eb0');


        } else if (selectedPackage == 'Gold') {
            $('#submitbtn').css('display', 'block');
            $('#RegisterButton').css('display', 'none');
            $('#radioSubscriptionDiv').css('display', 'block');
            ActualTotalAmount = 499;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById('selectPackage').style.background = 'url(https://mybillbook.in/static-assets/images/pricing%20page/goldencrown.svg) ';
            document.getElementById('selectPackage').style.backgroundRepeat = 'no-repeat';
            document.getElementById('selectPackage').style.backgroundPosition = 'left';
            document.getElementById('selectPackage').style.backgroundSize = '24px';
            $('#packageimg').attr('src', 'https://mybillbook.in/static-assets/images/pricing%20page/goldencrown.svg');
            $('#packagename').text('Gold');
            $('#packagename').css('color', '#db631a');

        } else if (selectedPackage == 'Platinum') {
            $('#submitbtn').css('display', 'block');
            $('#RegisterButton').css('display', 'none');
            $('#radioSubscriptionDiv').css('display', 'block');
            ActualTotalAmount = 999;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById('selectPackage').style.background = 'url(https://mybillbook.in/static-assets/images/pricing%20page/greencrown.svg) ';
            document.getElementById('selectPackage').style.backgroundRepeat = 'no-repeat';
            document.getElementById('selectPackage').style.backgroundPosition = 'left';
            document.getElementById('selectPackage').style.backgroundSize = '24px';
            $('#packageimg').attr('src', 'https://mybillbook.in/static-assets/images/pricing%20page/greencrown.svg');
            $('#packagename').text('Platinum');
            $('#packagename').css('color', '#06b181');
        }
    } else if (document.getElementById('YearlySubscriptionID').checked) {
        $("#rupeeSign").css("display", "")
        document.getElementById("makePaymentBtn").disabled = false;
        if (selectedPackage == 'Silver') {
            ActualTotalAmount = 2000;
            //document.getElementById("offerprice").textContent = '00';
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);

            var gst = (ActualTotalAmount * 18) / 100;
            //document.getElementById("gstprice").textContent = '00';
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            //  ActualTotalAmount = ActualTotalAmount+gst;

            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);

            // document.getElementById("totalprice").textContent = '00';

            // document.getElementById("totalAmount").textContent = '00';
            // document.getElementById("OrignalCost").textContent = '00';
            // document.getElementById("ActualPrice").textContent = '00';

            $('#submitbtn').css('display', 'block');
            $('#RegisterButton').css('display', 'none');
            $('#radioSubscriptionDiv').css('display', 'block');
            document.getElementById('selectPackage').style.background = 'url(https://mybillbook.in/static-assets/images/pricing%20page/bluecrown.svg) ';
            document.getElementById('selectPackage').style.backgroundRepeat = 'no-repeat';
            document.getElementById('selectPackage').style.backgroundPosition = 'left';
            document.getElementById('selectPackage').style.backgroundSize = '24px';
            $('#packageimg').attr('src', 'https://mybillbook.in/static-assets/images/pricing%20page/bluecrown.svg');
            $('#packagename').text('Silver');
            $('#packagename').css('color', '#485eb0');

        } else if (selectedPackage == 'Gold') {
            $('#submitbtn').css('display', 'block');
            $('#RegisterButton').css('display', 'none');
            $('#radioSubscriptionDiv').css('display', 'block');
            ActualTotalAmount = 5500;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById('selectPackage').style.background = 'url(https://mybillbook.in/static-assets/images/pricing%20page/goldencrown.svg)';
            document.getElementById('selectPackage').style.backgroundRepeat = 'no-repeat';
            document.getElementById('selectPackage').style.backgroundPosition = 'left';
            document.getElementById('selectPackage').style.backgroundSize = '24px';
            $('#packageimg').attr('src', 'https://mybillbook.in/static-assets/images/pricing%20page/goldencrown.svg');
            $('#packagename').text('Gold');
            $('#packagename').css('color', '#db631a');
        } else if (selectedPackage == 'Platinum') {
            $('#submitbtn').css('display', 'block');
            $('#RegisterButton').css('display', 'none');
            $('#radioSubscriptionDiv').css('display', 'block');
            ActualTotalAmount = 11000;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById('selectPackage').style.background = 'url(https://mybillbook.in/static-assets/images/pricing%20page/greencrown.svg) ';
            document.getElementById('selectPackage').style.backgroundRepeat = 'no-repeat';
            document.getElementById('selectPackage').style.backgroundPosition = 'left';
            document.getElementById('selectPackage').style.backgroundSize = '24px';
            $('#packageimg').attr('src', 'https://mybillbook.in/static-assets/images/pricing%20page/greencrown.svg');
            $('#packagename').text('Platinum');
            $('#packagename').css('color', '#06b181');
        }
    }
}

subscriptionTimePeriod = (subscriptionTime) => {
    let selectedPackage = document.getElementById("selectPackage").value;
    document.getElementById("makePaymentBtn").disabled = false;
    if (subscriptionTime == 'MonthlySubscription') {
        if (selectedPackage == 'Silver') {
            ActualTotalAmount = 199;

            //document.getElementById("offerprice").textContent = '00';
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            //document.getElementById("gstprice").textContent = '00';
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            // ActualTotalAmount = ActualTotalAmount+gst;
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;

            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);

            //document.getElementById("totalprice").textContent = '00';

            // document.getElementById("totalAmount").textContent = '00';
            // document.getElementById("OrignalCost").textContent = '00';
            // document.getElementById("ActualPrice").textContent = '00';


        } else if (selectedPackage == 'Gold') {
            ActualTotalAmount = 499;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);

        } else if (selectedPackage == 'Platinum') {
            ActualTotalAmount = 999;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);

        }
    } else {
        if (selectedPackage == 'Silver') {
            ActualTotalAmount = 2000;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            //document.getElementById("offerprice").textContent = '00';
            var gst = (ActualTotalAmount * 18) / 100;
            //document.getElementById("gstprice").textContent = '00';
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;

            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);
            ActualTotalAmount = ActualTotalAmount + gst;

            // document.getElementById("totalprice").textContent = '00';

            // document.getElementById("totalAmount").textContent = '00';
            // document.getElementById("OrignalCost").textContent = '00';
            // document.getElementById("ActualPrice").textContent = '00';

        } else if (selectedPackage == 'Gold') {
            ActualTotalAmount = 5500;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);

        } else if (selectedPackage == 'Platinum') {
            ActualTotalAmount = 11000;
            document.getElementById("offerprice").textContent = numberWithCommas(ActualTotalAmount);
            var gst = (ActualTotalAmount * 18) / 100;
            document.getElementById("gstprice").textContent = numberWithCommas(gst);
            ActualTotalAmount = parseFloat((ActualTotalAmount + gst).toFixed(2));
            AmountForRazorPay = ActualTotalAmount;
            document.getElementById("totalprice").textContent = numberWithCommas(ActualTotalAmount);

            document.getElementById("totalAmount").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("OrignalCost").textContent = numberWithCommas(ActualTotalAmount);
            document.getElementById("ActualPrice").textContent = numberWithCommas(ActualTotalAmount);

        }
    }
}

function FreeTrial() {
    $("#rupeeSign").css("display", "");
    document.getElementById("makePaymentBtn").disabled = false;
    document.getElementById("selectPackage").disabled = true;
    $('#submitbtn').css('display', 'none');
    $('#RegisterButton').css('display', 'block');
    $('#radioSubscriptionDiv').css('display', 'none');

    document.getElementById("offerprice").textContent = '00';
    document.getElementById("gstprice").textContent = '00';
    document.getElementById("totalprice").textContent = '00';
    document.getElementById("totalAmount").textContent = '00';
    document.getElementById("OrignalCost").textContent = '00';
    document.getElementById("ActualPrice").textContent = '00';

    document.getElementById('selectPackage').style.backgroundImage = 'url(https://mybillbook.in/static-assets/images/pricing%20page/bluecrown.svg)';
    document.getElementById('selectPackage').style.backgroundRepeat = 'no-repeat';
    document.getElementById('selectPackage').style.backgroundPosition = 'left';
    document.getElementById('selectPackage').style.backgroundSize = '24px';
    document.getElementById('selectPackage').value = 'Silver';
    document.getElementById('selectPackage').style.backgroundColor = '#ffffff';
    $('#packageimg').attr('src', 'https://mybillbook.in/static-assets/images/pricing%20page/bluecrown.svg');
    $('#packagename').text('Silver');
    $('#packagename').css('color', '#485eb0');
}

function validateEmail(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};


//Toaster's
function successToaster(alertMsg) {
    var button = document.getElementById("openAlert");
    button.click();
    document.getElementById("alertTextHeading").textContent = 'Awesome!';
    document.getElementById("alertTextMsg").textContent = alertMsg;
    $("#iconBox").css("backgroundColor", "#04AA6D")
    $("#loaderDiv").css("display", "none")
    $("#onboardingFormDiv").css("display", "block")
    $("#closeAlert").css("backgroundColor", "#04AA6D")
    $("#iconBoxIcon").css("color", "white")
    var element = document.getElementById("iconBoxIcon");
    $("#myModal").css("display", "flex")
    element.classList.add("fa-check");
    element.classList.remove("fa-times");
    setTimeout(function () {
        var button = document.getElementById("closeAlert");
        button.click();
    }, 5000);
}

function errorToaster(alertMsg) {
    var button = document.getElementById("openAlert");
    button.click();
    document.getElementById("alertTextHeading").textContent = 'Oops!';
    document.getElementById("alertTextMsg").textContent = alertMsg;
    // $("#iconBox").css("backgroundColor", "#b31217")
    $("#loaderDiv").css("display", "none")
    $("#onboardingFormDiv").css("display", "block")
    $("#closeAlert").css("backgroundColor", "#b31217")
    // $("#iconBoxIcon").css("color", "white")
    var element = document.getElementById("iconBoxIcon");
    $("#myModal").css("display", "flex")
    element.classList.remove("fa-check");
    element.classList.add("fa-times");
    // setTimeout(function () {
    //     var button = document.getElementById("closeAlert");
    //     button.click();
    // }, 5000);
}


function reDirectToSignUp(flag) {
    window.location.href = "Signup.html";
    localStorage.setItem("signupflag", flag);
}


function reDirectToSignUpFromPricingSignUp(package) {
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
    if (TotalAmount != undefined) {
        if (CouponName != '') {
            $("#AmountLoaderDiv").css("display", "flex")
            $("#makePaymentBtn").css("display", "none")
            $("#OrignalCostParagraph").css("display", "none")
            $.post(TaxSoAPI + '/ClientOnboarding/getCouponDetail', { couponName: CouponName, action: 'Get Subscription Coupon For Existing Users' }, { contentType: 'application/json; charset=utf-8' })
                .success(function (res) {
                    let CouponCodeResponse = res;
                    if (CouponCodeResponse.length > 0) {
                        $("#CouponCodeLabel").css("display", "none")
                        $("#ApplyCouponForm").css("display", "none")
                        $("#CouponWarning").css("display", "none")
                        $("#CouponValid").css("display", "")
                        document.getElementById("CouponName").innerHTML = CouponName;
                        CouponId = CouponCodeResponse[0].CouponId;
                        if (CouponCodeResponse[0].DiscountPercent != null) {

                            TotalAmount = TotalAmount - (TotalAmount * CouponCodeResponse[0].DiscountPercent / 100)
                            document.getElementById("totalAmount").innerHTML = numberWithCommas(TotalAmount);
                            // document.getElementById("CostAfterCouponApply").innerHTML = numberWithCommas(TotalAmount);
                            $("#OrignalCost").css("text-decoration", "line-through")
                            // $("#CostAfterCouponApply").css("display", "")
                            $("#AmountLoaderDiv").css("display", "none")
                            $("#makePaymentBtn").css("display", "")
                            $("#OrignalCostParagraph").css("display", "")

                        } else {
                            TotalAmount = TotalAmount - CouponCodeResponse[0].DiscountAmount;
                            document.getElementById("totalAmount").innerHTML = numberWithCommas(TotalAmount);
                            // document.getElementById("CostAfterCouponApply").innerHTML = numberWithCommas(TotalAmount);
                            $("#OrignalCost").css("text-decoration", "line-through")
                            //$("#CostAfterCouponApply").css("display", "")
                            $("#AmountLoaderDiv").css("display", "none")
                            $("#makePaymentBtn").css("display", "")
                            $("#OrignalCostParagraph").css("display", "")

                        }
                    } else {
                        $("#CouponWarning").css("display", "block")
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
    } else {
        errorToaster("Plese select any package")
    }

}

function RemoveCouponCode() {

    document.getElementById("totalAmount").innerHTML = numberWithCommas(ActualTotalAmount);
    CouponId = '';

    $("#CouponCodeLabel").css("display", "")
    $("#ApplyCouponForm").css("display", "")
    $("#CouponValid").css("display", "none")
    $("#OrignalCost").css("text-decoration", "")
    // document.getElementById("CostAfterCouponApply").textContent = '';
    // $("#CostAfterCouponApply").css("display", "none")
    $("#OrignalCostParagraph").css("display", "")


}


function GetStateList() {
    $.ajaxSetup({
        async: false
    });
    $.post(TaxSoAPI + '/ClientOnboarding/GetStatesList')
        .success(function (res) {
            if (res != null) {
                console.log(res);
                statelist = res;
                for (let i = 0; i < res.length; i++) {
                    $('#selectState').append($('<option>', { value: res[i].StateId, text: res[i].StateName }))
                }
            }

        })
        .error(function (err) {
            console.log("err" + err);
        });
}

function ValidateGstin() {
    let gstin = $('#Gstinno').val();
    let stateCode = gstin.substring(0, 2);
    let statename = statelist.filter((data) => data.StateCode == stateCode);
    if (gstin.length < 15 || gstin.length > 15) {
        var gstinspan = document.getElementById('errorGstin');
        gstinspan.textContent = 'Please Enter Valid Gstin number';
        $('#errorGstin').css('display', 'block');
        $('#selectState').val('');
    } else if (statename == null || statename.length <= 0) {
        var gstinspan = document.getElementById('errorGstin');
        gstinspan.textContent = 'Please Enter Valid Gstin number';
        $('#errorGstin').css('display', 'block');
        $('#selectState').val('');
    } else {
        var stateId = statelist.filter((data) => data.StateCode == stateCode)[0].StateId;
        $('#selectState').val(stateId);
    }
}

function onCloseRazorPay() {
    $("#submitbtn").css("display", "block");
    $("#submitbtn").attr("disabled", false);
    $("#paymentloader").css("display", "none");
}

function CheckUniqueGstin() {
    let errorflag = 0;
    let companyName = $("#CompanyName").val();
    let emailTo = $("#EmailTo").val();
    let gstin = $("#Gstinno").val();
    var obj = {};
    obj.action = 'Validate Gstin';
    obj.GSTinNO = gstin;
    $("#submitbtn").attr("disabled", true);
    $.ajax({
        async: false,
        type: 'POST',
        url: TaxSoAPI + '/ClientOnboarding/CheckUniqueGstin',
        data: JSON.stringify(obj),
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function (res) {
            if (res.length > 0) {
                if (res[0].GSTin == gstin) {
                    // errorToaster("Entered Gstin is already exists in our database!");
                    var gstinspan = document.getElementById('errorGstin');
                    gstinspan.textContent = 'Entered Gstin is already exists in our database!';
                    $('#errorGstin').css('display', 'block');
                    errorflag++;
                    $("#submitbtn").attr("disabled", false);
                }
            }

        }
    });
    return errorflag;
}

function CheckValidEmail() {

    $("#resendOtpButton").prop("disabled", true);
    let companyName = $("#CompanyName").val();
    let emailTo = $("#EmailTo").val();
    $("#emailToSpan").text(emailTo);
    $('#WrongOTP').css('display', 'none');

    let validationerrorflag = validateDetails();
    if (validationerrorflag == 0) {
        let uniqueGstinFlag = CheckUniqueGstin();;
        if (uniqueGstinFlag == 0) {
            $('#errorGstin').css('display', 'block');
            $.post(TaxSoAPI + '/ClientOnboarding/ValidateNewClientEmail', {
                companyName: companyName,
                emailId: emailTo,
            }, { contentType: 'application/json; charset=utf-8' })
                .success(function (res) {
                    if (res != null) {
                        $('#OTPConfirmationModel').modal({ backdrop: 'static', keyboard: false })
                        $('#OTPConfirmationModel').modal('show')
                        $("#OTP").val(res)
                        document.getElementById('resendOtpButton').style.display = 'none';
                        startTimer();

                        timeOfOTPExpiry = setTimeout(function () {
                            $("#OTP").val('');
                        }, 5 * 60 * 1000);
                    }
                })
                .error(function (err) {
                    console.log("err" + err);
                });
        }
    }
}

function ResendEmail() {
    $("#resendOtpButton").prop("disabled", true);
    $("#firstotp").val('');
    $("#secondotp").val('');
    $("#thirdotp").val('');
    $("#fourthotp").val('');
    let companyName = $("#CompanyName").val();
    let emailTo = $("#EmailTo").val();
    $("#emailToSpan").text(emailTo);
    $('#WrongOTP').css('display', 'none');

    $.post(TaxSoAPI + '/ClientOnboarding/ValidateNewClientEmail', {
        companyName: companyName,
        emailId: emailTo,
    }, { contentType: 'application/json; charset=utf-8' })
        .success(function (res) {
            if (res != null) {
                $('#OTPConfirmationModel').modal('show')
                $("#OTP").val(res)
                document.getElementById('resendOtpButton').style.display = 'none';
                startTimer();
                timeOfOTPExpiry = setTimeout(function () {
                    $("#OTP").val('');
                }, 5 * 60 * 1000);
            }
        })
        .error(function (err) {
            console.log("err" + err);
        });
}

function closeOtpModal() {
    $('#OTPConfirmationModel').modal('hide')
    $("#RegisterButton").prop("disabled", false);
    $("#submitbtn").prop("disabled", false);

    // Clear the interval set by TimeOut()
    clearTimeout(timeOfOTPExpiry);
    // Clear the interval set by startTimer()
    clearInterval(timerInterval);
    let timerElement = document.getElementById('timerCountdown');
    timerElement.textContent = '60';
}


function startTimer() {
    document.getElementById('timer').style.display = 'inline-block';
    let timerCount = 60; // 60 seconds
    let timerElement = document.getElementById('timerCountdown');

    timerInterval = setInterval(function () {
        timerCount--;
        timerElement.textContent = timerCount;
        if (timerCount <= 0) {
            clearInterval(timerInterval);
            document.getElementById('resendOtpButton').style.display = '';
            $("#resendOtpButton").prop("disabled", false);
            document.getElementById('timer').style.display = 'none';
        }
    }, 1000); // Update every second
}

function VerifyOTP() {
    $("#validatebutton").prop("disabled", true);
    let FreeTrial = localStorage.getItem('IsFreeTrial');
    let OTP = $("#OTP").val();

    let firstbox = $("#firstotp").val();
    let secondbox = $("#secondotp").val();
    let thirdbox = $("#thirdotp").val();
    let fourthbox = $("#fourthotp").val();

    let EnterOTP = firstbox + secondbox + thirdbox + fourthbox;

    if (OTP === EnterOTP && EnterOTP != "" && OTP != "") {
        $('#emailId').prop('disabled', true).css('color', $('#emailId').css('color'));
        $('#OTPConfirmationModel').modal('hide')
        $('#paymentloader').css('display', 'inline');
        $('#RegisterButton').css('display', 'none');
        $('#submitbtn').css('display', 'none');
        if (FreeTrial != "1") {
            makePayment();
        } else {
            RegisterNewClient();
        }

    } else {
        $('#WrongOTP').css('display', '');
    }
    $("#validatebutton").prop("disabled", false);
}

document.addEventListener("DOMContentLoaded", function (event) {

    function OTPInput() {
        const inputs = document.querySelectorAll('#otpfields > *[id]');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('input', function (event) {
                let inputValue = event.data;
                if (!inputValue) {
                    inputs[i].value = '';
                    if (i !== 0) inputs[i - 1].focus();
                } else {
                    inputs[i].value = inputValue;
                    if (i !== inputs.length - 1) inputs[i + 1].focus();
                }
            });
            // Add event listener for paste event
            inputs[i].addEventListener('paste', function (event) {
                event.preventDefault();
                let pastedText = (event.clipboardData || window.clipboardData).getData('text');
                for (let j = 0; j < pastedText.length && i + j < inputs.length; j++) {
                    inputs[i + j].value = pastedText.charAt(j);
                }
                if (i + pastedText.length - 1 < inputs.length - 1) {
                    inputs[i + pastedText.length - 1].focus();
                }
            });
        }
    }
    OTPInput();
});




function validateDetails() {
    let errorflag = 0;
    var TandCcheckBox = document.getElementById('tandc');
    let companyName = $("#CompanyName").val();
    let emailTo = $("#EmailTo").val();
    let gstin = $("#Gstinno").val();
    if ((companyName).trim() == "" || companyName == null || companyName == undefined) {
        $('#errorCompanyName').css('display', 'block');
        errorflag++;
    }
    if ((gstin).trim() == "" || gstin == null || gstin == undefined) {
        var gstinspan = document.getElementById('errorGstin');
        gstinspan.textContent = 'Please enter your GSTIN.';
        $('#errorGstin').css('display', 'block');
        errorflag++;
    }
    if (!TandCcheckBox.checked) {
        $('#errortandc').css('display', 'block');
        errorflag++;
    }
    if ((emailTo).trim() == "" || emailTo == null || emailTo == undefined) {
        var emailspan = document.getElementById('errorEmailTo');
        emailspan.textContent = 'Please enter email address';
        $('#errorEmailTo').css('display', 'block');
        errorflag++;
    } else if (!validateEmail(emailTo)) {
        var emailspan = document.getElementById('errorEmailTo');
        emailspan.textContent = 'Email id (' + emailTo + ') is not valid ';
        $('#errorEmailTo').css('display', 'block');
        errorflag++;
    }


    return errorflag;
}

function RegisterNewClient() {
    var TandCcheckBox = document.getElementById('tandc');
    let companyName = $("#CompanyName").val();
    let emailTo = $("#EmailTo").val();
    let Gstinno = $("#Gstinno").val();
    email = emailTo;
    let stateId = $("#selectState").val();
    $('#errorCompanyName').css('display', 'none');
    $('#errorEmailTo').css('display', 'none');
    $('#errorGstin').css('display', 'none');
    $('#errortandc').css('display', 'none');
    let subscriptionDays = 15;
    // if (document.getElementById('MonthlySubscriptionID').checked) {
    //     subscriptionDays = 30;
    //     packageTimePeriod = 'Monthly';
    // }
    // else if (document.getElementById('YearlySubscriptionID').checked) {
    //     subscriptionDays = 365;
    //     packageTimePeriod = 'OneYear';
    // }
    if (companyName != '' && emailTo != '' && Gstinno != '' && selectPackage != '') {
        if (validateEmail(emailTo)) {
            thanksmsgheading = document.getElementById("thanksmsg");
            thanksmsgheading.innerHTML = thanksmsgheading.innerHTML + (email);
            $("#paymentloader").css("display", "inline");
            $("#RegisterButton").css("display", "none");
            $.post(TaxSoAPI + '/ClientOnboarding/createTaxSoClient', {
                companyName: companyName,
                emailId: emailTo,
                subscriptionDays: subscriptionDays,
                action: 'client_onboarding',
                isInTrialSubscription: 1,
                transactionFor: 1,
                packageType: 'SILVER',
                GSTinNO: Gstinno,
                StateId: stateId
            }, { contentType: 'application/json; charset=utf-8' })
                .success(function (res) {
                    if (res != null) {
                        $("#loaderDiv").css("display", "none");
                        $("#formdiv").css("display", "none");
                        $("#thanksdiv").css("display", "block");
                        var password = res.password;
                        var username = res.username
                        sendEmailToOnboardngClient(companyName, emailTo, password, username, "registered");
                    }
                })
                .error(function (err) {
                    console.log("err" + err);
                });
        } else {
            var emailspan = document.getElementById('errorEmailTo');
            emailspan.textContent = 'Email id (' + emailTo + ') is not valid ';
            $('#errorEmailTo').css('display', 'block');
        }
    }
}