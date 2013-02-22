if(typeof Pour == 'undefined'){
	var Pour = {};
}
Pour.Wiki = function(){
	var conf = Pour.Conf;
	var top = (conf["iconLocation"].indexOf("top")==0)?"0px":"100%";
	var left = (conf["iconLocation"].indexOf("left")+4==conf["iconLocation"].length)?"0px":"100%";
	this.setting = $("<img/>")
		.attr("id",this.prefix+"-x-Setting")
		.attr("src",conf["baseDir"]+"imgs/gear.png")
		.css("position","absolute")
		.css("top",top)
		.css("left",left);
	this.setting.on("load",function(){
		if(conf["iconLocation"].indexOf("right")+4==conf["iconLocation"].length){
			this.setting.css("margin-left",-1*this.setting.width()+"px");
		}
		if(conf["iconLocation"].indexOf("bottom")==0){
			this.setting.css("margin-top",-1*this.setting.width()+"px");
		}
	});
	$(document).append(this.setting);
}