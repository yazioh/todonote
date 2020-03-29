//----------------------------
$(window).on('load', function() {
	// おまじない（urlバー消し）
	setTimeout(scrollTo(0, 1), 10);
});
function is(test){
	return (typeof test =='undefined'|| test==='' || test===false)? false: true;
}
//----------------------------
function ScreenWatcher(fnkCallBack){
	this.wH = 0;
	this.wW = 0;
	this.rMOde = '';
	this.onChange();
	this.callBack ='';
	if(typeof fnkCallBack=='function'){
		this.callBack = fnkCallBack;
	}
	var SLF = this;
	$(window).on('resize', function() {
		SLF.onChange();
	});
}
ScreenWatcher.prototype.onChange = function(){
	var wH= window.innerHeight;
	var wW= window.innerWidth;
	var mode= (wH < (wW-80))? 'landscape':'portrait';
	if(this.rMode != mode){
		$('body').removeClass(this.rMode).addClass(mode);
		this.rMode = mode;
	}
	if(this.callBack){
		this.callBack();
	};
}
//----------------------------
// drag & drop用のおまじない
$.event.props.push('dataTransfer');
//----------------------------
// 時刻関連操作用のための定数 (ms)
var _sec  = 1000;
var _min  = _sec * 60;
var _hour = _min * 60;
var _day  = _hour * 24;
var _week = _day * 7;
//----------------------------
Date.prototype.fuzzy = function (){
	var now = new Date().getTime();	
	var df = now - this.getTime();

	if(df<_min*2){
		return 'now';
	}
	if(df<_hour){
		return Math.ceil(df/(_min*5),0)*5 +'m';
	}
	if(df<_hour*12){
		return Math.ceil(df/(_hour/2),0)/2 +'h';
	}
	if(df<_day*3){
		return Math.round(df/(_hour*12),0)/2 +'d';
	}
/*
	if(df<_day*10){
		return Math.ceil(df/(_day),0)+'d';
	}
*/
	if(df<_week*4){
		return Math.round(df/(_week),0) +'w';
	}
	
	if(df<_day*180){
		return (this.getMonth()+1)+'/'+this.getDate();
	}	
	return this.getFullYear()+'/'+(this.getMonth()+1);
}
Date.prototype.gengou_table = [{
	date : new Date(1989, 1 - 1, 8),
	alp : 'H',
	knj : "平成"
}, {
	date : new Date(1926, 12 - 1, 25),
	alp : 'S',
	knj : "昭和"
}, {
	date : new Date(1912, 7 - 1, 30),
	alp : 'T',
	knj : "大正"
}, {
	date : new Date(1868, 9 - 1, 8),
	alp : 'M',
	knj : "明治"
}];
Date.prototype.getGengoY = function(chk) {
	var ret = '';
	$(this.gengou_table).each(function(i, dt) {

		if (chk.getTime() >= dt.date.getTime()) {
			yy = chk.getFullYear() - dt.date.getFullYear() + 1;
			ret = dt.alp + yy;
			return false;
		}
	});
	return (ret) ? ret : chk.getFullYear();
};
// 日本人なら漢字表示
Date.prototype.getDayKnj = function(){
	return ['日','月','火','水','木','金','土'][this.getDay()];
}
// 年月日 yyyymmdd 8桁で返す
Date.prototype.ymd = function(){
	return ''+this.getFullYear()+ ('0'+ (1+this.getMonth())).substr(-2)+ ('0'+this.getDate()).substr(-2) ;
};
// 月日　mm/dd 5桁
Date.prototype.m_d = function(){
	return ''+('0'+ (1+this.getMonth())).substr(-2)+'/'+ ('0'+this.getDate()).substr(-2) ;
};
// 月日　m_d の０抜き
Date.prototype.n_d = function(){
	return ''+(1+this.getMonth())+'/'+ this.getDate();
};

// 時刻表示 hh:ii 5桁
Date.prototype.hm = function(){
	return ''+('0'+ (this.getHours())).substr(-2)+":"+('0'+this.getMinutes()).substr(-2) ;
};
// 週の始まりの日
// @todo 月曜日からconf指定の曜日に
Date.prototype.wkStart = function(){
	var stW = (this.getDay()+ 6)% 7;
	return new Date(this.getTime() - stW*_day);
}
// weekID ※とどの週間予定につけるID
Date.prototype.wkID = function(def){
	def = def || 0;
	var SDay = new Date(this.wkStart().getTime() + def*_week);
	return 'W'+this.getFullYear()+('0'+ (1+SDay.getMonth())).substr(-2)+ ('0'+SDay.getDate()).substr(-2);
}
Date.prototype.wkInfo = function(def){
	def = (typeof def !=='undefined')? def : 0;
	var sDay = new Date(this.wkStart().getTime() + def*_week);
	var eDay = new Date(sDay.getTime() + 6*_day);

	// 水曜の所属判定
	var midDay = new Date(sDay.getTime()+2*_day);
	if(midDay.getMonth()==sDay.getMonth()){
		var x = Math.floor(sDay.getDate()/7) +1;
		lbl = (sDay.getMonth()+1)+'月'+ x +'週';
	}else {
		lbl = (midDay.getMonth()+1)+'月1週';
	}

	return {
		'start': sDay,
		'end' : eDay,
		'wkID': sDay.wkID(),
		'label': lbl
	}	
}

//----------------------------
var CAL= {
	'init': function($li, st) {
		var dt= new Date();
		var mn= '';
		$('.date', $li).each(function(i, spn) {
			$VW= $(spn);
			$VW.html("");

			var dt2= new Date();
			// @todo 月曜始まり
			dt2.setDate(dt.getDate()+ i-dt.getDay());
			var $dt = $('<b>'+dt2.getDate()+'</b>').addClass('wd'+ dt2.getDay());
			$VW.append($dt).removeClass('tdy');			
			if(dt.getDate() == dt2.getDate()){
				$VW.addClass("tdy");
			}

			var mntx= (mn!= dt2.getMonth()) ? dt2.getMonth()+ 1 : '';
			if(mntx!=mn){
				$VW.append('<i>'+mntx+'</i>');			
			}
			mn= dt2.getMonth();
		});
	}
};

//-----------------------------------------------------
/**
 * Storage wrapper
 */
var myLocalStorage= {
	'set': function(key, val) {
		localStorage[key]='';// 既存容量＋新容量でoverflow計算されるらしいので、一度リセットする
		localStorage[key]= JSON.stringify(val);
	},

	'get': function(key) {
		try {
			ret= JSON.parse(localStorage[key]);
			return ret;
		} catch(e) {
			return null;
		}

	},
	'unset': function(key) {
		localStorage.removeItem(key);
	},
	'clear': function() {
		localStorage.clear();
	},
	'isset': function(key) {
		return ( typeof localStorage[key]!= 'undefined');
	}
};
