/**
 * 絞込表示オブジェクト 
 */
var Filter = function(opt){
	this.opt= $.extend({
		'area': '',
		'tag': '',
		'name': '',
		'paw': '',
		'status': [],
		'today': '',
		'limit': {'from':'', 'to':''},
		'rgst': {'from':'', 'to':''},
		'updt': {'from':'', 'to':''},
		'fin': {'from':'', 'to':''},
	}, opt);
	this.ORDER = Order.status; 
}

var protoFilter ={
	'clear':function(){
	},
	// r/w
	'cond':function(nm,vl){
		var NMs = nm.split("/");
		if(typeof vl!='undefined'){
			if(NMs.lenth==2){
				this.opt[NMs[0]][NMs[1]] = vl;
			}else{
				this.opt[nm]=vl; 
			}
		}
		if(NMs.lenth==2){
			return this.opt[NMs[0]][NMs[1]];
		}else{
			return this.opt[nm]; 
		}
	},
	
	'is': function(TD){
		var cndTdy = this.opt.today || '';
		if(cndTdy !=''){
			var tdy = new Date();
			var ymd = ''+ tdy.ymd();
			
			switch(cndTdy){
				case 'c': if(TD.create().ymd()  != ymd){ return false; } break;
				case 'u': if(TD.checked() != ymd){
					console.log( TD.checked() +"/"+ ymd)
					return false; } break;
				case 'd': if(TD.do()!='D'+ymd){	return false; } break;	
			}
		}

		if(this.opt.area){
			if(this.opt.area != TD.area()){
				return false;
			}
		}

		if(this.opt.tag){
			var tgID = this.opt.tag;
			if(!TD.hasTag(tgID)){
				return false;
			}
		}

		if(this.opt.status.length){
			if($.inArray(TD.status(), this.opt.status)==-1){
				return false;
			}
		}else{
		//	console.log(this.opt.status);
			// default 削除無視
			if(TD.status()=='X') return false;
		}

		return true;
	},
	// データのサブセットではなく、MEMO.TODOs の対象indexのみ配列で返す
	'find': function(){
		var RETs = new Array();
		var SLF = this;
		//RETs = MEMO.TODOs.filter(function(TD){ return SLF.is(TD); });
		$.each(MEMO.TODOs, function(i,TD){
			if(SLF.is(TD)){
				RETs.push(i);
			}	
		});
		RETs.sort(this.ORDER);
		return RETs;
	}
	
};

/**
 *　並べ替えメソッド 
 */

var Order = {
	'fin': function(a,b){
		var TDA = MEMO.TODOs[a];
		var TDB = MEMO.TODOs[b];
		var tmA= (TDA.finish? TDA.finish(): '-');
		var tmB= (TDB.finish? TDB.finish(): '-');
		if(tmA== '-'|| tmB== '-') return 0;
		return (tmA== tmpB)? 0 :(tmA>tmB? -1 : 1);
	},
	'updt': function(a,b){
		var TDA = MEMO.TODOs[a];
		var TDB = MEMO.TODOs[b];
		var tmA= (TDA.updt? TDA.updt(): '-');
		var tmB= (TDB.updt? TDB.updt(): '-');
		if(tmA=='-' || tmB =='-') return 0;
		return (tmA==tmB)? 0 :(tmA>tmB? -1 : 1);
	},
	'status': function(a,b){
		var TDA = MEMO.TODOs[a];
		var TDB = MEMO.TODOs[b];
		var tmA= ''+(TDA.status? TDA.status(): 'X');
		var tmB= ''+(TDB.status? TDB.status(): 'X');
		return (tmA==tmB)? Order.updt(a,b): (tmA>tmB? 1 : -1);
	},
	
	'task':{
		'updtDesc': function(T1,T2){return (T2.updt()>T1.updt()); },
		'updtAsc': function(T1,T2){return (T1.updt()>T2.updt()); }
	}
}
