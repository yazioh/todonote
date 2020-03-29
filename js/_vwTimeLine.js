var MEMO= MEMO|| {};
MEMO.vwTimeLine= function($VW) {
	this.$VW= $VW;
	//this.prototype= new View($VW);
};

/**
 * 今日やっとこと 
 */
$.extend(MEMO.vwTimeLine.prototype, {

	'name': 'vwTimeLine',
	'sideBar': ['mnPaw'], //mnOdr
	'init': function() {
		var SLF = this;
		this.$VW.on('click', '.fusen', function() {
			var $TGT= $(this);
			if (!$TGT.hasClass("fusen")) {
				$TGT= $TGT.closest("li.fusen");
			}
			var id= $TGT.data("id");
			if (id) {
				MEMO.VIEWs['vwEdit'].load(MEMO.TODOs[MEMO.idHash[id]]);
			}
			return false;
		});
		
		this.$VW.on('click', '.more', function() {
			var dt = $('ul.today').data("min");
			if(!dt){ dt= new Date(); }
			
			dt = new Date(dt.getTime()-_day);
			
			$('ul.today').data("min", dt);
			var $html = $(SLF.html(dt)); 
			$('ul.today').prepend($html);
			SLF.delay();
		});
	},

	'show': function() {
		this.$VW.stop().hide(0);
		this.$VW.show(0);
	},
	'hide': function() {
		this.$VW.stop().hide(0);
	},
	'clear': function() {
		$("ul.todo", this.$VW).html("");
	},

	'delay': function(){
		var SLF = this;
		$FSN = $('li.fusen.hide', this.$VW);
		if( $FSN.length >0){
			$FSN.eq(0).removeClass('hide');
			setTimeout(function(){
				SLF.delay();
			},_sec*0.05);
		}
	},

	'cond':{},
	'render':function(){
		this.cond=	MEMO.ToolBar.setFilter().cond("paw");
		//console.log(this.cond);		
		
		var dt = new Date();
		$('ul.today', this.$VW).html(this.html(dt));
		this.delay();
		
		
	},
	
	'html': function( dt ){
		var TSKs = this.pickupDateLog(dt);
		var SLF = this;
		var fsn ='';
		var html ='';
		var id0 ='';
		var tmp = '';
		var did = [];

		$.each(TSKs, function(i,TSK){
			if( TSK.id[0] != id0 ){
				if( tmp != ''){
					fsn += SLF.fusen(id0, tmp);
				}
				id0 = TSK.id[0];
				tmp = '';
			}
			
			tmp += '<li class="grid '+TSK.class+'">'
				+'<b class="col1">'+ SLF.ico(TSK.class)+'</b>'
				+'<b class="col3 tm">'+TSK.tm.hm()+'</b>'
				+'<span class="col8 ttl">'+TSK.title+'</span>'
				+'</li>';
		});
		if(tmp){
			fsn += SLF.fusen(id0, tmp);
		}

		html += '<li class="grid"><div class="col3">'
			+'<span class="dt">'
			+ dt.getFullYear()+'.'+(dt.getMonth()+1)
			+'<b>'+dt.getDate()+'<sub>'+dt.getDayKnj()+'</sub></b>'
			+'</span></div>'
			+'<div class="col9"><p class="bar">  </p></div>'
			+'</li>'
			+ fsn;
		
		return html;
	},
	
	'ico': function(cls) {
		return  (cls=='fin')? '<i class="fa fa-check"></i>' : '<i class="fa fa-pencil"></i>';
	},
		
	
	'fusen':function(tdID, list){
		var TD = MEMO.getTODO(tdID);
		if(!TD){ return '' };
		var info = TD.getProgress();
		
		var html ='<li class="hide fusen '+TD.area()+'" data-id="'+ tdID +'"><dl class="grid">'
			+'<dt class="col4">'
				+'<p class="ttl">'+TD.title()+'</p>'
				+'<p class="updt grid">'
					+'<span class="col6">'+info.updt+'</span>'
					+'<span class="col6 did">'+((info.fin)? + info.fin : info.did) +'</span>'
				+'</p>'
			+'</dt>'
			+'<dd class="col8"><ul class="tasks">' + list +'</dd>'
			+'</dl></li>';
		return html;
	},
		
	'pickupDateLog': function(dt){
		var ymd = dt.ymd();
		var TSKs = new Array();
		var SLF = this;
		var vCre = ($.inArray('c', this.cond)!==-1);
		var vFin = ($.inArray('f', this.cond)!==-1);
		
		$.each(MEMO.TODOs,function(i,TD){
			if(TD.status()=='X') return true;
			$.each(TD.getTask(),function(j, TSK){
				if(TSK.status()=='X') return true;

				if(vCre && TSK.create().ymd()==ymd){
					TSKs.push({
						'tm': TSK.create(),
						'class':"edt",
						'title':TSK.title(),
						'id':TSK.idFull().split("_")
					});
				}
				if(vFin && TSK.ok() && TSK.updt().ymd()==ymd){
					TSKs.push({
						'tm': TSK.updt(),
						'class':"fin",
						'title':TSK.title(),
						'id':TSK.idFull().split("_")
					});
				}
			});
		});
		this.TSKs = TSKs.sort(function(a,b){
			return(a.tm < b.tm ? -1 : 1);
		});
		
		return TSKs;
	},



}); 