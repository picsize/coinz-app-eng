var balanceSumValue = 0;
var kupaSum = 0;
var clicked = false;
var coinSound;
var donateBtnClicked = false;
var owner_papypal_email;
var owner_pelepay_email;
var donationData;

var poundsDonatePage = {
    container: function () {
        return $('#donatePage');
    },
    init: function () {
        var self = this;
        self.initlogo();
        self.setSize();
        self.populateLocation();
        self.initDragDrop();
        self.initOther();
        self.updateKupaCounter();
        self.setInfoData();
        self.setUserInfo();
        self.paymentBtnClicked();
        //self.setRatesInfo();
        self.donationDetailsEvents();
        self.back();
        self.saveNote();

        $("#balanceSum").text("£0");

        $("#approveBtnPounds").click(function(){
            //Check first if user is registered
            var user_exists = typeof(localStorage.getItem("CoinzUser")) == "string";
            if (!user_exists){
                //User not registered
                var title =  'Not Registered';
                var msg = 'Please register or login first in order to continue.';
                var btnLabel = 'Confirm';
                navigator.notification.alert(
                    msg,
                    null,         // callback
                    title,            // title
                    btnLabel                  // buttonName
                );
                coinz.goTo("register.html");
            } else {
                if (!donateBtnClicked){
                    donateBtnClicked = true;

                    if(balanceSumValue == 0){
                        var title =  'Donation Error';
                        var msg = 'The current peldge sum is zero. Please drag money to the box and press accept.';
                        var btnLabel = 'Confirm';
                        navigator.notification.alert(
                            msg,
                            null,         // callback
                            title,            // title
                            btnLabel                  // buttonName
                        );
                        donateBtnClicked = false;
                    } else {
                        self.donate(balanceSumValue);

                        balanceSumValue = 0;
                        $("#balanceSum").text("£" + balanceSumValue);
                    }
                }
            }

        });
        //For media play enable
        document.addEventListener("deviceready", self.onDeviceReady, false);
    },
    donationDetailsEvents:function(){
        $('#donationNote').click(function(){
            $('#content').hide();
            $('#donation_details').show();
        });

    },
    back:function(){
        $("#goBack").click(function(){
            $('#donation_details').hide();
            $('#content').show();
        });
    },
    saveNote:function(){
        $("#saveNote").click(function(){
            localStorage.setItem("doantionNoteText",$("#noteHolder").val());
            var title = 'Dedication updated';
            var msg = 'Dedication is now updated, click on back to return to donatation screen.';
            var btnLabel = 'OK';
            navigator.notification.alert(
                msg,          //massage
                null,         // callback
                title,        // title
                btnLabel      // buttonName
            );
        });
    },
    updateKupaCounter: function () {
        var self = this;
        var user_id = coinz.getUser();
        coinz.ajax('get_donations_byUser', user_id, function (response) {
            //update paypal hidden form
            if(response[0].total_donations_unpaid == null){
                $('#kupaTotal').append("£0");
                localStorage.setItem("total_donations_unpaid",0);
            } else {
                $('#kupaTotal').append("£" + response[0].total_donations_unpaid);
                localStorage.setItem("total_donations_unpaid",response[0].total_donations_unpaid);
            }
        });
    },
    paymentBtnClicked: function () {
        //alert(appData.user_iCreditToken);
        //alert(appData.owner_pelepay_email);
        //alert(appData.owner_papypal_email);
        var self = this;
        var data = {};
        data.user_id = coinz.getUser().user_id;

        $("#sendKupaToPayment").click(function () {

            if (localStorage.getItem("total_donations_unpaid") < 8) {
                var title = 'Low pledge';
                var msg = 'The total amount of your pledge is under £8, we can not proceed to payment.';
                var btnLabel = 'OK';
                navigator.notification.alert(
                    msg,          //massage
                    null,         // callback
                    title,        // title
                    btnLabel      // buttonName
                );
            } else if (appData.beit_chabad_icredit_instant_token != null) {

                coinz.ajax('icredit_pay_my_donations', data, function (response) {
                    //alert(JSON.stringify(response));
                    if (response.URL != null) {
                        data.payment_status = "please_pay_with_icredit";
                        coinz.ajax('update_payment_status', data, function (response) {
                        });
                        setTimeout(function(){
                            self.goToIcredit(response.URL);
                        }, 500);

                    } else if (response.paid) {
                        var title1 = 'Payment done';
                        var msg1 = 'You completed payment with your subscription, invoice will be sent by email.';
                        var btnLabel1 = 'Confirm';
                        navigator.notification.alert(
                            msg1,          //massage
                            null,         // callback
                            title1,        // title
                            btnLabel1      // buttonName
                        );
                        coinz.goTo("main.html");
                    } else {
                        var title2 = 'Payment Error';
                        var msg2 = 'Please contact us to complete the payment.';
                        var btnLabel2 = 'Confirm';
                        navigator.notification.alert(
                            msg2,          //massage
                            null,         // callback
                            title2,        // title
                            btnLabel2      // buttonName
                        );
                        coinz.goTo("main.html");
                    }
                });
            } else if (appData.owner_pelepay_email != "") {
                self.pelepayTransaction();
                //alert("pelepayTransaction");
                coinz.goTo("main.html");
            } else if (appData.owner_papypal_email != "") {
                self.paypalTransaction();
                coinz.goTo("main.html");
            }
        });
    },
    goToIcredit:function(URL){
        coinz.goTo(URL);
    },
    onDeviceReady: function () {
        //for android
        var src = "/android_asset/www/sounds/newCoinDrop.wav";
        //for iPhone
        //var src = "sounds/newCoinDrop.wav";
        coinSound = new Media(src);
        //alert("coinSound");
    },
    initlogo: function () {
        if (localStorage.getItem('CoinzLogoImgUrl') == null) {
            this.populateLogo();
        } else {
            var logoImg = $('#headerLogoImg');
            logoImg.css('background-image', 'url(' + localStorage.getItem('CoinzLogoImgUrl') + ')');
        }
    },
    getPhoneGapPath: function () {
        var path = window.location.pathname;
        var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
        return phoneGapPath;
    },
    populateLogo: function () {
        if (localStorage.getItem('CoinzLogoImg') == null) {
            if (coinz.getUser() != "undefined") {
                var Coinz_beitchabad = coinz.getUser().beit_chabad_site;
                var serviceURL = "http://bit2bemobilecoinzdb.co.nf/server/index.php?action=get_beit_chabad_site_details&beit_chabad_site="
                    + coinz.getUser().beit_chabad_site;
                $.ajax({
                    type: 'GET',
                    async: false,
                    url: serviceURL,
                    dataType: 'json',
                    success: function (data) {
                        if (typeof (data[0]) != "undefined") {
                            var logo_url = data[0].logo_url;
                            $('#headerLogoImg').css('background-image', 'url(' + logo_url + ')');
                            //Save image to localStorage
                            localStorage.setItem("CoinzLogoImgUrl", logo_url);
                        }
                    }
                });
            }
        } else {
            $('#headerLogoImg').css('background-image', localStorage.getItem("CoinzLogoImg"));
        }
    },
    designLogo: function (fullname) {
        var windowHeight = $(window).height();
        var lineOne = appData.titleOne;
        var lineTwo = appData.titleTwo;

        this.container().find('.locationTop').html(lineOne);
        this.container().find('.locationBottom').html(lineTwo);

        $('#beitChabadLabelTop').css('font-size', (windowHeight * 0.030) + 'px');
        $('#beitChabadLabelBottom').css('font-size', (windowHeight * 0.025) + 'px');
        if (windowHeight < 500) {
            $('#beitChabadLabelTop').css('font-size', (windowHeight * 0.035) + 'px');
            $('#beitChabadLabelBottom').css('font-size', (windowHeight * 0.030) + 'px');
            $('#beitChabadLabelTop').css('top', '13%');
            $('#beitChabadLabelBottom').css('top', '44%');
        }
    },
    setSize: function(){
        var windowHeight = $(window).height();
        $('#donationNote, #moneyType').css('font-size', (windowHeight * 0.025) + 'px');
        $('#pickCoinText').css('font-size', (windowHeight * 0.025) + 'px');
        $('#balanceSum').css('font-size', (windowHeight * 0.032) + 'px');
        $('#kupaTotal').css('font-size', (windowHeight * 0.025) + 'px');
        $('#beitChabadLabel').css('font-size', (windowHeight * 0.03) + 'px');
        $('#noteHolder').css('height', '260px');
        $('#donationTextTitle').css('font-size',(windowHeight * 0.036) + 'px');
        $('#noteHolder').css('font-size', (windowHeight * 0.032) + 'px');
        if ($('#coin_0_5.poundBills').length > 0) {
            $('#coin_0_5.poundBills').css('top', '48%');
        }
        if ($('#coin_10.poundBills').length > 0) {
            $('#coin_10.poundBills').css('top', '48%');
        }
        //CSS for iPhone4 and small screens
        if (windowHeight < 500) {
            $('#donationNote, #moneyType').css('font-size', '87%');
            $('#confirmDonate').css('top','86%');
            $('#confirmDonate').css('right','26%');
            $('#contentImg').css('top','18%');
            $('#beitChabadLabel').css('font-size', (windowHeight * 0.035) + 'px');
            $('#headerLogoImg').css('top', '1.2%');
            $('#headerLogoImg').css('width', '15%');
            $('#headerLogoImg').css('height', '7.5%');
            $('#headerLogoImg').css('right', '-2%');
            $('#cashierWrap').css('height', '26%');
            $('#cashierWrap').css('top', '59%');
            $('#noteHolder').css('height', '160px');
        }
    },
    populateLocation: function () {
        var self = this;

        if (localStorage.getItem('CoinzLocationTitle') == null) {
            if (coinz.getUser() != "undefined") {
                var location = coinz.getUser().beit_chabad_site;
                self.designLogo(location);
                localStorage.setItem('CoinzLocationTitle', location);
            } else {
                //Do nothing
            }
        } else {
            var locationFromLocalStorage = localStorage.getItem('CoinzLocationTitle');
            self.designLogo(locationFromLocalStorage);
        }
    },
    initDragDrop: function () {
        //var coinSound = new Media(srcSound);
        var self = this;
        $('.coinToDrop').each(function () {
            var value = $(this).attr('value');
            $(this).draggable({ revert: true });
        });
        $('.donationArea').droppable({
            drop: function (event, ui) {
                var coin = ui.draggable;
                var value = coin.attr('value');
                coin.hide();

                coinSound.play();

                $("#charityImg").jrumble({
                    x: 0,
                    y: 0,
                    rotation: 6,
                    speed: 90
                });
                $("#charityImg").trigger('startRumble');

                setTimeout(function () {
                    balanceSumValue += Number(value);
                    balanceSumValue = (Math.round(balanceSumValue * 100) / 100);
                    $("#balanceSum").text("£" + balanceSumValue);
                    localStorage.setItem("total_donations_unpaid", balanceSumValue);
                    $("#charityImg").trigger('stopRumble');
                    coin.show();
                }, 500);
            }
        });
    },
    initOther:function(){
        selfOther = this;
        $("#coin_other").click(function(){
            //var coinSound = new Media(srcSound);
            //var self = this;

            //var valueFromUser = prompt("הכנס סכום אחר לתרומה");
            navigator.notification.prompt(
                'Please type the exact amount you would like to donate',  // message
                selfOther.onOtherAmountPrompt,                    // callback to invoke
                'Other amount',                  // title
                ['Confirm','Cancel']             // buttonLabels
            );
        });
    },
    onOtherAmountPrompt: function(results, button){
        var valueFromUser = results.input1;

        if(valueFromUser != null || valueFromUser != 0){
            //Check if user typed undefined number
            if (isNaN(valueFromUser) || valueFromUser < 0){
                donateBtnClicked = false;
                var title1 =  'Error';
                var msg1 = 'Please enter only numbers and positive values';
                var btnLabel1 = 'Confirm';
                navigator.notification.alert(
                    msg1,
                    null,         // callback
                    title1,            // title
                    btnLabel1                  // buttonName
                );
            } else {

                //Take the number from user
                donateBtnClicked = false;
                var value = valueFromUser;
                balanceSumValue += Number(value);
                balanceSumValue = (Math.round(balanceSumValue * 100) / 100);
                localStorage.setItem("total_donations_unpaid",balanceSumValue);
                $("#balanceSum").text("£" + balanceSumValue);
                if (valueFromUser != 0){
                    coinSound.play();
                }
            }
        }
    },
    getHebDateInEng:function(callback){
        var hebDateEng = localStorage.getItem("hebrewDateEng");
        console.log("hebDateEng = " + hebDateEng );
        callback(hebDateEng);
    },
    donate:function(donationSum){
        var self = this;

        self.getHebDateInEng(function(heb_date){
            var donationNote = localStorage.getItem("doantionNoteText");
            donationData = {donation_sum:donationSum,donation_note:donationNote,heb_date:heb_date,eng_date:"none",currency:"£"};

            var title =  'Donation Confirm';
            var msg = "Please confirm donation of" + " " + "£" + donationSum;
            var buttonsArray =['Cancel','Confirm'];

            navigator.notification.confirm(
                msg,                                           // message
                function(buttonIndex){
                    self.startDbAction(buttonIndex);
                },              // callback to invoke with index of button pressed
                title,                                         // title
                buttonsArray                                   // buttonLabels
            );
        });
    },
    startDbAction: function(button){
        var self = this;
        if (button != 1){
            self.addToDB(donationData , function(){
                donateBtnClicked = false;
                coinz.goTo(localStorage.getItem('lastDonation'));
            });
        }
    },
    addToDB:function(donationData , callBack){
        var self = this;
        coinz.ajax('add_donation_withCurrency' , donationData , function(response){
            self.updateKupaCounter();
            callBack();
        });
    },
    setInfoData: function () {
        var self = this;

        var serviceURL = "http://bit2bemobilecoinzdb.co.nf/server/index.php?action=get_beit_chabad_site_details_by_id&beit_chabad_id="
            + appData.beit_chabad_id;
        $.ajax({
            type: 'GET',
            async: false,
            url: serviceURL,
            dataType: 'json',
            success: function (data) {
                var beitchabad_name = data[0].beit_chabad_site;
                var beitchabad_address = data[0].beitchabad_address;
                var beitchabad_phone = data[0].beitchabad_phone;
                var beitchabad_owner_name = data[0].beitchabad_owner_name;
                appData.owner_papypal_email = data[0].business_email;
                appData.owner_pelepay_email = data[0].pelepay_email;

                $("#info").click(function () {
                    navigator.notification.alert(
                        "Institute Name" + ":" + " " + beitchabad_name + "\n" +
                            "Address" + ":" + " " +     beitchabad_address + "\n" +
                            "Phone" + ":" + " " +     beitchabad_phone + "\n" +
                            "Institute manager" + ":" + " " +    beitchabad_owner_name,
                        null,         // callback
                        'Institue Details',            // title
                        'Confirm'                  // buttonName
                    );
                });
            }
        });
    },
    setUserInfo: function () {
        var self = this;

        var serviceURL = "http://bit2bemobilecoinzdb.co.nf/server/index.php?action=get_beit_chabad_site_details_by_id&beit_chabad_id="
            + appData.beit_chabad_id;
        $.ajax({
            type: 'GET',
            async: false,
            url: serviceURL,
            dataType: 'json',
            success: function (data) {
                appData.beit_chabad_icredit_instant_token = data[0].icredit_instant_token;
            }
        });
    },
    setRatesInfo: function(){
        var self = this;
        var serviceURL = "http://bit2bemobilecoinzdb.co.nf/server/index.php?action=get_money_rates";
        $.ajax({
            type: 'GET',
            async: false,
            url: serviceURL,
            dataType : 'json',
            success : function(data) {
                appData.rate_USD_to_NIS = data[0].value_to_shekel;
                appData.rate_EUR_to_NIS = data[1].value_to_shekel;
                appData.rate_GBP_to_NIS = data[2].value_to_shekel;
            }
        });
    },
    paypalTransaction: function () {
        //document.forms["paypalForm"].submit();
        var sum = localStorage.getItem("total_donations_unpaid");
        var first_name = coinz.getUser().firstname;
        var last_name = coinz.getUser().lastname;
        var email = coinz.getUser().email;
        var return_link = "http://bit2bemobilecoinzdb.co.nf/server/actions/update_payment_status_paypalOnly_Eng.php?user_id=" + coinz.getUser().user_id;

        navigator.app.loadUrl('https://www.paypal.com/cgi-bin/webscr?cmd=_donations&lc=US&charset=UTF-8' +
            '&currency_code=GBP&no_note=0' +
            '&cn=' +
            'תרומה דרך אפליקציית CoinZ' +
            '&no_shipping=2&bn=PP-DonationsBF:btn_donateCC_LG.gif:NonHosted&rm=2' +
            '&business=' + appData.owner_papypal_email +
            '&amount=' + sum +
            '&first_name=' + first_name +
            '&last_name=' + last_name +
            '&email=' + email +
            '&return=' + return_link, { openExternal: true });
    },
    pelepayTransaction: function () {
        //document.forms["pelepayform"].submit();
        //var ref = window.open('https://www.pelepay.co.il/pay/paypage.aspx?business=chabadkatamon@012.net.il&amount=1&description=_donation', '_system');
        var sum_pelepay = localStorage.getItem("total_donations_unpaid");
        var first_name_pelepay = coinz.getUser().firstname;
        var last_name_pelepay = coinz.getUser().lastname;
        var email_pelepay = coinz.getUser().email;
        //var return_link_pelepay = 'http://bit2bemobilecoinzdb.co.nf/server/index.php?' +
        //    'action=update_payment_status_paypalOnly&payment_coinz=Payment_completed_with_PelePay&user_id='+coinz.getUser().user_id;
        var return_link_pelepay = 'http://bit2bemobilecoinzdb.co.nf/server/actions/update_payment_status_pelepayOnly_Eng.php';


        navigator.app.loadUrl('https://www.pelepay.co.il/pay/paypage.aspx?' +
            'business=' + appData.owner_pelepay_email +
            '&amount=' + sum_pelepay +
            '&Firstname=' + first_name_pelepay +
            '&lastname=' + last_name_pelepay +
            '&email=' + email_pelepay +
            '&description=_donation' +
            '&custom=' + coinz.getUser().user_id +
            '&success_return=' + return_link_pelepay, { openExternal: true });
    }
}