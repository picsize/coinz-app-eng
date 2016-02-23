var donationsPage = {
    container:function(){
        return $('#donationsPage');
    },
    init:function(){
        this.initlogo();
        this.setList();
        this.donationDetailsEvents();
        this.back();
        this.setSize();
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
    back:function(){
        $("#goBack").click(function(){
            location.reload();
        });
    },
    donationDetailsEvents:function(){
        var container = this.container();
        $('a' , container).click(function(){
            $('#donation_details').fadeOut(500 , function(){
                $('ul' , container).fadeIn();
            });
        });
    },
    appendList:function(data){
        var self = this;
        var windowHeight = $(window).height();

        $(".donations_list").empty();
        if (typeof(data)=='object' && data.length>0){
            $.each(data, function(index,item) {
                //var hebDate = localStorage.getItem("hebrewDate");

                //var secondLine = "</br>" + "לזכות" + " " + item.donation_note;
                //if (item.donation_note.length == 0){
                //    secondLine = "";
                //}

                var li = $("<li><div id='donation_cell'>" +
                    "On" + " " + item.eng_date + " "
                    + "donation of" + " " + item.currency +
                    item.donation_sum + "</div></li>");

                if (item.donation_note.length > 0){
                    li.css("background-image", "url('../images/Profile/goEng.png')");
                    li.css("background-position", "right center");
                    li.css("background-size", 13+"%");
                    li.css('text-indent', '4em');
                }

                self.container().find('.donations_list').append(li);

                $(li).click(function(){
                    if (item.donation_note){
                        self.showMessage(item);
                    }
                });

                $('li').css('font-size', (windowHeight * 0.025) + 'px');

            });
        } else {
            var li = $("<li><div id='donation_cell_empty'>"
                +
                "There are no Donations"
                +
                "</div></li>");
            li.css("line-height", "2em");
            li.css("text-align", "center");
            li.css('font-size', (windowHeight * 0.030) + 'px');
            li.css('text-indent', '5em');
            li.css("padding-left", "11%");
            self.container().find('.donations_list').append(li);
        }
    },
    showMessage:function(item){
        var container = this.container();

        var donationNote = item.donation_note;
        donationNote = donationNote.replace(/\\/g, '');
        $('#donationText' , container).html(donationNote);

        $('ul' , container).fadeOut(500 , function(){
            $('#donation_details').fadeIn(500);
            $('#profileHeader').hide();
            $('#goBack').show();
        });
    },
    setList:function(){
        //init params for spinner
        var target = document.getElementById('spinner');
        var spinner = new Spinner(coinz.initSpiner());
        spinner.spin(target);

        var self = this;
        coinz.ajax('get_donations' , {} , function(list){
            $("#spinner").hide();
            spinner.stop();
            self.appendList(list);
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
    },
    setSize: function(){
        var windowHeight = $(window).height();
        $('#remindersTab').css('font-size', (windowHeight * 0.030) + 'px');
        $('#donationsTab').css('font-size', (windowHeight * 0.030) + 'px');
        $('#donationTextTitle').css('font-size', (windowHeight * 0.045) + 'px');
        $('#donationText').css('font-size', (windowHeight * 0.035) + 'px');
        $('#beitChabadLabel').css('font-size', (windowHeight * 0.026) + 'px');
        $('.donations_list').css('margin-left','1%');
        $('.donations_list').css('width','100.2%');
        //CSS for iPhone4 and small screens
        if (windowHeight < 500) {
            $('.donations_list').css('padding-top','30%');
            $('li').css('width','5.9%');
            $('#donationsTab').css('right','48.5%');
            $('#remindersTab').css('right','3.8%');
            $('#beitChabadLabel').css('font-size', (windowHeight * 0.031) + 'px');
            $('#headerLogoImg').css('top', '2%');
        }
    }
};