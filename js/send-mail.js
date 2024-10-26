function processForm(flag)
{

    var error=false;
    error=validate();
    if(error==true)
    {
        return false;
    }
    else
    {
        sendEmail(flag);
    }
}

function sendEmail(flag)
{
    var info={};
    var name = $('#EmailName').val(); 
    var phone = $('#EmailPhone').val();
    var message = $('#EmailBody').val();
    var email = $('#EmailTo').val();
    var s1 = "Name = ";
    var s2 = " Email = ";
    var s3 = " Phone = "; 
    var s4 = " Message = "; 
    // var s5 = " Came to know from = ";
    // var e = document.getElementById("knowAboutDropdown");
    // var knowAbout = e.options[e.selectedIndex].text;

    var body = s1.concat(name);
    body = body.concat(s2);
    body = body.concat(email);
    body = body.concat(s3);
    body = body.concat(phone);
    body = body.concat(s4);    
    body = body.concat(message);
    // body = body.concat(s5);

    // body = body.concat(knowAbout);
    
    info.EmailTo="taxsogst@gmail.com";
    info.EmailSubject="Enquiry from Website";
    info.EmailBody=body.trim();
    info.emailAttachment = "";
    info.emailFrom = "taxsogst@gmail.com";
    info.emailSMTPAddress = "smtp.gmail.com";
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
            sendEmailToUser(flag);
        },
        error: function () {
            document.getElementById("status").innerHTML="Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color="red";
            document.getElementById("status").style.display="inline";
            setTimeout(function(){window.location.href='index.html'},3000);
        },
        failure: function () {
            document.getElementById("status").innerHTML="Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color="red";
            document.getElementById("status").style.display="inline";
            setTimeout(function(){window.location.href='index.html'},3000);
        }
    });
}

function sendEmailToUser(flag)
{
   if(flag == "contactDetails")
{
    var info={};
    var name = $('#EmailName').val(); 
    var body = "Hi ";
    var s1 = ". Thank you for your interest in Arohar Technologies. We have received your message and our team will get in touch with you soon.";
    body = body.concat(name);
    body = body.concat(s1);
    // var e = document.getElementById("knowAboutDropdown");
    // var knowAbout = e.options[e.selectedIndex].text;
    info.EmailTo=$('#EmailTo').val();
    info.EmailSubject="Arohar Technologies has received your email";
    info.EmailBody=body.trim();
    info.emailAttachment = "";
    info.emailFrom = "taxsogst@gmail.com";
    info.emailSMTPAddress = "smtp.gmail.com";
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
            document.getElementById("statusdiv").style.display="block";
            document.getElementById("status").innerHTML="Thank you for contacting us. we will get back to you shortly!!";
            document.getElementById("status").style.color="green";
            document.getElementById("status").style.display="inline";
          setTimeout(function(){location.reload()},5000);
        },
        error: function () {
            document.getElementById("statusdiv").style.display="block";
            document.getElementById("status").innerHTML="Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color="red";
            document.getElementById("status").style.display="inline";
            setTimeout(function(){window.location.href='index.html'},3000);
        },
        failure: function () {
            document.getElementById("statusdiv").style.display="block";
            document.getElementById("status").innerHTML="Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color="red";
            document.getElementById("status").style.display="inline";
            setTimeout(function(){window.location.href='index.html'},3000);
        }
    });
}
else if(flag == "signuppageflag")
{
    var info={};
    var name = $('#EmailName').val(); 
    var body = "Hi ";
    var s1 = ". Thank you for signing up for free demo of TaxSo ERP. Our team will get in touch with you soon.";
    body = body.concat(name);
    body = body.concat(s1);
    // var e = document.getElementById("knowAboutDropdown");
    // var knowAbout = e.options[e.selectedIndex].text;
    info.EmailTo=$('#EmailTo').val();
    info.EmailSubject="Arohar Technologies has received your email";
    info.EmailBody=body.trim();
    info.emailAttachment = "";
    info.emailFrom = "taxsogst@gmail.com";
    info.emailSMTPAddress = "smtp.gmail.com";
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
            document.getElementById("statusdiv").style.display="block";
            document.getElementById("status").innerHTML="Thank you for contacting us. we will get back to you shortly!!";
            document.getElementById("status").style.color="green";
            document.getElementById("status").style.display="inline";
          setTimeout(function(){location.reload()},5000);
        },
        error: function () {
            document.getElementById("statusdiv").style.display="block";
            document.getElementById("status").innerHTML="Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color="red";
            document.getElementById("status").style.display="inline";
            setTimeout(function(){window.location.href='index.html'},3000);
        },
        failure: function () {
            document.getElementById("statusdiv").style.display="block";
            document.getElementById("status").innerHTML="Sorry, unable to send your message right now !!";
            document.getElementById("status").style.color="red";
            document.getElementById("status").style.display="inline";
            setTimeout(function(){window.location.href='index.html'},3000);
        }
    });
}
}

function validate() 
{
    var hasError = false;
    var EmailNameError = false;
    var EmailToError = false;
    var EmailPhoneError = false;
    var EmailBodyError = false;
    
    var EmailName = document.getElementById("EmailName").value;
    var EmailTo = document.getElementById("EmailTo").value;
    var EmailPhone = document.getElementById("EmailPhone").value;
    var EmailBody = document.getElementById("EmailBody").value;

    var namePattern = /^[a-zA-Z ]+$/;
    var phonePattern = /^[1234567890][0-9]{9}$/;
    var emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (EmailName == "" || namePattern.test(EmailName) == false) {
        EmailNameError = true;
        document.getElementById("EmailName").style.border = "1px solid red";
        document.getElementById("errorEmailName").style.display = "inline";
    }
    else {
        document.getElementById("EmailName").style.border = "1px solid green";
        document.getElementById("errorEmailName").style.display = "none";
    }
    
    if (EmailTo == "" || emailPattern.test(EmailTo) == false) {
        EmailToError = true;
        document.getElementById("EmailTo").style.border = "1px solid red";
        document.getElementById("errorEmailTo").style.display = "inline";
    }
    else {
        document.getElementById("EmailTo").style.border = "1px solid green";
        document.getElementById("errorEmailTo").style.display = "none";
    }
    
     if ( EmailPhone =! "" ) {
      
        document.getElementById("EmailPhone").style.border = "1px solid green";
        document.getElementById("errorEmailPhone").style.display = "none";
    }
    // if ( EmailPhone == "" || phonePattern.test(EmailPhone) == false) {
      
    //     document.getElementById("EmailPhone").style.border = "1px solid red";
    //     document.getElementById("errorEmailPhone").style.display = "inline";
    // }
    // else {
    //     document.getElementById("EmailPhone").style.border = "1px solid green";
    //     document.getElementById("errorEmailPhone").style.display = "none";
    // }
    
    if (EmailBody.length < 1) {
        EmailBodyError = true;
        document.getElementById("EmailBody").style.border = "1px solid red";
        document.getElementById("errorEmailBody").style.display = "inline";
    }
    else {
        document.getElementById("EmailBody").style.border = "1px solid green";
        document.getElementById("errorEmailBody").style.display = "none";
    }
    
    if (EmailNameError == true || EmailToError == true || EmailPhoneError == true || EmailBodyError == true) {
        hasError = true;
    }   
    return hasError;
}