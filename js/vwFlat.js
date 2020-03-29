var MEMO= MEMO|| {};
MEMO.vwFlat= function($VW) {
	this.$VW= $VW;
	//this.prototype= new View($VW);
};

	
	
var vwFlatProto = {
	'name': 'vwFlat',
	'sideBar': ['mnTags','mnCond','mnTdy'], //mnOdr
	'init': function() {
		this.clear();
		var SLF = this;


		this.$VW.on('click', "li.fusen", function(){
			var $TGT= $(this);
			if (!$TGT.hasClass("fusen")) {
				$TGT= $TGT.closest("li.fusen");
			}
			var id= $TGT.data("id");
			if (id) {
				MEMO.VIEWs['vwEdit'].load( MEMO.TODOs[MEMO.idHash[id]]);
			}
			return false;
		});
		
		var openNewEdit = function(){
			var aName = SLF.getAreaName($(this));
			var TD = new ToDo();
			TD.area(aName);
			MEMO.VIEWs['vwEdit'].load(TD);
			return false;
		};
		this.$VW.on('click', "th", openNewEdit);
		this.$VW.on('click', "td", openNewEdit);


		this.$VW.on('dragstart','.fusen', function(){ $(this).addClass("drg"); });
		this.$VW.on('dragend','.fusen', function(){ $(this).removeClass("drg"); });
		
		// 付箋の移動 ---------------------------------
		this.$VW.on('dragenter', 'td',function(ev){
			SLF.drgOver = $(this);
			return false;
		});
		this.$VW.on('dragend', 'td',function(ev){
			if(SLF.drgOver){
				var liFsn = $(ev.target);
				var aName = SLF.getAreaName(SLF.drgOver);
				SLF.cngArea(liFsn, aName);
				SLF.drgOver = null;
			}
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
	},
	// @todo data つけよう
	'getAreaName': function($td){
		var aName = ($td.hasClass("a1")? 'a1':'')
			+($td.hasClass("a2")? 'a2':'')
			+($td.hasClass("a3")? 'a3':'')
			+($td.hasClass("a4")? 'a4':'');
		return aName;		
	},
	
	'cngArea':function($liFsn, aName){
		var tId = $liFsn.data("id") || false;
		if(tId){
			var TD = MEMO.getTODO(tId);
			if(TD && TD.area){
				TD.area(aName);
			}
		}
		MEMO.saveData();		
		this.render();		
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

	
	'render': function(){
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
		var FLT = MEMO.VIEWs['vwSideBar'].filter();
		var TODOs = FLT.find();

		if(TODOs.length){
			$.each(TODOs,function(i,no){
				var TD = MEMO.TODOs[no];
				var aNaem =TD.area(); 
				html[aNaem].push(self.fusen(TD));
				cnt[aNaem] ++;
			});
		}
		
/*		
		$(MEMO.TODOs).each(function(i, TD) {
			var aNaem =TD.area(); 
			html[aNaem].push(self.fusen(TD));
			cnt[aNaem] ++;
		});
*/
		
		$.each(html,function(aName, html){
			$('td.'+ aName+ ' ul', self.$VW).append(html);
			$('th.'+ aName+ ' b', self.$VW).html('<i class="fa fa-sticky-note-o"></i> '+ cnt[aName]);
			
		});
		
	},


	'fusen': function(TD) {
		if(!TD || !TD.id){ return };

		var ar= TD.area();
		//console.log(tsk);

		var $li= $($('.template', this.$VW).html()).data('id',TD.id());
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
		if (info.total) {
			var TSKs= TD.task();
			var tasks= '';
			var did ='';
			$(TSKs).each(function(i, CK) {
				switch (CK.chk) {
					case 'OK':
						did+= '<li class="OK"><p><i class="fa fa-check-square-o"></i> '+ CK.txt+ '<p></li>';
						break;
					default:
						tasks+= '<li><p><i class="fa fa-square-o"></i> '+ CK.txt+ '&nbsp;</p></li>';
				}
			});

			var updt = 
				'<span class="col4">'+info.create+'</span>'
				+'<span class="col4">'+info.updt+'</span>'
				+'<span class="col4 did">'+((info.fin)? + info.finfin : info.did) +'</span>'
			;
			updt = '<dl class="tm grid">'+updt+'</dl>';
			
			$('.check', $li).html(tasks+did+updt);
		}
		$li.data('id', TD.id()).addClass(TD.ok() ? 'OK' : '');
		return $li;
	},
};
$.extend(MEMO.vwFlat.prototype, vwFlatProto); 