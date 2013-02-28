if(typeof Pour == 'undefined'){
	var Pour = {};
}
Pour.Wiki = function(){
	this.done = function(){};
	if(arguments.length > 0){
		this.done = arguments[0];
	}
	this.init = function(){
		this.setting = $("<img/>")
			.attr("id",this._("prefix")+"xXxSetting")
			.css("position","absolute")
			.css("opacity","0")
			.css("cursor","pointer");
		if(this._("preview") != false){
			this.setting.attr("src",this._("baseDir")+"imgs/close.png");
		}else{
			this.setting.attr("src",this._("baseDir")+"imgs/gear.png");
		}
		$("body").append(this.setting);
		$(this.setting).on("click",$.proxy(function(event){
			if(this._("preview") != false){
				window.close();
				return false;
			}else{
				if (event.shiftKey){
					var container = [];
					var target = this.getContainer();
					target.each($.proxy(function(c){

						var t = $(target.get(c));
						if(typeof t.attr("id") != "undefined" && t.attr("id").indexOf(this._("prefix")) == 0){
							container.push(t.attr("id"));
						}else if(typeof t.attr("class") != "undefined" && t.attr("class").indexOf(this._("prefix")) == 0){
							container.push(target.get(c).attr("class"));
						}
					},this));
					window.location = this._("baseDir")+"progs/edit.php?c="+container.join(",");
				}
			}
		},this));
		$(this.setting).on("load",$.proxy(function(){
			var top = (this._("iconLocation").indexOf("top")==0)?"0px":"100%";
			var left = (this._("iconLocation").indexOf("left")+4==this._("iconLocation").length)?"0px":"100%";
			if(this._("iconLocation").indexOf("right")+5==this._("iconLocation").length){
				this.setting.css("top",top)
					.css("left",left)
					.css("margin-left",(-1*this.setting.width())+"px")
					.animate({opacity:'1'},500,'linear');
			}
			if(this._("iconLocation").indexOf("bottom")==0){
				this.setting.css("top",top)
					.css("left",left)
					.css("margin-top",-1*this.setting.height()+"px")
					.animate({opacity:'1'},500,'linear');
			}
		},this));
		this.pour();
	}

	this._ = function(key){
		if(typeof Pour.Conf[key] != "undefined"){
			return Pour.Conf[key];
		}else{
			return "";
		}
	}
	this.pour = function(key){
		var prefix = this._("prefix");
		var pagePourable = [];
		var dirPourable = [];
		this.globalStaticPourable = [];
		this.globalDynamicPourable = [];
		this.getContainer().each($.proxy(function(c) {
			var ele = $(this.getContainer().get(c));
			if(typeof ele.attr("id") != "undefined" && ele.attr("id").indexOf(prefix) == 0){
				var key = ele.attr("id");
			}else if(typeof ele.attr("class") != "undefined" && ele.attr("class").indexOf(prefix) == 0){
				var key = ele.attr("class");
			}else{
				console.error("Something wrong...");
				return;
			}
			if(key.indexOf(prefix+"-p-")==0){
				key = key.replace(new RegExp('^'+prefix+"-p-"), '');
				if(pagePourable.indexOf(key)<0){
					pagePourable.push(key);
				}
			}else if(key.indexOf(prefix+"-d-")==0){
				key = key.replace(new RegExp('^'+prefix+"-d-"), '');
				if(dirPourable.indexOf(key)<0){
					dirPourable.push(key);
				}
			}else if(key.indexOf(prefix+"-g-")==0){
				key = key.replace(new RegExp('^'+prefix+"-g-"), '');
				if(this.globalStaticPourable.indexOf(key)<0){
					this.globalStaticPourable.push(key);
				}
			}else if(key.indexOf(prefix+"-G-")==0){
				key = key.replace(new RegExp('^'+prefix+"-G-"), '');
				if(this.globalDynamicPourable.indexOf(key)<0){
					this.globalDynamicPourable.push(key);
				}
			}			
		},this));
		var page = this._("baseDir") + "docs/local" + $.url(window.href).attr('path');
		if(page.lastIndexOf("/") == page.length-1){
			page += this._("indexFileName") + ".txt";
		}else{
			page = page.replace(new RegExp("\.[a-zA-Z]{2,4}$"), '.txt');
		}
		var dir = this._("baseDir")+ "docs/local" + $.url(window.href).attr('directory') + ".txt";
		this.donePage = false;
		this.doneDir = false;
		//page
		if(this._("preview") != false){
			page = this._("preview");
		}
		$.ajax({
			type: "GET",
	  		url: page,
			dataType: "json",
			cache:false,
			success:$.proxy(function(pagePourable,json){
				if(typeof json["title"] != "undefined" && json["title"] != ""){
					document.title = json["title"] + " - " + document.title;
					$("#contents").html(json["contents"]);
				}
				if(typeof json["contents"] != "undefined" && json["contents"] != ""){
					$("#contents").html(json["contents"]);
				}
				if(typeof json["pourables"] != "undefined" && json["pourables"] != ""){
					var pourables = json["pourables"];
					for(var p in pagePourable){
						if(typeof pourables[pagePourable[p]] != "undefined"){
							$("#"+this._("prefix")+"-p-"+pagePourable[p]).html(pourables[pagePourable[p]]);
						}
					}
				}
				this.donePage = true;
				this.checkDone();
			},this,pagePourable),
			error:$.proxy(function(reuqest,textStatus, errorThrown){
				this.donePage = true;
				console.error("PourError("+JSON.stringify(textStatus)+"): cannot find the page file");
				if(this._("preview") != false){
					alert(":::PourWiki Critical ERROR!:::\n\nDatasource file for the preview has been deleted. Please close this window and click the preview button on the edit page again.");
				}
				this.checkDone();
			},this)
		});
		//direcotory
		$.ajax({
			type: "GET",
	  		url: dir,
			dataType: "json",
			cache:false,
			success:$.proxy(function(json){
				this.doneDir = true;
				this.checkDone();
			},this),
			error:$.proxy(function(json){
				this.doneDir = true;
				console.error("PourError("+JSON.stringify(textStatus)+"): cannot find the direcotry file");
				this.checkDone();
			},this)
		});
		//globalStatic
		this.doneGStatic = 0;
		for(var c = 0; c < this.globalStaticPourable.length; c++){
			var url = this._("baseDir") + "docs/global/" + this.globalStaticPourable[c]+".txt"
			$.ajax({
				type: "GET",
		  		url: url,
				dataType: "text",
				cache:false,
				success:$.proxy(function(key,data){
					console.info($("#"+this._("prefix")+"-g-"+key).size());
					$("#"+this._("prefix")+"-g-"+key+",."+this._("prefix")+"-g-"+key).html(data);
					this.doneGStatic++;
					this.checkDone();
				},this,this.globalStaticPourable[c]),
				error:$.proxy(function(reuqest,textStatus, errorThrown){
					this.doneGStatic++;
					console.error("PourError("+JSON.stringify(textStatus)+"): cannot find the Global Static file");
					this.checkDone();
				},this)
			});
		}
		//globalDynamic
		this.doneGDynamic = 0;
		for(var c = 0; c < this.globalDynamicPourable.length; c++){
			var url = this._("baseDir") + "docs/global/" + this.globalDynamicPourable[c]+".php"
			$.ajax({
				type: "GET",
		  		url: url,
				dataType: "text",
				cache:false,
				success:$.proxy(function(key,data){
					$("#"+this._("prefix")+"-G-"+key+",."+this._("prefix")+"-G-"+key).html(data);
					this.doneGDynamic++;
					this.checkDone();
				},this,this.globalDynamicPourable[c]),
				error:$.proxy(function(reuqest,textStatus, errorThrown){
					this.doneGDynamic++;
					console.error("PourError("+JSON.stringify(textStatus)+"): cannot find the Global Dynamic file: ");
					this.checkDone();
				},this)
			});
		}
	}
	this.checkDone = function(){
		if(this.donePage 
			&& this.doneDir 
			&& this.globalStaticPourable.length == this.doneGStatic 
			&& this.globalDynamicPourable.length == this.doneGDynamic)
		{
			this.done();
			return true;
		}else{
			return false;
		}
	}
	this.getContainer = function(){
		return $("div[id^='"+this._("prefix")+"'],span[id^='"+this._("prefix")+"'],div[class^='"+this._("prefix")+"'],span[class^='"+this._("prefix")+"']")
	}
	this.init(arguments);
}