var addReminderPage = {
    container:function(){
        return $('#addReminderPage');
    },
    init:function(){
        var container = this.container();
        this.initlogo();
        this.setSize();
        this.typeEvent();
        this.submitEvent();
        this.populateSelection();
        this.goToReminders();
        this.setInfoData();
        this.designLogo();
        this.checkLogin();
    },
    initlogo: function(){
        if(localStorage.getItem('CoinzLogoImgUrl') == null){
            this.populateLogo();
        } else {
            var logoImg = $('#headerLogoImg');
            logoImg.css('background-image' ,'url('+ localStorage.getItem('CoinzLogoImgUrl') + ')');
        }
    },
    checkLogin: function(){
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
        }
    },
    populateLogo:function(){
        if (localStorage.getItem('CoinzLogoImg') == null){
            var Coinz_beitchabad = coinz.getUser().beit_chabad_site;
            var serviceURL = "http://bit2bemobilecoinzdb.co.nf/server/index.php?action=get_beit_chabad_site_details_by_id&beit_chabad_id="
                +appData.beit_chabad_id;
            $.ajax({
                type: 'GET',
                async: false,
                url: serviceURL,
                dataType : 'json',
                success : function(data) {
                    if(typeof(data[0]) != "undefined"){
                        var logo_url = data[0].logo_url;
                        $('#headerLogoImg').css('background-image' , 'url('+ logo_url + ')');
                        //Save image to localStorage
                        localStorage.setItem("CoinzLogoImgUrl", logo_url);
                    }
                }
            });
        } else {
            $('#headerLogoImg').css('background-image' , localStorage.getItem("CoinzLogoImg"));
        }
    },
    designLogo: function(fullname){
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
     goToReminders: function(){
            $('#goBackAddReminder').click(function(){
                 coinz.goTo("reminders.html");
            });
    },
    populateLocation:function(){
        var self = this;

        if (localStorage.getItem('CoinzLocationTitle') == null){
            if(coinz.getUser() != "undefined" ){
                var location = coinz.getUser().beit_chabad_site;
                self.designLogo(location);
                localStorage.setItem('CoinzLocationTitle',location);
            } else {
                //Do nothing
            }
        } else {
            var locationFromLocalStorage = localStorage.getItem('CoinzLocationTitle');
            self.designLogo(locationFromLocalStorage);
        }
    },
    populateSelection:function(){
        this.populateYearly();
        this.populateDaily();
    },
    populateYearly:function(){
        var oneTimeSelect = $('#yearly');
        heb_date_select.apply(oneTimeSelect);
    },
    populateDaily:function(){
        this.populateHour();
        this.populateMinute();
    },
    populateHour:function(){
        var hourSelect = $('.hourSelect' , this.container());
        for (var i = 0; i <= 23; i++) {
            var str_val = i.toString();
            if (str_val.length==1){
                str_val = '0' + str_val;
            }
            var option = "<option value='" + i + "'>" + str_val + "</option>";
            hourSelect.append(option);
        }
        hourSelect.val(12);
    },
    populateMinute:function(){
        var minuteSelect = $('.minuteSelect' , this.container());
        for (var i = 0; i <= 59; i = i + 10) {
            var str_val = i.toString();
            if (str_val.length==1){
                str_val = '0' + str_val;
            }
            var option = "<option value='" + i + "'>" + str_val + "</option>";
            minuteSelect.append(option);
        }
    },
    addToDB:function(form_data , callBack){
        var form = this.container().find('form');

        //Add user current time to the form data
        var d = new Date();
        form_data.userMin = d.getMinutes();
        if (form_data.userMin < 10){
            form_data.userMin = "0" + form_data.userMin;
        }
        form_data.userHour = d.getHours();
        if (form_data.userHour < 10){
            form_data.userHour = "0" + form_data.userHour;
        }
        form_data.userDay = d.getDate();
        form_data.userMonth = d.getMonth() + 1;
        form_data.userYear = d.getFullYear();
        form_data.userTimeNow = form_data.userYear + "-" + form_data.userMonth + "-" + form_data.userDay
            + " " + form_data.userHour + ":" + form_data.userMin + ":00";

        coinz.ajax('add_reminder' , form_data , function(response){
            //alert(response);
            callBack();
        });
    },
    typeEventOld:function(){
        var container = this.container();
        var labels = $('#typeSelect label');
        labels.click(function(){
            labels.removeClass('checked');
            $(this).addClass('checked');
        });
        var type_select = $('input[name="type"]' , container);
        type_select.change(function(){
            var selected_type = $(this).val();
            form_options.removeClass('yearly_options').removeClass('weekly_options').removeClass('daily_options');
            form_options.addClass(selected_type + '_options');
        });
        var form_options = $('#formOptions' , container);
    },
    typeEvent:function(){
        var container = this.container();
        var yearlylabel = $('#yearlyLabel');
        var yearlySelect = $('#yearly');
        var weelylabel = $('#weeklyLabel');
        var weelySelect = $('#weekly');
        var dailyLabel = $('#dailyLabel');
        var dailySelect = $('#daily');
        yearlylabel.click(function(){
            weelylabel.removeClass('checked');
            dailyLabel.removeClass('checked');
            yearlylabel.addClass('checked');
        });
        yearlySelect.click(function(){
            yearlylabel.click();
        });
        weelylabel.click(function(){
            yearlylabel.removeClass('checked');
            dailyLabel.removeClass('checked');
            weelylabel.addClass('checked');
        });
        weelySelect.click(function(){
            weelylabel.click();
        });
        dailyLabel.click(function(){
            yearlylabel.removeClass('checked');
            weelylabel.removeClass('checked');
            dailyLabel.addClass('checked');
        });
        dailySelect.click(function(){
            dailyLabel.click();
        });
    },
    getReminderHeb:function(type){
        var visible_select = $('#formOptions select:visible' , this.container());
        var date_strings = {};
        visible_select.each(function(){
            var select = $(this);

            var option = $("option[value=" + select.val() + "]" , select);
            var title = option.html();
            date_strings[select.attr('name')] = title;
            console.log(" date_strings[select.attr('name')] = " +  date_strings[select.attr('name')]);
        });

        switch (type){
            case 'yearly':
                date_string = date_strings.yhour+":"+date_strings.yminutes;
                date_string =
                    date_strings.jmonth_day + " " +
                        date_strings.jmonth + " " +
                        date_string;
                break;
            case 'weekly':
                date_string = date_strings.whour+":"+date_strings.wminutes;
                date_string =
                    date_strings.week_day.trim() + " " + date_string;
                break;
            case 'daily':
                date_string = date_strings.dhour+":"+date_strings.dminutes;
        }
        return date_string;
    },
    submitEvent:function(){
        var self = this;
        var form = this.container().find('#formAddReminder');
        form.submit(function(e){
            e.preventDefault();

            var target = document.getElementById('spinner');
            var spinner = new Spinner(coinz.initSpiner());
            spinner.spin(target);

            var form_data = coinz.dataFromForm(form);
            form_data.reminder_heb =  self.getReminderHeb(form_data.type);
            form_data.reminder_eng =  localStorage.getItem("hebrewDateEng");

            if ($("#reminder_note").val() == ""){
                form_data.reminder_note = "Donation reminder";
            } else {
                form_data.reminder_note = $("#reminder_note").val();
            }

            self.addToDB(form_data , function(){
                spinner.stop();
                coinz.goTo("reminders.html");
            });
            return false;
        })
    },
    setInfoData: function(){
        var beitchabad_name = appData.beitchabad_name;
        var beitchabad_address = appData.beitchabad_address;
        var beitchabad_phone = appData.beitchabad_phone;
        var beitchabad_owner_name = appData.beitchabad_owner_name;

        $("#info").click(function(){
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
    },
    setSize: function(){
        var windowHeight = $(window).height();
        $('#remindersTab').css('font-size', (windowHeight * 0.030) + 'px');
        $('#donationsTab').css('font-size', (windowHeight * 0.030) + 'px');
        $('#yearlyShortText').css('font-size', (windowHeight * 0.025) + 'px');
        $('#weeklyShortText').css('font-size', (windowHeight * 0.025) + 'px');
        $('#titlePressOK').css('font-size', (windowHeight * 0.03) + 'px');
        $('#yearTextForYearly').css('font-size', (windowHeight * 0.03) + 'px');
        $('#hourTextForYearly').css('font-size', (windowHeight * 0.03) + 'px');
        $('#hourDayTextForWeekly').css('font-size', (windowHeight * 0.03) + 'px');
        $('#hourTextForWeekly').css('font-size', (windowHeight * 0.03) + 'px');
        $('#dailyText').css('font-size', (windowHeight * 0.03) + 'px');
        $('select').css('font-size', (windowHeight * 0.024) + 'px');
        $('#selectYearlyMonth').css('font-size', (windowHeight * 0.018) + 'px');
        $('#selectWeeklyDay').css('font-size', (windowHeight * 0.018) + 'px');
        $('#reminder_note').css('font-size', (windowHeight * 0.03) + 'px');
        $('#beitChabadLabel').css('font-size', (windowHeight * 0.03) + 'px');
        //CSS for iPhone4 and small screens
        if (windowHeight < 500) {
            $('#titlePressOK').css('top','18.5%');
            $('#dailyText').css('left','82%');
            $('#formAddReminder').css('top','-4.8%');
            $('#hourDayTextForWeekly').css('top', '57%');
            $('#hourDayTextForWeekly').css('left', '27%');
            $('#hourTextForWeekly').css('top', '67%');
            $('#backgroundImg').css('left', '1.2%');
            $('#backgroundImg').css('width', '99.9%');
            $('#donationsTab').css('right','48.5%');
            $('#remindersTab').css('right','3.8%');
            $('#yearTextForYearly').css('left','26%');
            $('#yearlyShortText').css('left','-7%');
            $('#dailyLabel').css('top','74%');
            $('#beitChabadLabel').css('font-size', (windowHeight * 0.035) + 'px');
        }
    }
};
