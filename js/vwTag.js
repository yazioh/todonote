var MEMO= MEMO|| {};
MEMO.vwTag= function($VW) {
	this.$VW= $VW;
	//this.prototype= new View($VW);
};
var vwTagProto ={
	'name': 'vwTag',
	'sideBar': ['mnCond','mnTdy'], //mnOdr
	'init': function() {
		var SLF = this;
		// ------------------------------------------
		this.$VW.on('click', '.fusen', function() {
			var $TGT= $(this);
			if (!$TGT.hasClass("fusen")) {
				$TGT= $TGT.closest("li.fusen");
			}			
			var TD = MEMO.getTODO($(this).attr('id'));
			if (TD && TD.id) {
				MEMO.VIEWs['vwEdit'].load(TD);
			}
			return false;
		});
		// ------------------------------------------
		this.$VW.on('change', 'input', function() {
			var tgID = $(this).closest("li.tag").attr('id');
			var TG = MEMO.getTag(tgID);
			TG.label($(this).val());
			MEMO.saveTags();
			if(MEMO.ToolBar){
				MEMO.ToolBar.render();
			}
			return false;
		});
		// ------------------------------------------
		this.$VW.on('click', '.rmv', function() {

			var tgID = $(this).closest("li.tag").attr('id');
			//var TG = MEMO.getTag(tgID);
			if(tgID && MEMO.removeTag(tgID)){
				MEMO.saveTags();
				if(MEMO.ToolBar){
					MEMO.ToolBar.render();
				}
				SLF.render();
			}
			return false;
		});
		// ------------------------------------------
		// ------------------------------------------

	},
	'show': function() {
		this.$VW.stop().hide(0);
		this.$VW.show(0);
	},
	'hide': function() {
		this.$VW.stop().hide(0);
	},
	'clear': function() {
		$("#tags", this.$VW).html("");
	},

	'odrArea':function(a,b){
		var Ma = MEMO.TODOs[a];
		var Mb = MEMO.TODOs[b];
		var a1 =''+Ma.area();
		var a2 =''+Mb.area();
		return (a1!= a2)?((a1 < a2)? -1 : 1):
			((Ma.updt() < Mb.updt())? -1 : 1);
	},

	'render': function() {
		this.clear();
		var SLF = this;
		$TPLT = $($('.template', this.$VW));
		// 基本データ
		var TODOs = MEMO.ToolBar.filter().find();
		//--		

		var n = 0;
		$(MEMO.TAGs).each(function(i,TG){
			if(TG.id){
				++n;
				var tgID = TG.id();
				var $html = $($TPLT.html());
				$('input', $html).val(TG.label());
				$html.attr("id",tgID);

				var LST = TODOs.filter(function(tdNo){
					return (MEMO.TODOs[tdNo].hasTag(tgID));
				}).sort(SLF.odrArea);
				var cnt = {a1:0, a2:0, a3:0, a4:0 };
				if(LST.length){
					$(LST).each(function(i,tdNo){
						var TD = MEMO.TODOs[tdNo];
						cnt[TD.area()]++;
						$('.todo', $html).append( SLF.fusen(TD));
					});
					//$('.todo', $html).html(fsn);
				}
				$('.a1',$html).next('b').text(cnt['a1']);
				$('.a2',$html).next('b').text(cnt['a2']);
				$('.a3',$html).next('b').text(cnt['a3']);
				$('.a4',$html).next('b').text(cnt['a4']);
				$("#tags", this.$VW).append($html);
			}
		});
		
		$("#tags", this.$VW).css({'width':(n*320+1)+'px'})
		
	},

	'fusen': function(TD){
		if(!TD || !TD.id){ return ''; }
		
		var info = TD.getProgress();		
		var updt = 
			 '<span class="col">'+info.create+'</span>'
			+'<span class="col c">'+info.updt+'</span>'
			+'<span class="col did">'+((info.fin)? + info.finfin : info.did) +'</span>'
		;

		$tp = $($('.templateF', this.$VW).html());

		var tasks= '';
		var did ='';
		if (info.total) {
			var TSKs= TD.task();
			$(TSKs).each(function(i, CK) {
				switch (CK.chk) {
					case 'OK':
						did   += '<li class="OK"><p><i class="fa fa-check-square-o"></i> '+ CK.txt+ '<p></li>';
						break;

					default:
						tasks += '<li><p><i class="fa fa-square-o"></i> '+ CK.txt+ '&nbsp;</p></li>';
				}
			});
		}
		
		$tp.addClass( TD.area() ); // 付箋色
		$tp.attr({'id':TD.id()}); // 済表示
		if(TD.ok()){ 
			$tp.addClass('OK');
		};
		$('.ttl', $tp ).text(TD.title());
		$('.tm',  $tp ).html(updt);

		// 済んでるのは下に表示
		$('.check',$tp ).html('');
		$('.check',$tp ).append(tasks);
		$('.check',$tp ).append(did);
		return $tp;
	}

};
$.extend(MEMO.vwTag.prototype,vwTagProto ); 