var MEMO= MEMO|| {};
MEMO.vwTimeLine= function($VW) {
	this.$VW= $VW;
	//this.prototype= new View($VW);
};

/**
 * 今日やったこと 
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
		if(!TSKs || TSKs.length==0){return ''; }
		
		var SLF = this;
		var did = {'a1':0,'a2':0,'a3':0,'a4':0};
		var ttl = 0;

		var id0 = TSKs[0].id[0];
		var	TD = MEMO.getTODO(id0);
		var fsns = [];
		var tmp = '';
		$.each(TSKs, function(i, Tsk){
			if(Tsk.id[0]!=id0 && tmp){
				// 付箋が変わったら囲う
				fsns.push(SLF.fusen(id0, tmp));
				tmp='';
				id0= Tsk.id[0];
				TD = MEMO.getTODO(id0);
			}
			// チェック行
			tmp += SLF.check(Tsk);
			// todo 時刻
			if(Tsk.class=='fin'){
				did[TD.area()]+=TD.unitTime();
				ttl += (1*TD.unitTime());
			}
		});
		// 最後の残っててたら囲う
		fsns.push(SLF.fusen(id0, tmp));
		var bar ='';
		$.each( did,function(a, tm){
			if(tm>0){
				bar +='<span class="'+a+'" style="width:'+(100*tm/ttl)+'%;">'+(tm/60).toFixed(1) +'</span>';
			}
		});
	
		var html = '<li class="grid"><div class="col3">'
			+'<span class="dt">'
			+ dt.getFullYear()+'.'+(dt.getMonth()+1)
			+'<b>'+dt.getDate()+'<sub>'+dt.getDayKnj()+'</sub></b>'
			+'</span></div>'
			+'<div class="col9"><p class="bar">'+ bar +'</p>'
			+'<p class="sum"><i class="fa fa-check" /> '+ (ttl/60).toFixed(1) +'h</p></div>'
			+'</li>'
			+ fsns.join("");
		
		return html;
	},

	
	'getRrate': function (TSKs){
		var TD = MEMO.getTODO(tdID);
	},
	
	'fusen':function(tdID, ListHtml){
		if(!ListHtml){ return ''; }
		
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
			+'<dd class="col8"><ul class="tasks">' + ListHtml +'</dd>'
			+'</dl></li>';
		return html;
	},

	'check': function(TSK){
	 	function ico(cls) {
			return  (cls=='fin')? '<i class="fa fa-check"></i>' : '<i class="fa fa-pencil"></i>';
		}

		var html = '<li class="grid '+TSK.class+'">'
			+'<b class="col1">'+ ico(TSK.class)+'</b>'
			+'<b class="col3 tm">'+TSK.tm.hm()+'</b>'
			+'<span class="col8 ttl">'+TSK.title+'</span>'
			+'</li>';

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