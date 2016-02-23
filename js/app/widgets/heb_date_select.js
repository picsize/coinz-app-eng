var heb_date_select = {
    month_to_day:{
        1:{'name':'Tishrei', 'dayLimit':30},
        2:{'name':'Cheshvan', 'dayLimit':30},
        3:{'name':'Kislev', 'dayLimit':30},
        4:{'name':'Tevet', 'dayLimit':29},
        5:{'name':"Sh'vat", 'dayLimit':30},
        6:{'name':'Adar', 'dayLimit':29},
        7:{'name':'Adar II', 'dayLimit':30},
        8:{'name':'Nisan', 'dayLimit':30},
        9:{'name':'Iyyar', 'dayLimit':29},
        10:{'name':'Sivan', 'dayLimit':30},
        11:{'name':'Tamuz', 'dayLimit':29},
        12:{'name':'Av', 'dayLimit':30},
        13:{'name':'Elul', 'dayLimit':29}
    },
    numberToHebDay:{
        1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',
        11:'11',12:'12',13:'13',14:'14',15:'15',16:'16',17:'17',18:'18',19:'19',20:'20',
        21:'21',22:'22',23:'23',24:'24',25:'25',26:'26',27:'27',28:'28',29:'29',30:'30'
    },
    apply:function(container){
        this.populateMonth(container);
        this.populateDay(container);
        //this.changeEvent(container);
    },
    populateMonth:function(container){
        var month_select = $('.monthSelect' , container);
        $.each(this.month_to_day , function(month_num,month_data){
            var option = "<option value='" + month_num + "'>" + month_data.name + "</option>";
            month_select.append(option);
        });
        month_select.val(1);
    },
    populateDay:function(container){
        var self = this;
        var month_select = $('.monthSelect' , container);
        var current_month = parseInt(month_select.val());
        var day_select = $('.daySelect' , container);
        var month_data = this.month_to_day[current_month];
        day_select.empty();
        for (var i = 1; i <= month_data.dayLimit; i++) {
            var day_letter = self.numberToHebDay[i];
            var option = "<option value='" + i + "'>" + day_letter + "</option>";
            day_select.append(option);
        }
    },
    changeEvent:function(container){
        var self = this;
        var select = $('.monthSelect' , container);
        select.change(function(){
            self.populateDay(container);
        });
    }
}