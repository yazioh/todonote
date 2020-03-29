var MEMO= MEMO|| {};
MEMO.vwSideBar= function($VW) {
	this.$VW= $VW;
	//this.prototype= new View($VW);
};
$.extend(MEMO.vwSideBar.prototype, {
	'name': 'vwGrid',
	'init': function() {
		var SLF= this;

		$("#mnView li").on('click', function() {
			if ($(this).hasClass("selected")) {
				return false;
			}
			//$("#mnView .selected").removeClass("selected");
			//$(this).addClass("selected");
			var nxtView= $(this).data("view");
			MEMO.currentView(nxtView);
			MEMO.saveConf();
			return false;
		});

		//---------------------
		this.$VW.on('click','li.new', function(ev) {
			var nm;
			if (nm= prompt("新しいタグ")) {
				MEMO.addTag(new Tag({
					'label': nm,
				}));
				MEMO.saveTags();
				SLF.render();
			}
			return false;
		});

		//---------------------
		this.$VW.on('click', '#mnOdr li', function(ev){
			if(!$(this).hasClass("selected")){
				$CNT = $(this).closest("ul");
				$(".selected", $CNT).removeClass("selected");
				$(this).addClass("selected");
			}
			SLF.setFilter();
			MEMO.currentView().render();
		});
		//---------------------
		this.$VW.on('click', '#mnCond li', function(ev){
			
			if($(this).hasClass("selected")){
				$(this).removeClass("selected");
			} else {
				$(this).addClass("selected");
			}
			SLF.setFilter();
			MEMO.currentView().render();
		});
		
		this.$VW.on('click', '#mnTdy li', function(ev){
			
			if($(this).hasClass("selected")){
				$(this).removeClass("selected");
			} else {
				// only 
				$('.selected', $(this).parent()).removeClass("selected");
				$(this).addClass("selected");
			}
			SLF.setFilter();
			MEMO.currentView().render();
		});
		
		//---------------------
		this.$VW.on('click', '#mnTags .tag', function(ev){
			$BTN = $(this).closest("li");
			if(!$BTN.hasClass("selected")){
				$CNT = $BTN.closest("ul");
				$(".selected", $CNT).removeClass("selected");
				$BTN.addClass("selected");
			}else{
				$BTN.removeClass("selected");
			}
			SLF.setFilter();
			MEMO.currentView().render();
		});
		
		//---------------------
		this.$VW.on('click', '#mnEdit li', function(ev){
			if(!MEMO.VIEWs['vwEdit'].showFlg){ return; }
			MEMO.VIEWs['vwEdit'].closeEnd();
		});
		
		//---------------------
		this.$VW.on('click', '#mnPaw li', function(ev){
			if($(this).hasClass("selected")){
				$(this).removeClass("selected");
			} else {
				$(this).addClass("selected");
			}
			SLF.setFilter();
			MEMO.currentView().render();
		});

		//---------------------
		this.render();
		this.setFilter();
	},
	
	'showMenu':function(){
		$('nav.hide', this.$VW).removeClass("hide");
	},

	'setFilter':function(){
		var SLF = this;

		this.FILTER = new Filter();
		$('#mnAct[class!="hide"] li.selected', this.$VW).each(function(i, li){
			var odr = $(li).data("odr");
			if(odr){
				this.FILTER.ORDER = Order[odr]; 
			}
		});
		$('#mnTags[class!="hide"] li.selected', this.$VW).each(function(i, li){
			var tgId = $(li).attr("id");
			if(tgId){
				SLF.FILTER.opt.tag = tgId; 
			}
		});
		
		var STATs = new Array();
		$('#mnCond[class!="hide"] li.selected', this.$VW).each(function(i, li){
			var stat= $(li).data("stat");
			if(typeof stat != 'undefined'){
				STATs.push(''+stat);
			}
		});
		if(STATs.length){
			SLF.FILTER.cond('status', STATs);
		}		
		
		$('#mnTdy[class!="hide"] li.selected', this.$VW).each(function(i, li){
			var tdy= $(li).data("tdy");
			if(typeof tdy != 'undefined'){
				SLF.FILTER.opt.today = tdy;
			} 
		});

		var paws = new Array();
		$('#mnPaw[class!="hide"] li.selected', this.$VW).each(function(i, li){
			var pw= $(li).data("paw");
			if(typeof pw != 'undefined'){
				paws.push(pw);
			} 
		});
		if(paws.length){
			SLF.FILTER.cond('paw', paws);
		}		
		//console.log(SLF.FILTER.cond('paw'));
		
		return SLF.FILTER;
	},
	
	'changeView':function(vwName){
		var $VW = this.$VW;

		$("#mnView li", $VW).each(function() {
			if ($(this).data("view")== vwName) {
				$(this).addClass("selected");
			} else {
				$(this).removeClass("selected");
			}
		});
		var sb = MEMO.currentView().sideBar;
		$(".filter", $VW).addClass("hide");
		$.each(sb, function(i,fltNm){
			$('#'+fltNm, $VW).removeClass("hide");
		});
		this.setFilter();
		//*/
		return false;
	},

	'setFiltersButton':function(vwName){
		var $VW = this.$VW;
		var vw = MEMO.VIEWs[vwName];
		if(!vw || !vw.sideBar){
			return false;
		}
		var sb = vw.sideBar;
		$(".filter", $VW).addClass("hide");
		$.each(sb, function(i,fltNm){
			$('#'+fltNm, $VW).removeClass("hide");
		});
		this.setFilter();
	},
	
	'filter':function(){
		return this.FILTER;
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
		var SLF= this;
		var html= '';

		$.each(MEMO.TAGs, function(i, TG) {
			html+= '<li id="'+ TG.id()+ '"><b class="tag" draggable="true">'+ TG.label()+ '</b></li>';
		});
		
		html+= '<li class="new">'
			+'<i class="fa fa-tag"></i> new</li>';
		$('.tags',this.$VW).html(html);
		
		// ドラッグドロップイベント
		this.$VW.on('dragstart', '.tag', function(ev) {
			MEMO.dragStart($(ev.currentTarget));
		});

		this.$VW.on('dragend', '.tag', function(ev) {
			if(MEMO.$drgObj){
				var $LI= $(MEMO.$drgObj).closest("li");
				var tagID= $LI.attr('id');
				var $TGT = MEMO.$tgtObj;

				//付箋にドロップされた（各画面共通動作）
				if ($TGT&& $TGT.hasClass("fusen")) {
					var tdID= $TGT.data("id");
					var TD= MEMO.getTODO(tdID);
					if (TD) {
						TD.addTag(tagID);
					}
					MEMO.currentView().render();
				}
				// 編集画面にドロップされた
				if ($TGT&& $TGT.hasClass("editor")) {
					var view = $($TGT.closest("section.page")).attr("id");
					if(view){
						MEMO.VIEWs[view].addTag(tagID, $TGT);
					}
				}
			}
			MEMO.dragEnd($(this));
			ev.preventDefault();
		});
				
	},
	
	// 削除済みを表示しているかどうか
	'isShowFinish': function(){
		return $.inArray('F', this.FILTER.cond('status'));
	},
	
}); 