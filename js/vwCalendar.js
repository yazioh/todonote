var MEMO= MEMO|| {};
MEMO.vwCalendar= function($VW) {
	this.$VW= $VW;
};
var tallLimit = 151; // ２倍高さ表記の境界 (分)
$.extend(MEMO.vwCalendar.prototype, {
	'name': 'vwCalendar',
	'sideBar': ['mnTags','mnCond','mnTdy'], //mnOdr
	'init': function() {
		var SLF = this;
		// ------------------------------------------
		// 背景クリックは新規
		// ------------------------------------------
		this.$VW.on('click', "#noLimit .search", function() {
			return false;
		});
		this.$VW.on('change', "#noLimit .search input", function() {
			SLF.query( $(this).val());
		});
		this.$VW.on('click', "#noLimit", function() {
			var TD= new ToDo();
			TD.area('a4');
			MEMO.VIEWs['vwEdit'].load(TD);
			return false;
		});
		// ------------------------------------------
		this.$VW.on('click', "li.day", function() {
			var $TGT= $(this);
			if (!$TGT.hasClass("day")) {
				$TGT= $TGT.closest("li.day");
			}
			var TD= new ToDo();
			TD.area('a1');
			TD.do($TGT.attr("id"));
			MEMO.VIEWs['vwEdit'].load(TD);
			return false;
		});
		// ------------------------------------------
		this.$VW.on('click', "li.week", function() {
			var $TGT= $(this);
			if (!$TGT.hasClass("day")) {
				$TGT= $TGT.closest("li.week");
			}
			var TD= new ToDo();
			TD.area('a3');
			TD.do($TGT.attr("id"));
			MEMO.VIEWs['vwEdit'].load(TD);
			return false;
		});
		// ------------------------------------------
		this.$VW.on('touch', ".tab", function() {
			var $TGT= $(this);
			if (!$TGT.hasClass("tab")) {
				$TGT= $TGT.closest(".tab");
			}
			$('.touched', this.$VW).removeClass("touched");
			$TGT.addClass("touched");
			return false;
		});		
		// 再編集
		// ------------------------------------------
		this.$VW.on('click', "li.fusen", function() {
			var $TGT= $(this);
			if (!$TGT.hasClass("fusen")) {
				$TGT= $TGT.closest("li.fusen");
			}
			var id= $TGT.data("tdid");
			if (id) {
				MEMO.VIEWs['vwEdit'].load(MEMO.getTODO(id));
			}
			return false;
		});
		
		// 付箋を動かす -------------------------------
		this.$VW.on('dragstart', '.fusen', function(ev) {
			MEMO.dragStart($(this));
		});
		this.$VW.on('dragend', '.fusen', function(ev) {
			var tgtID = $('.todo', MEMO.$tgtObj).attr("id");
			var fsnID = $(MEMO.$drgObj).data("tdid");
			ev.preventDefault();
			MEMO.dragEnd($(this));
			SLF.moveTo(fsnID, tgtID);
			// save
			//console.log("autosave");
			MEMO.saveData(); 			
			return false;
		});
		// タグを受け取る -------------------------------
		var testFlg;
		this.$VW.on('dragenter', '.dropable', function(ev) {
			testFlg = true;
		});
		this.$VW.on('dragover', '.dropable', function(ev) {
			testFlg = false;
			if(MEMO.$drgObj && (MEMO.$drgObj.hasClass("tag") || MEMO.$drgObj.hasClass("fusen"))){
				ev.preventDefault();
				MEMO.dragOver($(this));
			}			
			return false;
		});
		this.$VW.on('dragleave', '.dropable', function(ev) {
			if( testFlg){
				testFlg= false;
			} else {
				if($(this).hasClass("over")){
					ev.preventDefault();
					MEMO.dragLeave($(this));
				}		
			}	
			return false;
		});
		//-----------------------------------
		this.clear();
	},
	'qTxt':'',// 絞込テキスト
	'show': function(){
		this.$VW.stop().hide(0);
		this.$VW.show(0);
		$('.search input',this.$VW).val("");
		this.qTxt='';
	},
	'hide': function(){
		this.$VW.stop().hide(0);
	},
	'clear': function(){
		$WKs = $('li.week', this.$VW);
		var wst = new Date().wkStart();

		// 0番は未完了表示のため　1から
		for(var i=1; i<$WKs.length; i++){
			$WkTab = $WKs.eq(i);
		
			var WI = wst.wkInfo(i-1);// 今週は 0
			$WkTab.attr("id",WI.wkID);
			var edt = (WI.start.getMonth()==WI.end.getMonth())? WI.end.getDate() : WI.end.n_d()
			$('.thr i', $WkTab).html(WI.start.n_d() +'～'+ edt);
			// 来週以降は○月何週表示に
			if(i>2){ $('.thr b', $WkTab).html(WI.label); }
			$('>.todo', $WkTab).html("").attr("id", WI.wkID);

			$('>.folders', $WkTab).html("");
		//	wst = new Date( wst.getTime() + _week);
		}
		// 今日から、＋ｘ日分のタブをつくる
		var dd = new Date();
		for(i=0; i<8; i++){
			var did = 'D'+dd.ymd(); 
			var wkid = 'W'+dd.wkStart().ymd();
			var html = '<li class="day dropable wd'+dd.getDay()+'" id="'+did+'">'
					+'<h3 class="thl tab">'+'('+dd.getDayKnj()+')'
						+'<i><sup>'+(dd.getMonth()+1)+ '/</sup>'+ dd.getDate()+'</i>' +'</h3>'
					+'<p class="noTask"><i class="fa fa-sticky-note-o"></i> 予定がありません</p>'
					+'<ul id='+did+' class="todo glid"></ul>'
					+'</li>';
			// @todo 効率化できそう
			$('#'+wkid+'>.folders', this.$VW).append($(html).data("dt",dd.ymd()));
			dd = new Date(dd.getTime()+_day);
		}
	},

	'moveTo': function(fsnID, tgtID){
		var TD = MEMO.getTODO(fsnID);
		TD.do((tgtID=='UNDEF')? '' :tgtID );
		this.render();
		
		var cnt = $('#wkLast .todo li', this.$VW).length;
		if(!cnt){
			$('#wkLast',this.$VW).hide();
		}else{
			$('#wkLast',this.$VW).show();
		}
	},

	//-----------------
	/*
	'fltNotAsign':function(no,i,Ary){
		var TD = MEMO.TODOs[no];
		if (TD.ok()){ return false; }
		if (TD.do()!=''){ return false; } 
		console.log(MEMO.vwCalendar.qTxt);
		if(!(MEMO.vwCalendar.qTxt) || TD.like(MEMO.vwCalendar.qTxt)){
			
			return true;
		}
		
		return false;
	},*/
	// 
	'odrNotAsign':function(a,b){
		var Ma = MEMO.TODOs[a];
		var Mb = MEMO.TODOs[b];

		var a1 =''+Ma.area(); 
		var a2 =''+Mb.area(); 
		if(a1 != a2 ){ return ((a1 < a2)? -1 : 1); }

		var Ia = Ma.getProgress();
		var Ib = Mb.getProgress();
		var Ta = Ia.cnt * Ma.unitTime();
		var Tb = Ib.cnt * Mb.unitTime();
		if(Ta != Tb){ return ((Ta > Tb)? -1: 1); }

		return (Ma.updt() > Mb.updt())? -1 : 1;
	},

	// アサイン済み　3H超えを巨大付箋化する
	// （表示がつっかえるので）大きいのは先に表示
	'odrAsigned':function(a,b){
		var Ma = MEMO.TODOs[a];
		var Mb = MEMO.TODOs[b];
		var Ia = Ma.getProgress();
		var Ib = Mb.getProgress();
		var Ta = Ia.cnt * Ma.unitTime();
		var Tb = Ib.cnt * Mb.unitTime();
		if(Ta>= tallLimit || Tb>= tallLimit){  
			if(Ta != Tb){ return ((Ta > Tb)? -1: 1); }
		}
		var a1 =''+Ma.area(); 
		var a2 =''+Mb.area(); 
		if(a1  != a2 ){ return ((a1 < a2)? -1 : 1); }
		return (Ma.updt() > Mb.updt())? -1 : 1;
	},


	'render': function(){
		this.clear();
		var SLF = this;
		// 1次フィルタ（サイドバー絞込結果）
		var TODOs = MEMO.ToolBar.filter().find();

		// 「済案件も表示の」時、全体幅は済も含む幅にしたい
		var flgDone = MEMO.ToolBar.isShowFinish();
		
		// 左：未アサイン
		var NATODOs = TODOs.filter(function(no,i,Ary){
			var TD = MEMO.TODOs[no];
			if (TD.ok()){ return false; }
			if (TD.do()!=''){ return false; } 
			if(!(SLF.qTxt) || TD.like(SLF.qTxt)){
				return true;
			}
			return false;
		}).sort(this.odrNotAsign);
		html = '';
		if(NATODOs.length){
			$.each(NATODOs,function(i,no){
				html += SLF.fusen(MEMO.TODOs[no], 0);
			});
		}
		$('#noLimit ul.todo', this.$VW).html(html);

		// アサイン済み：１　期限内
		$FLDs = $('ul.todo', this.$VW);
		for(var i=1; i<$FLDs.length; i++){
			this.asignToFolder($FLDs.eq(i), TODOs, flgDone );
		}
		
		//アサイン済み：２　期限切れ
		var dd = new Date();
		var did = 'D'+dd.ymd(); 
		var wkid = 'W'+dd.wkStart().ymd();
		
		var ETODOs = TODOs.filter(function(no,i,Ary){
			if(MEMO.TODOs[no].ok()){ return false; }
			var dodt = MEMO.TODOs[no].do();
			if(dodt==""){return false;}
			var wd = dodt.substr(0,1);
			if(wd=='D'){
				return (did > dodt); 
			}
			return (wkid > dodt); 
		}).sort(this.odrNotAsign);
		
		if(ETODOs.length==0){
			$("#wkLast", this.$VW).hide();
		}else{
			$("#wkLast", this.$VW).show();
			var html = '';
			$.each(ETODOs,function(i,no){
				html += SLF.fusen(MEMO.TODOs[no], true);
			});
			$("#wkLast .todo", this.$VW).html(html);
		}
		// 左辺の表示枚数調整（画面幅）
		this.onResize();	
	},
	
	'asignToFolder': function( $FLD, TODOs, flgDone ){
		var SLF = this;
		var fldID = $FLD.attr("id");
		var ATODOs = TODOs.filter(function(no, i, Ary){
			return (MEMO.TODOs[no].do() == fldID);
		}).sort(this.odrAsigned);

		var html = '';
		var sumTm=0;
		if(ATODOs.length==0){
			// 予定なしの表示
			$(".noTask", $FLD.parent()).show();
		} else {
			// 予定なしの非表示
			$(".noTask", $FLD.parent()).hide();
			$.each(ATODOs,function(i,no){
				var TD = MEMO.TODOs[no];
				html += SLF.fusen(TD, true, flgDone);
				var info = TD.getProgress();
				var u = TD.unitTime();
				var cnt = info.cnt + (flgDone >-1 ? info.ok :0);
				sumTm += cnt *u;
			});
			// 作業時間 合計
			html += '<li class="tmSum tm">'+HTML.hour(sumTm)+'</li>';
		}
		$FLD.html(html);
	},
	
	// 左右兼用　wid （幅指定スイッチ　ありで右側表示）
	'fusen':function(TD, wid, finished){
		if(!TD || !TD.id){ return ''; }
		
		var info = TD.getProgress();
		var sumTm =(info.cnt+ (finished>-1? info.ok: 0))* TD.unitTime();
		var fClass = [
				'fusen',
			 	TD.area(),// 色
				'col'+((!wid)? '': this.colWidth(sumTm)), // 幅
			];
			this.tmClass(sumTm, fClass); // 作業時間の設定
			if(TD.ok()){ fClass.push('OK'); } // 済
		
		return '<li class="'+fClass.join(' ')+'" data-tdid="'+ TD.id()+'" draggable="true">'
			+'<p class="ttl"><span>'+ TD.title() +'</span></p>'
			+ (wid ? this.totalTm(sumTm) : this.tasks(TD)+ HTML.updtInfo(info))
			+'</li>';
	},
	'colWidth': function (sumTm){
	  	if(sumTm<60){ return 2; }
	  	if(sumTm>=tallLimit){
			var wd = (sumTm/60).toFixed(0); //+60分単位 で1uにする 
			return (wd>12)? 12: wd;
	  	}
		var wd = (sumTm/30).toFixed(0); //+30分単位 で1uにする
		return (wd>12)? 12: wd;
	},
	'tmClass': function(sumTm, fClass){
		// ４H以上は高さ倍　→12hまで　
		if(sumTm>=tallLimit){ fClass.push('tall');}

		// 1H未満は　高さで表現
		if(sumTm<=15){ fClass.push('m15'); } 
		else if(sumTm<=30){ fClass.push('m30'); }
		else if(sumTm<=45){ fClass.push('m45'); }
	},
	
	'totalTm': function(sumTm){
		// 狭小付箋で表示しない
		if(sumTm<60){return'';}
		return '<em class="tm">'+HTML.hour(sumTm)+'</em>';
	},

	'tasks':function(TD){
		var TSKs = TD.getTask();
		var ret = [];
		$.each(TSKs, function(i,tsk){
			if(!tsk.ok()){
				ret.push('<li>'+tsk.title()+'</li>');
			}
		});
		if(!ret.length){ return '' ;}
		return '<ul class="task">'+ret.join('')+'</ul>';
	},
	
	//未定側　分割数画面幅に合わせて変更
	'onResize':function(){
		var ww= window.innerWidth;
		$.each([
			{'w': 1600, 'colNl':'col6', 'colA':'col6' }, 
			{'w': 1280, 'colNl':'col5', 'colA':'col7' }, 
			{'w':  800, 'colNl':'col4', 'colA':'col8' }, 
			{'w':    0, 'colNl':'col12', 'colA':'col12' }, 
		],function(i,bp){
			if(ww>bp.w ){
				$('#noLimit'  ).removeClass("col12 col3 col4 col5 col6").addClass(bp.colNl);
				$('#scheduled').removeClass("col12 col9 col8 col7 col6").addClass(bp.colA);
				return false;// break;
			}
		});		
		
		var isPortrate = $("body").hasClass("portrait");
		//var w0 = (isPortrate)? 0 : this.noLimitAreaWidth();
		var w0 = this.noLimitAreaWidth();
		$.each([
			{'w':500,  'div': 'div1'},
			{'w':750,  'div': 'div2'},
			{'w':1000, 'div': 'div3'},
			{'w':9999, 'div': 'div4'},
		],function(i,bp){
			if(w0 < bp.w){ 
				$('#noLimit .todo',this.$VW).removeClass("div1 div2 div3 div4").addClass( bp.div );
				return false; // break;
			};
		});
	},
	
	'noLimitAreaWidth':function(){
		var iw= window.innerWidth;
		$('#noLimit', this.$VW).css('width', '');
		var w0 =$('#noLimit', this.$VW).innerWidth();
		if(w0<100 && iw>100){ w0 = iw*w0/100 ; } // なぜか初回だけ%で帰るっぽい ので window幅掛けて戻す
		return w0;
	},
	'query':function(txt){
		this.qTxt = txt;
		this.render();
	},	
});