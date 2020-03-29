var MEMO= MEMO|| {};
MEMO.vwGrid= function($VW) {
	this.$VW= $VW;
	//this.prototype= new View($VW);
};
$.extend(MEMO.vwGrid.prototype, {
	'name': 'vwGrid',
	'sideBar': ['mnTags','mnCond','mnTdy'], //mnOdr
	'init': function() {
		var SLF= this;
		this.clear();
		// ------------------------------------------
		this.$VW.on('click', "li.fusen", function() {
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
		// ------------------------------------------
		this.$VW.on('tap', "li.fusen", function() {
			var $TGT= $(this);
			if (!$TGT.hasClass("fusen")) {
				$TGT= $TGT.closest("li.fusen");
			}
			$TGT.addclass("selected");
			return false;
		});
		// ------------------------------------------

/*		
		this.$VW.on('taphold', "li.fusen", function() {
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
*/		
		// ------------------------------------------
		this.$VW.on('click', "#gridMain>li", function() {
			var $TD= $(this);
			var aName= ($TD.hasClass("a1") ? 'a1' : '')+ ($TD.hasClass("a2") ? 'a2' : '')+ ($TD.hasClass("a3") ? 'a3' : '')+ ($TD.hasClass("a4") ? 'a4' : '');
			var TD= new ToDo();
			TD.area(aName);
			MEMO.VIEWs['vwEdit'].load(TD);
			return false;
		});
		//
		
		// 付箋を動かす -------------------------------
		this.$VW.on('dragstart', '.fusen', function(ev) {
			MEMO.dragStart($(this));
		});
		this.$VW.on('dragend', '.fusen', function(ev) {
			var aName= SLF.getAreaName(MEMO.$tgtObj);
			if(aName){
				SLF.cngArea(MEMO.$drgObj, aName);
			}
			MEMO.dragEnd($(this));
			ev.preventDefault();
			return false;
		});
		// タグを受け取る -------------------------------
		var testFlg;
		this.$VW.on('dragenter', '.fusen', function(ev) {
			testFlg = true;
		});
		this.$VW.on('dragover', '.fusen', function(ev) {
			testFlg = false;
			if(MEMO.$drgObj && (MEMO.$drgObj.hasClass("tag") || MEMO.$drgObj.hasClass("fusen"))){
				ev.preventDefault();
				MEMO.dragOver($(this));
			}			
			return false;
		});
		this.$VW.on('dragleave', '.fusen', function(ev) {
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
		
		// 付箋を受け取る -------------------------------
		this.$VW.on('dragenter', '#gridMain>li', function(ev) {
			if(MEMO.$drgObj && MEMO.$drgObj.hasClass("fusen")){
				ev.preventDefault();
				MEMO.dragOver($(this));
			}
			return false;
		});
		this.$VW.on('dragleave', '#gridMain>li', function(ev) {
			ev.preventDefault()
			return false;
		});
		//------------------------------------------------

		// ソレは後回し
		this.$VW.on('click', 'button.LATE', function(ev) {
			var $CNT= $(this).closest(".todo");
			var tskId= $CNT.data("id");
			if (tskId) {
				var IDs= tskId.split('_');
				var TD= MEMO.getTODO(IDs[0]);
				if (TD) {
					TD.lateTask(tskId);
				}
			}
			SLF.render();
			return false;
		})

		// 済みました
		this.$VW.on('click', 'button.OK', function(ev) {
			var $CNT= $(this).closest(".todo");
			var tskId= $CNT.data("id");
			if (tskId) {
				var IDs= tskId.split('_');
				var TD= MEMO.getTODO(IDs[0]);
				if (TD) {
					var TSK= TD.find(tskId);
					TSK.ok(true);
					MEMO.saveData();
					SLF.render();
				}
			}
			return false;
		})
	},

	'show': function() {
		this.$VW.stop().hide(0);
		this.render();
		this.$VW.show(0);
	},
	'hide': function() {
		this.$VW.stop().hide(0);
	},
	'clear': function() {
		$("ul.todo", this.$VW).html("");
	},

	'render': function() {
		
		this.clear();
		var self= this;
		var html= {
			'a1': [],
			'a2': [],
			'a3': [],
			'a4': [],
		};
		var cnt= {
			'a1': 0,
			'a2': 0,
			'a3': 0,
			'a4': 0,
		};
		var tm= {
			'a1': 0,
			'a2': 0,
			'a3': 0,
			'a4': 0,
		};
		
		var FLT = MEMO.VIEWs['vwSideBar'].filter();
		var TODOs = FLT.find();
		
		if(TODOs.length){
			$.each(TODOs,function(i,no){
				var TD = MEMO.TODOs[no];
				var aName =TD.area(); 
				html[aName].push(self.fusen(TD));
				cnt[aName] ++;
				var ii = TD.getEstimate();
				tm[aName] +=ii.todo;
			});
		}
		
		$.each(html, function(aName, html) {
			$('.'+ aName+ ' ul.todo', self.$VW).html(html);
			$('.'+ aName+ ' .cnt b', self.$VW).text(cnt[aName]);
			$('.'+ aName+ ' .tm b', self.$VW).text(tm[aName].toFixed(1)+'h');
		});
		
		this.onResize();	
	},
	'onResize': function(){
		var ww= window.innerWidth;
		if(ww<640){
			$('.hurry .todo.grid',this.$VW).removeClass("div3 div2 div1").addClass("div1");
			$('.slow  .todo.grid',this.$VW).removeClass("div3 div2 div1").addClass("div1");
		} else if($("body").hasClass("portrait") || ww<880){
			$('.hurry .todo.grid',this.$VW).removeClass("div3 div2 div1").addClass("div1");
			$('.slow  .todo.grid',this.$VW).removeClass("div3 div2 div1").addClass("div2");
		}else{
			$('.hurry .todo.grid',this.$VW).removeClass("div3 div2 div1").addClass("div2");
			$('.slow  .todo.grid',this.$VW).removeClass("div3 div2 div1").addClass("div3");
		}
	},
	'fusen': function(TD) {
		var ar= TD.area();
		//console.log(tsk);

		var $li= $($('.template', this.$VW).html()).data('id', TD.id());
		$('.ttl', $li).html(TD.title());
		$('.limit', $li).html(TD.limit());
		
		var tgs = TD.tags();
		var lbl ='';
		$(tgs).each(function(n, tgID){
			var TG = MEMO.getTag(tgID); 
			if(TG){
				lbl += '<b class="tag">'+TG.label()+'</b>';
			}
		});

		$('.tags', $li).html(lbl);

		var info = TD.getProgress();
			var TSKs= TD.task();
			var tasks= '';

		$(TSKs).each(function(i, CK) {
			if (info.total && ar== 'a1') {
				switch (CK.chk) {
					case 'OK':
						tasks+= '<li class="OK">'+CK.txt+'</li>';
						break;
					default:
						tasks+= '<li class="todo" data-id="'+ CK.id+ '">'
						+ '<div class="grid"><button class="OK col1"><i class="fa fa-check"></i></button><p class="col10">'+
						 CK.txt+ '</p><button class="LATE col1"><i class="fa fa-angle-double-down"></i></button></div></li>';
				}
			} else {

				switch (CK.chk) {
					case 'OK':
						//tasks+= '<li class="OK">'+ CK.txt+ '</li>';
						break;
					default:
						tasks+= '<li>'+CK.txt+'</li>';
						
				}
				
			}
		});
		$('.check', $li).html(tasks);

		var updt = 
			'<span class="col4">'+info.create+'</span>'
			+'<span class="col4">'+info.updt+'</span>'
			+'<span class="col4 did">'+((info.fin)? + info.finfin : info.did) +'</span>'
		;
		updt = '<dl class="tm grid">'+updt+'</dl>';
		$('.date', $li).html(updt);

		$li.data('id', TD.id()).addClass(TD.ok() ? 'OK' : '');
		return $li;
	},

	// @todo data つけよう
	'getAreaName': function($td) {
		var aName= ($td.hasClass("a1") ? 'a1' : '')+ ($td.hasClass("a2") ? 'a2' : '')+ ($td.hasClass("a3") ? 'a3' : '')+ ($td.hasClass("a4") ? 'a4' : '');
		return aName;
	},

	'cngArea': function($liFsn, aName) {
		var tId= $liFsn.data("id")|| false;
		if (tId) {
			var TD= MEMO.getTODO(tId);
			if (TD&& TD.area) {
				TD.area(aName);
			}
		}
		MEMO.saveData();
		this.render();
	},
});
