//---------------------------------------
// データ構造
// APP
//  +- ToDo （付箋）
//    +- Task （チェック項目）
//    +- Tag （プロジェクト・種別）
//
// +- vew
// +- EDT (view: editor)
//---------------------------------------
var ToDo= function(opt) {
	this.opt= $.extend({
		'id': '',
		'title': '',
		'area': 'a4',
		'task': new Array(),
		'tags': new Array(),
		'do': '',// 実施予定日
		'unit': 15,// 単位時間
		'rgst': '',
		'updt': '',
		'fin': '',
		'status': '0',
		'comp': 0,
	}, opt);

	if(!this.opt.rgst){
		this.opt.rgst = new Date();
	} else {
		this.opt.rgst = new Date(this.opt.rgst);
	}
	if(this.opt.start){
		this.opt.start = new Date(this.opt.start);
	}
	if(this.opt.updt){
		this.opt.updt = new Date(this.opt.updt);
	}
	if(this.opt.fin){
		this.opt.fin = new Date(this.opt.fin);
	} else if(this.ok()){
		this.opt.fin = new Date();
	}
	this.tHash= new Array();

	if (this.opt.task.length) {
		var TD= this;
		var TSKs= this.opt.task.slice(0, 9999);
		this.opt.task= new Array();
		$.each(TSKs, function(i, tsk) {
			TD.addTask(tsk, TD);
		});
	}
	this.chkStat();
	//console.log(this.task)
};
var protoToDo= {
	'toData': function() {
		var TSKs = new Array();
		$.each(this.opt.task, function(i,tsk){
			TSKs.push(tsk.options());
		});
		var data = {
			'title': this.title(),
			'area': this.area(),
			'from': this.opt.from,
			'to':  this.opt.to,
			'do':  this.opt.do,
			'unit':  this.opt.unit,
			'rgst': this.create(),
			'updt': this.updt(),
			'fin':  this.finish(),
			'start': this.start(),
			'status': this.opt.status,
			'comp': this.opt.comp,
			'task':TSKs, 
			'tags':this.tags(), // id配列
		};
		return data;
	},
	'aLabel': function() {
		var area= this.opt.area;
		return ((area== 'a1'|| area== 'a2') ? '<b class="i fa fa-rocket"></b>' : '')+ ((area== 'a1'|| area== 'a3') ? '<b　class="q fa fa-key"></b>' : '');
	},
	'tags': function() {
		return this.opt.tags;// id配列
	},
	'ok': function() {
		return (this.opt.comp== 100|| this.opt.status=='F');
	},
	'title': function(nwTtl) {
		if (typeof nwTtl!='undefined' && this.opt.title != nwTtl ) {
			this.opt.title= nwTtl;
			this.updt(new Date());
		}
		return this.opt.title;
	},
	'area': function(aName) {
		if (aName && this.opt.area!= aName) {
			this.opt.area= aName;
			this.updt(new Date());
		}
		return this.opt.area|| 'a4';
	},
	'create':function(){
		if(!this.opt.rgst){
			this.opt.rgst = new Date();
		}
		return this.opt.rgst;
	},
	'fin': function(tm){
		return this.finish(tm);
	},
	'finish': function(tm){
		if(typeof tm!='undefined'){
			// changed now!
			//this.updt( new Date());
			if(tm){
				this.opt.fin = new Date(tm);
			}else{
				// 戻す時もある(taskが増えた時)
				this.opt.fin = '';
			}
		}
		return this.opt.fin;
	},
	'start':function(tm){
		if(tm){
			this.opt.start = new Date(tm);
		}		
		if(this.ok() && !this.opt.start){
			this.opt.start = new Date();
		}
		return this.opt.start;
	},
	'updt':function(tm){
		if(tm){
			this.opt.updt = new Date(tm);
		}
		if(!this.opt.updt){
			this.opt.updt = this.create();
		}
		return this.opt.updt;
	},

	'checked':function(){
		var t = this.getTask();
		if(t.count==0){
			return 'x';
		}
		var lstup = 0;
		$.each(t, function(i,tsk){
			console.log(tsk);
			if(lstup<tsk.finish()){
				lstup = tsk.finish();
			}
		});
		//console.log(lstup);
		if(!lstup) return 'x';
		return lstup.ymd();
	},
	
	'id': function(newId) {
		if (newId) {
			this.opt.id= newId;
		}
		return this.opt.id|| '';
	},
	'do':function(vl){
		if (typeof vl !='undefined') {
			this.opt.do= vl;
		}
		return this.opt.do || '';
	},
	'doWeek':function(vl){
		var ret = this.do();
		if(!ret){return ret;} 
		// 日付の時
		if(ret.substr(0,1)=='D'){
		 	var dd = new Date(ret.substr(1,4), ret.substr(5,2)-1, ret.substr(7,2));
		 	ret = dd.wkID();
		}
		return ret;
	},
	'unitTime':function(vl){
		if (typeof vl !='undefined') {
			this.opt.unit= vl;
		}
		return this.opt.unit || 15;
	},
	
	'getTask': function() {
		return this.opt.task|| new Array();
	},
	'task': function() {
		var ret= new Array();
		var ckd= 0;
		//@todo 中間形表現形式　→　そのままつかってもよくない？
		$(this.opt.task).each(function(i, tsk) {
			ckd+= (tsk.ok() ? 1 : 0 );
			ret.push({
				'id':tsk.idFull(),
				'chk': tsk.ok() ? 'OK' : '',
				'txt': tsk.text(),
			});
		});
		if (ret.length) {
			this.opt.comp= Math.round(100* ckd/ ret.length, 0);
		}
		return ret;
	},
	'status':function(newStat){
		if (newStat) {
			this.opt.status= newStat;
		}
		return this.opt.status|| '0';
	},
	'getNewId': function() {
		var nn= this.opt.task.length;
		var id= '';
		while (true) {
			id= 'ts'+ nn;
			$.each(this.opt.task, function(i, tsk) {
				if (tsk.id()== id) {
					nn++;
					id= '';
					return false;
				}
			});
			if (id) {
				break;
			}
		}
		return id;
	},
	'addTask': function(tsk) {
		if ( typeof tsk!= 'object') {
			tsk= this.txtToTask(tsk);
			tsk.id(this.getNewId());
		}else if(typeof tsk.id !='function') {
			tsk = new Task(tsk, this);
		}else{
			this.updt(new Date());
		}
		this.tHash[tsk.id()]= this.opt.task.length;
		this.opt.task.push(tsk);
		this.chkStat();
	},
	
	'todoStat': function() {
		var cnt= 0;
		$(his.opt.task).each
		return t.length|| 0;
	},
	'limit': function() {
		return '';
		//'hh:mm';
	},
	'find': function(id) {
		var IDs= (''+ id).split("_");

		if (IDs.length!= 2|| IDs[0]!= this.id()) {
			return null;
		}
		if ( typeof this.tHash[IDs[1]]!= undefined) {
			return this.opt.task[this.tHash[IDs[1]]];
		}
		return null;
	},
	// 先送り（順番を最後に）
	'lateTask': function(id){
		var tsk = this.removeTask(id);
		if(!tsk){ return false; }
		this.addTask(tsk);
	},
	// 順番を最初
	'fstTask': function(id){
		console.log("fst:" +id);
		var tsk = this.removeTask(id);
		if (tsk) {
			this.opt.task.unshift(tsk);
			var SLF= this;
			$.each(this.opt.task, function(i, T) {
				SLF.tHash[T.id()]= i;
			});
		}
		this.updt(new Date());
		this.chkStat();
		return tsk;
	},
	
	// util:: txt -> Tasc obj
	'txtToTask': function(txt) {
		var stat= '1';
		if (txt.substr(0, 3)== '[v]') {
			stat= 'F';
			txt= txt.substr(3)
		}
		if (txt.substr(0, 2)== '[]') {
			txt= txt.substr(2)
		}
		if (txt.substr(0, 3)== '[_]') {
			txt= txt.substr(3)
		}
		return new Task({
			'status': stat,
			'title': txt
		}, this);
	},

	'removeTask': function(id) {
		var tsk= this.find(id);
		if (!tsk) {return; }
		
		var id= tsk.id();
		//タスク配列の圧縮
		var nwTSKs= (this.opt.task).filter(function(T){ return T.id()!= id });
		this.opt.task= nwTSKs;
		// 逆引き配列の圧縮
		var nwHs = new Array();
		$.each(nwTSKs, function(i, T){ nwHs[T.id()] = i;});
		this.tHash = nwHs;
		this.updt(new Date());
		this.chkStat();
		return tsk;
	},
	
	'cntTsk': function(){
		var ttl = this.opt.task.length;
		var ckd =0;
		var doTody =0;
		var TDY= new Date().ymd();
		$(this.opt.task).each(function(i, tsk) {
			ckd+= (tsk.ok() ? 1 : 0 );
			var fin= tsk.finish();
			doTody+= (((fin!=''? fin.ymd(): '') == TDY) ? 1 : 0 );
		});
		return {
			'total':ttl,
			'ok': ckd,
			'todo':ttl- ckd,
			'tdy': doTody
		};
	},

	'addTag':function(TG){
		var tgID = (TG.id)? TG.id(): TG; 
		if(tgID){
			if($.inArray(tgID, this.opt.tags)==-1){
				this.opt.tags.push(tgID);
			}
		}
	},
	'hasTag': function(tgID){
		return (!tgID? false: ($.inArray(tgID, this.opt.tags)!=-1));
	},
	'removeTag':function(TG){
		if(typeof TG !=='object'){
			TG = MEMO.getTag(''+TG);
		}
		if(TG.id){
			var ckID = TG.id();
			var tgs = new Array();
			$.each(this.opt.tags,function(i,tgID){
				if(tgID!=ckID){
					tgs.push(tgID);
				}
			});
			this.opt.tags = tgs;
		}
	},
	'chkStat': function(){
		var cnt = this.cntTsk();
		if(cnt.total==0){
//			return ;
		}else{
			this.opt.comp = Math.round(cnt.ok/cnt.total*100,0);
		}
		if(cnt.total == cnt.ok ){
			if(!this.opt.fin){
				this.finish(this.updt());
			}
			if(this.opt.status!='F'){
				this.status('F');
			}

		}else{
			if(this.opt.fin){
				this.opt.fin = '';
			}
			var stat = (cnt.ok==0)? '0': '1';
			if(this.opt.status!=stat){
				this.status(stat);
			}
		}

		// 戻し
		if(this.opt.stat!='F' || this.opt.fin==''){
			var stat = (cnt.ok==0)? '0': '1';
			this.opt.stat = stat;
		}
	},
	// 進捗どうですか？
	'getProgress': function (){
		this.chkStat();
		var cnt= this.cntTsk();
		var stat = this.status();
		return {
			'create': '<i class="fa fa-sticky-note-o"></i> '+this.create().fuzzy(), 
			'updt' : '<i class="fa fa-pencil"></i> '+this.updt().fuzzy(),
			'stat': stat,
			'ok': cnt.ok,
			'cnt': cnt.todo,
			'tdy': cnt.tdy,
			'total': cnt.total,
			'finish': (stat!='F'? '': '<i class="fa fa-flag-checkered"></i>' + this.fin().fuzzy()), 
			'did': ''
				+'<i class="fa fa-check-square-o"></i> '+(cnt.ok)
				+': <i class="fa fa-square-o"></i> '+ (cnt.todo)  ,
			/*''+ ((cnt.ok== 0)? '':'<i class="fa fa-square"></i> '+ cnt.todo +'/')
				+'<i class="fa check-square-o"></i> '+ cnt.ok*/
		}
		
	},

	
	'getEstimate': function(){
		var cnt= this.cntTsk();
		var u = 1*this.unitTime();
		return {
			'todo' : cnt.todo*u /60 ,
			'tdy'  : cnt.tdy*u /60 ,
			'total': cnt.total*u/60 
		}		
	},
	
	'like': function(ndl){
		if(this.title().indexOf(ndl)>-1){
			return true;
		}
		var Tasks = this.task();
		var cnt =0;
		$.each(Tasks, function(i, tsk){
			if(tsk.chk=='ok'){
				return true; // skip 
			}
			if(tsk.txt.indexOf(ndl)>-1){
				cnt ++;
				return false;
			}
		});
		return (cnt>0);
	}
};

//--------------------------------------
var Task= function(opt, parent) {
	this.opt= $.extend({
		'title': '',
		'rgst': '',
		'fin': '',
		'status': 1,
	}, opt);
	if (!this.opt.rgst) {
		this.opt.rgst= new Date();
	}
	if (this.ok()&& !this.opt.fin) {
		this.opt.fin= new Date();
	}
	if(this.opt.rgst){
		this.opt.rgst = new Date(this.opt.rgst);
	}	
	if(this.opt.updt){
		this.opt.updt = new Date(this.opt.updt);
	}	
	if(this.opt.fin){
		this.opt.fin = new Date(this.opt.fin);
	}	
	this.parent= parent;
};
var protoTask= {
	'toString': function() {
		return (this.ok() ? '[v]' : '[]')+ this.opt.title;
	},
	'options':function(){
		return this.opt;		
	},
	'ok': function(tf) {
		if ( typeof tf!= 'undefined') {
			this.opt.status= (tf) ? 'F' : '1';
			this.updt(new Date());
		}
		return (this.opt.status== 'F');
	},
	'icon': function(tf) {
		return (this.opt.status== 'F')? '<i class="fa fa-check-square-o"></i>' : '<i class="fa fa-square-o"></i>';
	},
	
	'idFull': function() {
		return (this.parent ? this.parent.id()+ '_' : 'new_' )+ this.opt.id;
	},
	'id': function(nwId) {
		if (nwId) {
			this.opt.id= nwId;
		}
		return this.opt.id;
	},
	'title': function(nwText) {
		if (nwText) {
			this.opt.title= nwText;
		}
		return this.opt.title;
	},
	// @todo 廃止
	'text': function(nwText) {
		if (nwText) {
			this.opt.title= nwText;
		}
		return this.opt.title;
	},
	'create':function(tm){
		if(tm){
			this.opt.updt = new Date(tm);
		}
		if(!this.opt.rgst){
			this.opt.rgst = new Date();
		}
		return this.opt.rgst;
	},
	'finish':function(tm){
		if(tm){
			this.opt.updt = new Date(tm);
		}
		if(this.ok() && !this.opt.fin){
			this.opt.fin = new Date();
		}
		return this.opt.fin;
	},
	'updt':function(tm){
		if(tm){
			this.opt.updt = new Date(tm);
			if(this.parent && this.parent.updt){
				this.parent.updt(new Date());
			}
		}		
		if(!this.opt.updt){
			this.opt.updt = this.create();
		}
		return this.opt.updt;
	},
	'status': function(nwStat) {
		if (nwStat) {
			this.opt.status= nwStat;
		}
		return this.opt.status;
	},
};

//--------------------------------------
var Tag= function(opt) {
	this.opt= $.extend({
		'idx': 0,
		'id': '',
		'label': '',
		'rgst': new Date(),
	}, opt);
};
var protoTag= {
	'id': function(vl) {
		if (vl) {
			this.opt.id = vl;
		}
		return this.opt.id || '';
	},
	'idx': function(vl) {
		if (vl) {
			this.opt.idx = vl;
		}
		return this.opt.idx || 0;
	},
	'label': function(vl) {
		if (vl) {
			this.opt.label = vl;
		}
		return this.opt.label;
	},
	'toData':function(){
		return this.opt;
	},
};

function demodata() {
	return new Array(
		
		new ToDo({
			'title':'赤のTODO表示',
			'area':'a1',
			'tag': new Array('tg0001'),
			'task':[
				'[v]先頭のカッコがチェック状態',
				'[v]残チェック　終わってたらコンプ100',
				'[]□クリックで済に更新',
				'[]▼クリックで表示順末尾に送る',
				'[]更新日も（バックで）更新',
			],
		}),

		new ToDo({
			'title':'タグ関連',
			'area':'a1',
			'tag': new Array('tg0001'),
			'task':[
				'[]',
			],
		}),

		new ToDo({
			'title':'LocalStoarageへ保存',
			'area':'a1',
			'tag': new Array('tg0001'),
			'task':[
				'[]LS 保存',
				'[]LS 復帰',
				'[]LS クリア',
			],
		}),


		new ToDo({
			'title':'エディタの表示',
			'area':'a1',
			'tag': new Array('tg0001'),
			'task':[
				'[v]htmlにID→元タスクにバインド',
				'[v]id(仮)stack全体数で管理',
				'[v]エディタにタスクを転記',
				'[v]エディタからタスクを修正',
				'[v]修正結果を付箋に反映',
				
			]
		}),



		new ToDo({
			'title':'急マーク透かし・重要マーク透かし',
			'comp':100,
			'area':'a2',
			'tag': new Array('tg0001')
		})					
		,new ToDo({
			'title':'クリックしたらエディタを表示',
			'comp':100,
			'area':'a2',
			'tag': new Array('tg0001')
		})					
		,new ToDo({
			'title':'赤だけtodoが見えるように',
			'comp':100,
			'area':'a2',
			'tag': new Array('tg0001')
		})
	
		,new ToDo({
			'title':'ワイプボタンで済は消す',
			'area':'a2',
			'tag': new Array('tg0001'),
			'task':[
				'[v]進行中 ボタン設置',
				'[]済表示のトグルに',
			],			
		})
		
		,new ToDo({
			'title':'並べ替え：進捗順',
			'area':'a2',
			'tag': new Array('tg0001'),
			'task':[
				"[v]ボタンはタスクバー",
				"[_]デフォルトは更新順DESC",
				"[_]comp　進捗順DESC",
			]
			
		})
		
			
		,new ToDo({
			'title':'自動分割　付箋は250~300px程度に',
			'area':'a3',
			'tag': new Array('tg0001')
		})					
		,new ToDo({
			'title':'タグリストの表示',
			'area':'a3',
			'tag': new Array('tg0001'),
			'task':[
				'[]tag ｵﾌﾞｼﾞｪｸﾄ化',
				'[]array からオブジェクト名を参照',
				'[]右下を更新',
				'[]',
				'[]',
			],
		})


		,new ToDo({
			'title':'リミット表示',
			'area':'a3',
			'tag': new Array('tg0001'),
			'task':[
				"[_]表示先は赤だけ",
				"[_]過ぎているときは炎上！",
				"[_]危険なときにカウントダウン表示（１H以内）",
				"[_]1日以内は残り時間表示",
			]
		})					
		,new ToDo({
			'title':'view：切り替え',
			'area':'a3',
			'comp':100,
			'tag': new Array('tg0001'),
			'task':[
				'[]リストビュー(色ごとに整列)',
				'[]タイムラインビュー(時系列表示)',
				'[]現在ビューを記憶',
				'[]エディタ閉じるときにビューを更新する'
			]
		})					
		,new ToDo({
			'title':'エディタバリデーション',
			'area':'a3',
			'task':[
				'[]色の未指定は警告',
				'[]多すぎるタスクは警告(20)'
			]		
		})

		,new ToDo({
			'title':'右下のタグをタグ型にする',
			'area':'a3',
			'tag': new Array('tg0001'),
			'task':[
				'[v]test',
				'[v]test',
			],
		})					

		,new ToDo({
			'title':'右下はランダム配置',
			'area':'a4',
			'tag': new Array('tg0001'),
			'task':[
				"[_]gridやめる",
				"[_]ratete も使って乱雑感出す",
				"[_]配置も重なりもランダムに",
			]
		})
		,new ToDo({
			'title':'',
			'area':'a4',
			'tag': new Array('tg0001'),
			'task':[
				''
			
			]
		})					
		,new ToDo({
			'title':'',
			'area':'a4',
			'tag': new Array('tg0001'),
			'task':[
				''
			
			]
		})					
		,new ToDo({
			'title':'',
			'area':'a4',
			'tag': new Array('tg0001'),
			'task':[
				''
			
			]
		})					
		,new ToDo({
			'title':'',
			'area':'a4',
			'tag': new Array('tg0001'),
			'task':[
				''
			
			]
		})					
		,new ToDo({
			'title':'',
			'area':'a4',
			'tag': new Array('tg0001'),
			'task':[
				''
			
			]
		})					
		,new ToDo({
			'title':'',
			'area':'a4',
			'tag': new Array('tg0001'),
			'task':[
				''
			
			]
		})					
		,new ToDo({
			'title':'',
			'area':'a4',
			'tag': new Array('tg0001'),
			'task':[
				''
			
			]
		})					
		
	);
};