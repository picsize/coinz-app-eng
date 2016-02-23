var loginForm = {
    container:function(){
        return $('#login');
    },
    init:function(){
        this.setFontSize();
        this.registerEvent();
        this.setSubmitEvent();
        this.setEmailReminder();
    },
    setFontSize: function(){
        var windowHeight = $(window).height();
        $('#headerReg').css('font-size', (windowHeight * 0.035) + 'px');
        $('input').css('font-size', (windowHeight * 0.035) + 'px');
        $('#goToRegister').css('font-size', (windowHeight * 0.035) + 'px');
        $('#password_reminder').css('font-size', (windowHeight * 0.035) + 'px');
    },
    registerEvent:function(){
        $("#goToRegister").click(function(){
            coinz.goTo('register.html');
        });
    },
    setEmailReminder:function(){
        var self = this;
        $("#password_reminder").click(function(){
            var emailFromUser = prompt("Please type your App registered email:");
            var url = "http://coinz-admin.co.il/php/email_password_reminder_byChabadID_Eng.php?email=" + emailFromUser + "&beit_chabad_id=" +
                appData.beit_chabad_id;
            $.ajax({
                type: "POST",
                url: url,
                processData: false,
                contentType: false,
                success: function(html){
                    if(html=="Message has been sent")    {
                        var title =  'Reminder Sent';
                        var msg = 'Password reminder was sent to your email, please check you mailbox.';
                        var btnLabel = 'Confirm';
                        navigator.notification.alert(
                            msg,
                            null,         // callback
                            title,            // title
                            btnLabel                  // buttonName
                        );
                    } else {
                        var title =  'Eror';
                        var msg = 'Email was not sent, please verify you have a registered email. You can always register again.';
                        var btnLabel = 'Confirm';
                        navigator.notification.alert(
                            msg,
                            null,         // callback
                            title,            // title
                            btnLabel                  // buttonName
                        );
                    }
                }
            });
        });
    },
    setSubmitEvent:function(){
        var self = this;
        $(document).on('submit', '#loginForm', function () {            
            event.preventDefault();
            var form = $(this);
            var ajax_data = coinz.dataFromForm(form);
            ajax_data.beit_chabad_id = appData.beit_chabad_id;
            var validForm = self.validate(ajax_data);
            if (validForm) {
                self.submit(ajax_data);
            }
        });

        //$("#loginForm").on("submit", function(event){
         
        //});
    },
    validEmail:function(email){
        atpos = email.indexOf("@");
        dotpos = email.lastIndexOf(".");
        var valid_email = !(atpos < 1 || ( dotpos - atpos < 2 ));
        return valid_email;
    },
    validate:function(formData){
        var valid_email = this.validEmail(formData.email);
        if (!valid_email){
            //alert('אנא הכנס כתובת אימייל תקינה');
            var title =  'Login Error';
            var msg = 'Please insert a valid email address.';
            var btnLabel = 'Confirm';
            navigator.notification.alert(
                msg,
                null,         // callback
                title,            // title
                btnLabel                  // buttonName
            );
        }
        return valid_email;
    },
    submit:function(loginData){
    	var self = this;
    	coinz.ajax('login_multi_users', loginData , function(userData){
    		 var error_exists = typeof(userData.error)=='string';
    		 if (!error_exists){
    			 coinz.setUser(userData);
                 coinz.goTo('main.html');
    		 } else {
    			 //alert('כניסה נכשלה') ;
                 var title =  'Login Failure';
                 var msg = 'Please check your credentials and log in again.';
                 var btnLabel = 'Confirm';
                 navigator.notification.alert(
                     msg,
                     null,         // callback
                     title,            // title
                     btnLabel                  // buttonName
                 );
    		 }
    	})
    }
}