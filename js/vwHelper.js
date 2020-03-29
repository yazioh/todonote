var MEMO= MEMO|| {};
MEMO.vwHelper= function($VW) {
	this.$VW= $VW;
	//this.prototype= new View($VW);
};

!function(){
	$.extend(MEMO.vwHelper.prototype, {
		'name': 'vwHelper',
		'sideBar': ['mnTags','mnCond','mnTdy'], //mnOdr
		'init': function() {
			
			this.$VW.on('click','.hepler', function(){
				
			});
		}
	});
}();
