var MEMO= MEMO|| {};
$(function() {
	// class（っぽい）メンバーの定義
	ToDo.prototype   = $.extend(ToDo.prototype, protoToDo);
	Task.prototype   = $.extend(Task.prototype, protoTask);
	Tag.prototype    = $.extend(Tag.prototype,  protoTag);
	Storage.prototype= $.extend(Storage.prototype, protoStorage);
	Filter.prototype = $.extend(Filter.prototype,  protoFilter);
	// APP本体の起動
	var APP= function(){
	};
	APP.prototype= $.extend(APP.prototype, MEMO, protoMemo);
	MEMO= new APP();
	MEMO.init();
});

//- APP本体 --------------------------------------------------
var protoMemo= {
	
	'mode': '',
	'CONFs':  {},
	'TODOs':  [],
	'TAGs':   [],
	'tgHash': [],
	'idHash': [],
	'curView': null,
	
	//------------------------------
	'init': function() {
		this.initScreen();
		// data
		this.Storage= new Storage();
		this.loadConf();
		//this.CONFs.vew = "vwTag";
		
		this.loadTags();

		// 全体＆テストのイベント
		this.setEventHandler();
		this.loadData();

		// splash 消す ----
		setTimeout(function(){
			// ボタン類表示
			MEMO.ToolBar.render();
			// nav.hide 解除
			MEMO.ToolBar.showMenu();
			
			// default view
			var vNm = (MEMO.CONFs.view || 'vwGrid');
			console.log('current:'+MEMO.CONFs.view);
			MEMO.currentView(vNm);
		},_sec);
	},
	// 画面関連初期化
	'initScreen': function() {
		var SLF = this;
		$('.hide').hide(0);
		$('section.page').hide(0);
		$('.show').show(0);
		this.SW = new ScreenWatcher(function(){
			var vw = SLF.currentView();
			return (vw && vw.onResize)? vw.onResize(): false;
		});
		this.VIEWs= new Array();
		var slf= this;
		$('#mnView li').hide();

		$('.view').each(function(i, o) {
			var $VW= $(o);
			var vwName= $VW.attr('id');
				// HTML 上のvwと同名のコントロールが存在したら初期化
			if (MEMO[vwName]&& typeof MEMO[vwName]== 'function') {
				var VW= new MEMO[vwName]($VW);
				console.log("init:"+ VW.name);
				VW.init();
				MEMO.VIEWs[vwName]= VW;
			}
			
		});
		
		$('#mnView li').each(function(){
			// サイドバーボタン不活性化（ないものはない！）
			var vwName = '' + $(this).data("view");
			if( vwName && typeof MEMO.VIEWs[vwName] !='undefined'){
				console.log('exists:'+vwName);
				$(this).show();
			}
		});

		if(MEMO.VIEWs['vwSideBar']){
			this.ToolBar = MEMO.VIEWs['vwSideBar'];
		}
	},

	// ビューの変更 r/w
	'currentView': function(view, notRender) {
		if (view && typeof MEMO.VIEWs[view]!== 'undefined'&& MEMO.VIEWs[view].show) {
			view= MEMO.VIEWs[view];
		}
		notRender	= (typeof notShow =='undefined' ? 0 : notShow); 
		if(!notRender && view && view.render){
			view.render();
		}
		// 切り替え
		if (view && view.show) {
			if (this.curView && this.curView.hide) {
				$('section.page').hide(0);
				this.curView.hide();
			}
		
			this.curView= view;
			this.curView.show();
			if(MEMO.ToolBar){
				MEMO.ToolBar.changeView(this.curView.name);
			}
		}
		return this.curView;
	},

	//-　イベント定義　------------------------------------------
	'setEventHandler': function() {

		// キー操作　---------------------------------
		$(document).on('keydown', function(ev) {
			if (ev.ctrlKey&& ev.keyCode== 83) {//Ctrl+S
				console.log("Ctrl+S save");
				MEMO.saveData();
				return false;
			}
		});
		
		//- event のキャッチ漏れ たら---------
		$('body').on('click', this.stop);
	},

	//-　イベントハンドラー　------------------------------------------
	'stop': function(ev) {
		ev.stopPropagation();
		return false;
	},

	'addToDo': function(td) {
		var len= this.TODOs.length;
		if (!td.id()) {
			td.id("M"+ len);
		}
		this.TODOs.push(td);
		this.idHash[td.id()]= 0+ len;
	},
	'removeToDo': function(id) {
		if ( typeof this.idHash[id]== 'undefined') {
			return;
		}
		var TMP= new Array();
		this.idHash[id]= new Array();
		$.each(this.TODOs, function(i, TD) {
			if (TD.id()!= id) {
				MEMO.idHash[TD.id()]= TMP.length;
				TMP.push(TD);
			}
		});
		this.TODOs= TMP;
	},

	'loadConf': function() { // @todo 
		var DATA = this.Storage.loadCONF();
		this.CONFs = $.extend({
			// @todo デフォルト値の設定
		},DATA);
	},
	'loadTags': function() {
		var DATA = this.Storage.loadTAG()
		if(DATA){
			$.each(DATA, function(n, tg) {
				if ( typeof tg.id!= 'function') {
					var tg= new Tag(tg);
				}
				MEMO.addTag(tg);
			});
		}
	},

	'loadData': function() {
		var DATA= this.Storage.loadTODO();
		$.each(DATA, function(n, td) {
			if ( typeof td.id!= 'function') {
				td= new ToDo(td);
			}
			MEMO.addToDo(td);
		});
	},
	
	'saveData':function(){this.Storage.saveTODO();},
	'saveTags':function(){this.Storage.saveTAG();},
	'saveConf':function(){this.Storage.saveCONF();},

	'getTODO': function(id) {
		if ( typeof this.idHash[id]!== 'undefined') {
			return this.TODOs[this.idHash[id]];
		}
		return false;
	},

	'addTag':function(tag){
		if(!tag.id()){
			tag.id(this.getTagId());
		}
		this.TAGs.push(tag);
		this.tgHash[tag.id()] =tag; 
	//	tag.idx(this.TAGs.lemgth);
	},
	
	'getTagId':function(){
		return 'T'+(this.TAGs.length+1);
	},
	
	'getTag':function(id){
		if(this.tgHash && this.tgHash[id]){
			return this.tgHash[id];
		}
		return null;
	},
	
	'removeTag': function(tgID){
		var TG = this.getTag(tgID);
		if(!TG || !TG.id){
			return false;
		}
		$(this.TODOs).each(function(i, TD){
			TD.removeTag(tgID);
		});
		// その他を抽出
		var ARY = this.TAGs.filter(function(T){
			return (T.id()!=tgID);
		});
		this.TAGs = ARY;
		var HS = new Array();
		$(this.TAGs).each(function(i, TG){
			HS[TG.id()]= TG;				
		});
		this.tgHash = HS;

		return TG;
	},
	
	//  drag drop は１オブジェクトにう限定しておく
	// (複数同時ドラッグは考えたくないん…)
	'dragStart':function($obj){
		if(this.$drgObj&&this.$drgObj.hasClass&&this.$drgObj!=$obj){
			//this.dragEnd($obj);
		}
		this.$drgObj = $obj.addClass("drg");
	},
	'dragEnd':function($obj){
		$obj.removeClass("drg over");
		if(this.$drgObj&&this.$drgObj.hasClass && $obj!=this.$drgObj){
			this.$drgObj.removeClass("drg");
		}
		this.$drgObj=null;
		// tgtのoverも解除
		if(this.$tgtObj&&this.$tgtObj.hasClass && $obj!=this.$tgtObj){
			this.$tgtObj.removeClass("over");
			this.$tgtObj=null;
		}
	},
	'dragOver':function($obj){
		if(this.$tgtObj&&this.$tgtObj.hasClass && $obj!=this.$tgtObj){
			this.$tgtObj.removeClass("over");
		}
		this.$tgtObj = $obj.addClass("over");
	},
	'dragLeave':function($obj){
		this.$tgtObj = null;
		$obj.removeClass("over");
	}
};

//- -------------------------------------------------
// とりま LocalStorage保存
// @todo ajaxでサーバーに保存とか、Evernoteに転記とか
function Storage() {
	this.LS= myLocalStorage;
}

var protoStorage= {
	'loadTODO':function(){
		var DATA= this.LS.get('TODO_NOTE');
		if (!DATA) {
			// ここでチュートリアルを初期ToDOにする
			DATA= new Array();
		}
		return DATA;
	},
	'loadTAG':function(){
		var DATA= this.LS.get('TODO_TAG');
		if (!DATA) {
			DATA= new Array();
		}
		return DATA;
	},
	'loadCONF':function(){
		var DATA= this.LS.get('TODO_CONF');
		if (!DATA) {
			DATA= new Array();
		}
		return DATA;
	},

	'load': function() {
		console.log("old function");
		/*
		var DATA= this.LS.get('TODONOTE');
		if ( typeof DATA.todo== 'undefined') {
			// ここでチュートリアルを初期ToDOにする
			DATA.todo= new Array();
		}
		if ( typeof DATA.tag== 'undefined') {
			DATA.tag= new Array();
		}
		if ( typeof DATA.conf== 'undefined') {
			DATA.conf= new Array();
		}
		*/
		return DATA;
	},
	
	'saveTODO':function(){
		var NOTEs= new Array();
		$.each(MEMO.TODOs, function(i, TD) {
			if(TD.status()!='X'){
				NOTEs.push(TD.toData());
			}
		});
		this.LS.set('TODO_NOTE', NOTEs);
		return NOTEs;
	},
	
	'saveTAG':function(){
		var TAGs= new Array();
		$.each(MEMO.TAGs,function(i,TG){
			TAGs.push(TG.toData());
		});
		this.LS.set('TODO_TAG', TAGs);
		return TAGs;
	},
	
	'saveCONF':function(){
		var CONFs= {
			'view': MEMO.currentView().name  || '',
		};
		this.LS.set('TODO_CONF', CONFs);
	},
	// 旧関数→個別保存に切り替えた
	'save': function() {
		this.LS.set('TODONOTE', {
			'todo': this.saveTODO(),
			'tag': this.saveTAG(),
			'conf': this.saveCONF(),
		});
		//console.log(localStorage);
	},
}


var Assined = {
	'week': function(x){
		var dt = new Date();
		var WKs= {};
		var IDX= {};
		for(var i=0; i<x; i++){
			var wkInfo = dt.wkInfo(i);
			WKs[i]= {'wkInfo':wkInfo , 'sum':0, 'cnt':0 };
			IDX[wkInfo.wkID]=i;
		}
		$.each(MEMO.TODOs, function(i, TD){
			var wkID = TD.doWeek();
			if(wkID && wkID in(IDX)){
				var ii = IDX[wkID];
				var cnt = TD.cntTsk();
				WKs[ii].cnt ++;
				WKs[ii].sum += (cnt.todo * TD.unitTime());
			}
		});
		return WKs;
	},
	
	'day': function (dt){
		// a@todo 
	},
};

var HTML= function(){
	function _tag(TG, $cont){
		var html = '<b class="tag" data-id="'+TG.id()+'">'
			+TG.label()+'</b>';
		if(typeof $cont !='undefined'){
			$cont.html(html);
		}
		return html;
	}
	function _hour(min, $cont){
		min = (typeof min!='undefined')? min : 0;
		var html= '<i class="fa fa-clock-o"></i>'+ ((min/60).toFixed(1))+'h';
		if(typeof $cont !='undefined'){
			$cont.html(html);
		}
		return html;
	}
	function _hm(min, $cont){
		min = (typeof min!='undefined')? min : 0;
		var html= '<i class="fa fa-clock-o"></i>'+ (Math.floor(min/60)+':'+('0'+(min % 60)).substr(-2));
		if(typeof $cont !='undefined'){
			$cont.html(html);
		}
		return html;
	}

	function _updtInfo(info, $cont ){
		var html = '<p class="updt grid">'  
			+'<span class="col4">'+info.create+'</span>'
			+'<span class="col4 c">'+info.updt+'</span>'
			+'<span class="col4 r">'+((info.fin)? +info.finfin: info.did)+'</span>'
			+'</p>';
		if(typeof $cont !='undefined'){
			$cont.html(html);
		}
		return html;
	}
	
	return {
		'hour': _hour, 
		'hm': _hm, 
		'tag': _tag, 
		'updtInfo': _updtInfo, 
	};
}();
