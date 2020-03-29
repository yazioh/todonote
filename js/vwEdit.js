var MEMO= MEMO|| {};
MEMO.vwEdit= function($VW) {
	this.$VW= $VW;
};


$.extend(MEMO.vwEdit.prototype, {
	'name': 'vwEdit',
	'sideBar': ['mnEdit', 'mnTags'],	
	'unitTmDefault':[5,6,10,15,20,30,45,60],
	'init': function() {
		this.initUnitTime();

		var SLF= this;
		//EditorView イベント イテレータ内 "this"→SLFに注意
		// area 変更 ---------------------------------
		this.$VW.on('click', ".map li", function() {
			var aName= $(this).data("area");
			if (aName) {
				SLF.setArea(aName);
			}
			return false;
		});
		// 切り離し　 ---------------------------------
		this.$VW.on('click', "#cutOff", function() {
			SLF.cutOff();
			return false;
		});
		
		// テキスト変更時 ----------------------------------
		this.$VW.on('change', '#memoTtl', function() {
			var txt= $(this).val();
			SLF.setTitle(txt);
			return false;
		});
		// date & time
		this.$VW.on('change', '.new input', function() {
			var txt= $(this).val();
			if (txt!= '') {
				SLF.addTask(txt);
			}
			return false;
		});
		this.$VW.on('change', 'input', function() {
			var $LI= $(this).closest("li");
			var id= $LI.data('tskid');
			var txt= $(this).val();
			if (id) {
				var tsk= SLF.taskEdit(id, txt);
				SLF.TODO.updt(new Date());
				SLF.nextFocus($(this));
				SLF.setProgress();
			}
			return false;
		});
		
		//　ボタン類 　--------------------------------------------
		this.$VW.on('click', '#btnDelete', function() {
			var TD= SLF.TODO;
			if (TD && TD.id) {
				if( confirm("このリストを削除します")){
					TD.status('X');
					SLF.closeEnd();
				}
			}
			return false;
		});
		// --
		this.$VW.on('click', '.doing button.ck', function() {
			var $LI= $(this).closest("li");
			var id= $LI.data('tskid');
			if (id) {
				var tsk= SLF.taskFinish(id);
				// @todo 光るとか
				SLF.setProgress();
			}
			return false;
		});
		// --
		this.$VW.on('click', '.done  button.ck', function() {
			var $LI= $(this).closest("li");
			var id= $LI.data('tskid');
			if (id) {
				var tsk= SLF.taskReject(id);
				SLF.setProgress();
			}
			return false;
		});
		// フキダシ ON/OFF--
		this.$VW.on('click', 'button.mnu', function() {

			var $MNU = $('.ctrl', this.$VW);
			var id= $MNU.data('tskid');
			if(id){
				$MNU.data('tskid', '').hide(0);
				return false;
			}

			var $LI= $(this).closest("li");
			var pos = $LI.position();
			var id= $LI.data('tskid');
			
			$MNU.css({'top': (pos.top-30)+'px'})
				.data("tskid",id)
				.show(0);
			return false;
		});
		// フキダシのボタン --
		this.$VW.on('click', '.ctrl button', function() {
			var cmd = $(this).data("cmd");
			var $MNU = $(this).closest(".ctrl");
			var id= $MNU.data('tskid');
			$MNU.hide();
			
			switch(cmd){
				case 'up':
					SLF.TODO.fstTask(id);
					break;
				case 'dwn':
					SLF.TODO.lateTask(id);
					break;
				case 'rmv':
					SLF.TODO.removeTask(id);
					break;
			}
			SLF.refresh();
		});
		
		// 時間単位変更
		this.$VW.on('change', '#unitTime', function() {
			SLF.TODO.unitTime(1*$(this).val());
			SLF.setProgress();
		});

		// スケジュールボタン
		this.$VW.on('click', 'ol.week a', function() {
			var $btn = $(this);
			if($btn.hasClass("past")){
				alert("過去には設定できません");
				return false;
			}
			var TD= SLF.TODO;
			if($btn.hasClass("selected")){
				//  解除
				TD.do('');
			} else{
				var dyID = $btn.data("did");
				TD.do(dyID);
			}
			SLF.setSchedule(TD);
			return false;
		});
		// 
		this.$VW.on('click', '.rmvTag', function() {
			var $btn = $(this);
			var $li = $btn.closest('li');
			var id = $li.data('tagID');
//			console.log(id);
			SLF.removeTag(id);
			return false;
		});

		// 外側クリック  ---------------------------------
		this.$VW.on('click', function() {
			SLF.closeEnd();
			return false;
		});
		// editor の地クリック（上をキャンセル）
		this.$VW.on('click', '.editor', function() {
			var $MNU = $('.ctrl', this.$VW);
			var id= $MNU.data('tskid');
			if(id){
				$MNU.data('tskid', '').hide(0);
				return false;
			}
			return false;
		});

		// キー操作　---------------------------------
		this.$VW.on('keydown', function(ev) {
			if (ev.ctrlKey&& ev.keyCode== 83) {//Ctrl+S
				SLF.closeEnd();
				return false;
			}
		});

		this.$VW.on('keydown','input', function(ev) {
			if (ev.keyCode== 13) {//Ctrl+S
				if(!SLF.nextFocus($(this))){ return true; }
				return false;
			}
		});

		// タグを受け取る -------------------------------
		var testFlg;
		this.$VW.on('dragenter', '.editor', function(ev) {
			testFlg = true;
		});

		this.$VW.on('dragover', '.editor', function(ev) {
			testFlg = false;
			if(MEMO.$drgObj && (MEMO.$drgObj.hasClass("tag") )){
				ev.preventDefault();
				MEMO.dragOver($(this));
			}			
			return false;
		});
		this.$VW.on('dragleave', '.editor', function(ev) {
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
	},

	'initUnitTime':function(){
		var opt = '';
		$(this.unitTmDefault).each(function(i,m){
			opt += '<option value="'+m+'">'+m+'</option>';
		})
		$('#unitTime',this.$VW).html(opt);
	},
	
	//-------------------------------------------------
	'nextFocus':function($input){
		var no = ($input.data("no") || 0);
		var ln = $('.doing input', this.$VW).length;
		if(ln==0){ return false;}
		
		if(no<ln){
			$NXT = $('.doing input', this.$VW).eq(no);
		} else {
			$NXT = $('.new input', this.$VW).eq(0);
		}
		setTimeout(function() {
			$NXT.focus();
		}, 1);
		return true;
	},
	'showFlg':0,
	'show': function() {
		this.showFlg=1;
		$('#vwEdit').stop(0).slideUp(0).slideDown(0);
		MEMO.ToolBar.setFiltersButton("vwEdit");
		$('#mnView').hide();
	},
	'hide': function() {
		this.showFlg=0;
		$('#vwEdit').slideUp(0);
		MEMO.ToolBar.setFiltersButton(MEMO.currentView().name);
		$('#mnView').show();
	},

	'refresh': function() {
		var TD= this.TODO;
		this.setTitle(TD.title());
		this.setArea(TD.area());
		this.setTaskList(TD.getTask());
		this.setTags(TD.tags());
		this.setUnitTime(TD);
		this.setProgress(TD);

		this.setSchedule(TD);
		
		CAL.init($('#vwEdit .cal .week'), '');

		// focus になにやらバグがあり　遅延の必要あり
		var $INPUT= (!TD.title()) ? $("#memoTtl", this.$VW) : $(".new input", this.$VW);
		setTimeout(function() {
			$INPUT.focus();
		}, 1);
	},

	'setArea': function(nm) {
		var $VW= $('#vwEdit');
		$('.editor', $VW).removeClass("a1 a2 a3 a4").addClass(nm);
		this.TODO.area(nm);
	},

	'load': function(TD) {
		this.lstUpdt = 0+ TD.updt().getTime();
		this.TODO= TD;
		var FLT = MEMO.VIEWs['vwSideBar'].filter();
//	console.log(FLT.opt.tag);		
//	console.log(TD.title());		
		
		
		this.refresh();
		this.show();
	},

	'setTitle': function(todoTtl) {
		var $VW= $('#vwEdit');
		this.TODO.title(todoTtl);
		$('#memoTtl', $VW).val(todoTtl) ;
		$('#doneList .ttl', $VW).text(todoTtl+ '(済)' );
	},
	'setUnitTime':function(TD){
		TD = TD || this.TODO;
		var tm = TD.unitTime();
		$('#unitTime', this.$VW).val(tm);
	},
	
	'setProgress':function(TD){
		TD = TD || this.TODO;
		var info = TD.getEstimate();
		$BAR = $('#estimate .checked');
		$BAR.hide();
		if( info.total ){
			if(info.todo == 0){	
				$('#estimate .val', this.$VW).html(
					'<i class="fa fa-flag-checkered"></i>  fin'
				);
			} else {
				HTML.hour(info.todo*60, $('#estimate .val', this.$VW));
				if(info.todo>0 && info.todo!=info.total){
					var rt = (info.todo / info.total)*100;
					$('b', $BAR).css({'width':rt+'%'});
					$BAR.show();
				}
			}
		}
	},
	

	'closeEnd': function() {
		this.close();
		if (this.TODO.title()== '' && this.TODO.cntTsk().total== 0) {
			if (this.TODO.id()) {
				this.lstUpdt=0;
				MEMO.removeToDo(this.TODO.id());
			}
		} else if (!this.TODO.id()) {
			this.lstUpdt=0;
			MEMO.addToDo(this.TODO);
		} else {
			//this.TODO.updt(new Date());
		}
		
		var updt = 0+ this.TODO.updt().getTime();
		if(updt != this.lstUpdt){
			console.log("editor auto save");
			MEMO.saveData();
		}
		MEMO.currentView().render();
		
	},
	'close': function() {
		// @todo 編集内容破棄のアラート
		// @todo 編集内容破チェック
		this.hide();
	},

	'taskFinish': function(id) {
		var tsk= this.TODO.find(id);
		if (tsk) {
			tsk.ok(true);
			this.setTaskList(this.TODO.getTask());
			this.TODO.updt(new Date());
			this.setProgress();
		}
	},
	'taskReject': function(id) {
		var tsk= this.TODO.find(id);
		if (tsk) {
			tsk.ok(false);
			this.setTaskList(this.TODO.getTask());
			this.TODO.updt(new Date());
			this.setProgress();
		}
	},
	'taskEdit': function(id, txt) {
		var tsk= this.TODO.find(id);
		if (tsk) {
			tsk.text(txt);
			this.setTaskList(this.TODO.getTask());
			this.TODO.updt(new Date());
		}
	},
	'taskRemove': function(id) {
		this.TODO.removeTask(id);
		this.setTaskList(this.TODO.getTask());
		this.TODO.updt(new Date());
		this.setProgress();
	},

	'setTaskList': function(TSKs) {
		var $VW= $('#vwEdit');
		$('.doing', $VW).html('');
		$('.done', $VW).html('');
		self= this;
		var taskDoing= '';
		var taskDone= '';
		var no = 1;
		var $tsks = $('<ul></ul>');
		$.each(TSKs, function(i, tsk) {
			if (!tsk.ok()) {
				$tsks.append(self.htmlToDo(tsk, no));
				++no;
			}
		});
		//console.log($('li',$tsks));
		$('ol.doing', $VW).html($tsks.html());

		$tsks.html("");
		$.each(TSKs, function(i, tsk) {
			if (tsk.ok()) {
				$tsks.append(self.htmlToDo(tsk, 0));
			}
		});
		if ($('li', $tsks).length) {
			$('.tasks.done', $VW).html($tsks.html());
			$('#doneList', $VW).show();
		} else {
			$('#doneList', $VW).hide();
		}
		
	},

	'htmlToDo': function(tsk, no) {
		var $VW= $('#vwEdit');
		var html= '';
		var tmpCls = (tsk.ok())? '.tmpDone' : '.tmpDoing';
		var $tmp = $('.template li'+tmpCls , $VW).eq(0).clone();
		$tmp.attr('data-tskId', tsk.idFull());
		
		$('input.title', $tmp).attr("value", tsk.text()).attr("data-no", no);
		$('p.title', $tmp).html(tsk.text());
		$('i.tm', $tmp).html(tsk.updt().fuzzy());
		return $tmp;
/*	
		if(tsk.ok()){
			html+= '<div class="col1"><button class="ck col1 OK"><i class="fa fa-check"></i></button></div>';
			html+= '<div class="col9"><p>'+ tsk.text() + '</p></div>';
			html+= '<div class="col2"><i class="tm">'+ tsk.updt().fuzzy() +'</i></div>';
			
		}else{
			html+= '<div class="col1"><button class="ck col1"><i class="fa fa-check"></i></button></div>';
			html+= '<div class="col10"><input type="text" value="'+ tsk.text()+ '" data-no="'+no+'" /></div>';
			html+= '<div class="col1"><button class="mnu"><i class="fa fa-bars"></i></button></div>';
		}
		return '<li class="grid" data-tskId="'+ tsk.idFull()+ '">'+ html+ '</li>'
*/
	},

	'addTask': function(txt) {
		var $VW= $('#vwEdit');
		this.TODO.addTask(txt);
		this.TODO.updt(new Date());
		this.setTaskList(this.TODO.getTask());
		this.setProgress();
		$(".new input", $VW).val("").focus();
	},
	
	'setTags': function(tgs){
		var lbl ='';
		var $UL = $('.editor .tags', this.$VW);
		$UL.html('');

		var $TP = $('.templete', this.$VW);
		$(tgs).each(function(n, tgID){
			var TG = MEMO.getTag(tgID); 
			$li = $(''+$TP.html());
			$li.data('tagID', TG.id());
			if(TG){
				HTML.tag(TG, $('span',$li))
				$UL.append($li);
			}
		});
	},
	'addTag': function(tagID, $drpTGt){
		// この画面d値は　TODO１こしかない
		var TD= this.TODO;
		TD.addTag(tagID);
		TD.updt(new Date());
		this.setTags(TD.tags());
	},
	'removeTag': function(tagID){
		// この画面d値は　TODO１こしかない
		var TD= this.TODO;
		TD.removeTag(tagID);
		TD.updt(new Date());
		this.setTags(TD.tags());
	},
	'cutOff' : function(){
		var EdtTD = this.TODO;
		var TSKs = this.TODO.getTask().filter(function(tsk){ return tsk.ok();});
		if(TSKs.length==0){ return; }
		//return ;
		
		if(1){
			// 済タスク移動先の確保
			var FinTD = new ToDo();
			FinTD.title(    EdtTD.title()+'(済)');
			FinTD.area(     EdtTD.area());
			FinTD.start(    EdtTD.start());
			FinTD.unitTime( EdtTD.unitTime());
			FinTD.do(       EdtTD.do());
			var tgs = EdtTD.tags();
			if(tgs.length){
				$.each(tgs, function(i,TG){	FinTD.addTag(TG);});
			}
			// 済タスクを新ToDoに移動
			$.each(TSKs, function(i, tsk) {
				var mvTsk = EdtTD.removeTask(tsk.idFull());
				if(mvTsk){ FinTD.addTask(mvTsk); }
			});
		}
		
		// データ保存
		MEMO.addToDo(FinTD);
		MEMO.saveData();
		
		// 再描画		
		this.setTaskList(EdtTD.getTask());
		//EdtTD.updt(new Date());
		this.setProgress();
		this.refresh();
	},
	//  
	'setSchedule': function(TD){
		var doDate = TD.do();

		// 向こう５週間の
		var tdy = new Date();
		var WKs = Assined.week($('.week li.wkH', this.$VW).length);

		var SLF = this;
		$('.week li.wkH',this.$VW).each(function(i,LI){
			var $LI = $(LI);
			if(!WKs[i]){ return false; }
			HTML.hour(WKs[i].sum, $('.tm', $LI));

			var wid = WKs[i].wkInfo.wkID;
			$('a',$LI).data('did',wid).removeClass("selected");
			if(doDate==wid){
				$('a',$LI).addClass("selected");
			}
			if(i>1){
				$('a',$LI).html(''+
					 WKs[i].wkInfo.label 
					 +' ～'
					+' '+ WKs[i].wkInfo.end.m_d()
				);
			}
		});
		var ymd = tdy.ymd();
		var sTime = WKs[0].wkInfo.start.getTime();
		var fYmd = new Date(tdy.getTime()+ 8*_day).ymd();

		$('.div7 .col',this.$VW).removeClass("selected past today future");
		$('.div7 .col',this.$VW).each(function(i,A){
			var test = new Date(sTime+ i*_day);
			var tYmd = test.ymd();
			$(A).html(test.getDate());
			if(tYmd < ymd){
				$(A).addClass("past");
			}
			if(tYmd== ymd){
				$(A).addClass("today");
			}
			if(tYmd>=fYmd){
				$(A).addClass("future");
			}
			var doID= 'D'+tYmd;
			$(A).data('did', doID);
			if(doID==doDate){
				$(A).addClass("selected");
			}
			
		});
	},

});

// 完全派生
MEMO.vwEdit2 = function($VW) {
	this.$VW= $VW;
};

$.extend(MEMO.vwEdit2.prototype,MEMO.vwEdit.prototype, {
	'name': 'vwEdit2',
	'init': function() {
		var SLF= this;

		//this.prototype.init();
		
	}
});
