var spinner;
var windowHeight = $(window).height();
var remindersPage = {
    container:function(){
        return $('#remindersPage');
    },
    init:function(){
        this.initlogo();
        this.setSize();
        this.setList();
        this.setInfoData();
        this.designLogo();
    },
    initlogo: function(){
        if(localStorage.getItem('CoinzLogoImgUrl') == null){
            this.populateLogo();
        } else {
            var logoImg = $('#headerLogoImg');
            logoImg.css('background-image' ,'url('+ localStorage.getItem('CoinzLogoImgUrl') + ')');
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
    setSize: function(){
        var windowHeight = $(window).height();
        $('#remindersTab').css('font-size', (windowHeight * 0.030) + 'px');
        $('#donationsTab').css('font-size', (windowHeight * 0.030) + 'px');
        $('#beitChabadLabel').css('font-size', (windowHeight * 0.026) + 'px');
        //CSS for iPhone4 and small screens
        if (windowHeight < 500) {
            $('#beitChabadLabel').css('font-size', (windowHeight * 0.031) + 'px');
            $('#headerLogoImg').css('top', '2%');
        }
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
    appendList:function(data){
        var self = this;
        var windowHeight = $(window).height();
        var target = document.getElementById('spinner');
        spinner = new Spinner(coinz.initSpiner()).spin(target);

        var item_list = self.container().find('.reminders_list');
        if (typeof(data)=='object' && data.length>0){
            $.each(data, function(index,item) {
                self.addItem(item_list , index , item);
            });
        } else {
            var reminder_item = $("<li>" +
                "There are no reminders"
                + "</li>");
            reminder_item.css("line-height", "2em");
            reminder_item.css("text-align", "left");
            reminder_item.css('font-size', (windowHeight * 0.030) + 'px');
            reminder_item.css('text-indent', '5em');

            item_list.append(reminder_item);
        }
        spinner.stop();
    },
    addItem:function(item_list , index , item){
        var self = this;
        var windowHeight = $(window).height();

        var reminderNote = item.reminder_note;
        if (reminderNote == null){
            reminderNote = "";
        } else {
            reminderNote = reminderNote + " ";
        }

        var reminder_type;
        //Cap latter set for reminder type
        if (item.reminder_type == "yearly"){
            reminder_type = "Yearly";
        } if (item.reminder_type == "weekly"){
            reminder_type = "Weekly";
        } if (item.reminder_type == "daily"){
            reminder_type = "Daily";
        }

        var reminder_item = $("<li><div id='removeCell' class='remove'></div>" + reminder_type +
            " reminder at "  + item.reminder_heb + " " + reminderNote + "</li>");
        item_list.append(reminder_item);
        $('.remove' , reminder_item).click(function(){
            self.removeFromDB(item.reminder_id , function(){
                self.removeFromList(reminder_item);
            });
        });

        reminder_item.css('font-size', (windowHeight * 0.025) + 'px');
        reminder_item.css('min-height',(windowHeight * 0.058) + 'px');
        reminder_item.css("background-image", "url('../images/Profile/close.png')");
        reminder_item.css("background-position", "right center");
        reminder_item.css("background-size", 13+"%");

    },
    removeFromDB:function(reminder_id , callback){
        var data = {reminder_id:reminder_id};
        coinz.ajax('remove_reminder' , data , function(){
            callback();
        });
    },
    removeFromList:function(item){
        console.log(item);
        $(item).slideUp(400 , function(){
            item.remove();
        })
    },
    setList:function(){
        //init params for spinner
        var target = document.getElementById('spinner');
        var spinner = new Spinner(coinz.initSpiner());
        spinner.spin(target);

        var self = this;
        coinz.ajax('get_reminders' , {} , function(list){
            self.appendList(list);
            $("#spinner").hide();
            spinner.stop();
        });
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
    }
};