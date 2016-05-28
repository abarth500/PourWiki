/*
 *  PourWiki [https://github.com/abarth500/PourWiki]
 *  Copyright (c) 2013 Shohei Yokoyama
 *
 *  This software is released under the MIT License.
 *  http://opensource.org/licenses/mit-license.php
 */
if(typeof Pour == 'undefined'){
	var Pour = {};
}
Pour.Wiki = function(){
	this.done = function(){};
	if(arguments.length > 0){
		this.done = arguments[0];
	}
	this.init = function(){
        if($('#pourSettingIcon').size()==0) {
            this.setting = $("<span/>")
                .attr("id",this._("prefix")+"xXxSetting")
                .css("position","absolute")
                .css("cursor","pointer")
                .css("padding","8px")
                .css("color",this._("iconColor"));
            if(this._("preview") != false){
                this.setting.attr("class","glyphicon glyphicon-remove");
            }else{
                this.setting.attr("class","glyphicon glyphicon-pencil");
            }
            console.log("Setting Icon Container Not Found",$('#pourSettingIcon'));
            var top = (this._("iconLocation").indexOf("top") == 0) ? "0px" : "100%";
            var left = (this._("iconLocation").indexOf("left") + 4 == this._("iconLocation").length) ? "0px" : "100%";
            if (this._("iconLocation").indexOf("right") + 5 == this._("iconLocation").length) {
                this.setting.css("top", top)
                    .css("left", left)
                    .css("margin-left", "-30px");
            }
            if (this._("iconLocation").indexOf("bottom") == 0) {
                this.setting.css("top", top)
                    .css("left", left)
                    .css("margin-top", "-30px");
            }
            $("body").append(this.setting);
        }else{
            this.setting = $("<span/>")
                .attr("id",this._("prefix")+"xXxSetting")
                .css("color",this._("iconColor"));
            if(this._("preview") != false){
                this.setting.attr("class","glyphicon glyphicon-remove");
            }else{
                this.setting.attr("class","glyphicon glyphicon-pencil");
            }
            $('#pourSettingIcon').append(this.setting);
        }
		$(this.setting).on("click",$.proxy(function(event){
            event.preventDefault();
			if(this._("preview") != false){
				window.close();
				return false;
			}else{
				if (event.shiftKey){
					var container = [];
					var target = this.getContainer();
					target.each($.proxy(function(c){
						var t = $(target.get(c));
						if(typeof t.attr("id") != "undefined" && t.attr("id").indexOf(this._("prefix")+"-") == 0){
							container.push(t.attr("id"));
						}else if(typeof t.attr("class") != "undefined" && t.attr("class").indexOf(this._("prefix")+"-") == 0){
							container.push(target.get(c).attr("class"));
						}
					},this));
					window.location = this._("baseDir")+"progs/edit.php?c="+container.join(",");
				}
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
		this.indexPage = false;
		this.pageTitle = "Here!";
		var pagePourable = [];
		var dirPourable = [];
		this.contents = "File Not Found!";
		this.directories = {};
		this.globalConstant = {};
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
		if(page.lastIndexOf("/") == page.length-1 ){
			page += this._("indexFileName") + ".txt";
			this.indexPage = true;
		}else if(page.split("/").pop().indexOf(".")==-1){
			page += "/" + this._("indexFileName") + ".txt";
			this.indexPage = true;
		}else{
			page = page.replace(new RegExp("\.[a-zA-Z]{2,4}$"), '.txt');
		}
		var dir = $.url(window.href).attr('directory').split('/');
		var dirs = [];
		var d = "";
		while(dir.length>0){
			if(dir.length == 1 && dir[0] == ""){
				break;
			}
			d += dir.shift() + "/";
			dirs.push( this._("baseDir")+ "docs/local" + d + ".txt");
		}
		var constant = this._("baseDir")+ "docs/constant.json";
		this.donePage = false;
		this.doneDir = dirs.length;
        this.doneParent = 0;
        this.parent = [];
		this.doneConstant = false;
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
					this.pageTitle = json["title"];
				}
				if(typeof json["contents"] != "undefined" && json["contents"] != ""){
					this.contents = json["contents"];
				}
				if(typeof json["pourables"] != "undefined" && json["pourables"] != ""){
					var pourables = json["pourables"];
					for(var p in pagePourable){
						if(typeof pourables[pagePourable[p]] != "undefined"){
							$("#"+this._("prefix")+"-p-"+pagePourable[p]).html(pourables[pagePourable[p]]);
						}
					}
				}
				if(typeof json["hidden"] != "undefined" && json["hidden"] != ""){
					var hidden = json["hidden"];
					for(var c in hidden){
						$("#"+hidden[c]).hide();
					}
				}
				if(typeof json['parent'] != "undefined" && json["parent"] != ""){
					var parents = json["parent"];
					this.doneParent = parents.length;
					for(var c in parents) {
                        var doc = parents[c]['page'].split('.');
                        doc.pop();
						$.ajax({
							type: "GET",
							url: this._("baseDir") + "docs/local" + $.url(window.href).attr('directory') + doc.join(".") +".txt",
							dataType: "json",
							cache: false,
							success: $.proxy(function (json) {
                                var qs = $.url(window.href).param();
                                var link = [];//;
                                for(var z in parents[c]['querystring']){
                                    if(qs.hasOwnProperty(parents[c]['querystring'][z])){
                                        link.push(parents[c]['querystring'][z]+"="+qs[parents[c]['querystring'][z]]);
                                    }
                                }
                                if(link.length > 0) {
                                    link = "?"+link.join("&");
                                }
                                this.parent.push({"title":json['title'],"href":parents[c]['page'] + link});
								this.doneParent--;
								this.checkDone();
							}, this),
							error: $.proxy(function (reuqest, textStatus, errorThrown) {
								this.donePage = true;
								this.contents = "There is currently no text in this page. You can edit this page.";
								console.error("PourError(" + JSON.stringify(textStatus) + "): cannot find the page file");
								if (this._("preview") != false) {
									alert(":::PourWiki Critical ERROR!:::\n\nDatasource file for the preview has been deleted. Please close this window and click the preview button on the edit page again.");
								}
								this.doneParent--;
								this.checkDone();
							}, this)
						});
					}
				}
				this.donePage = true;
				this.checkDone();
			},this,pagePourable),
			error:$.proxy(function(reuqest,textStatus, errorThrown){
				this.donePage = true;
				this.contents = "There is currently no text in this page. You can edit this page.";
				console.error("PourError("+JSON.stringify(textStatus)+"): cannot find the page file");
				if(this._("preview") != false){
					alert(":::PourWiki Critical ERROR!:::\n\nDatasource file for the preview has been deleted. Please close this window and click the preview button on the edit page again.");
				}
				this.checkDone();
			},this)
		});
		//direcotory
		for(var c = 0; c < dirs.length; c++){
			$.ajax({
				type: "GET",
		  		url: dirs[c],
				dataType: "json",
				cache:false,
				success:$.proxy(function(c,json){
					this.directories[c] = json;
					this.doneDir--;
					this.checkDone();
				},this,c),
				error:$.proxy(function(c,reuqest,textStatus, errorThrown){
					this.directories[c] = {"title":"Unknown"};
					this.doneDir--;
					console.error("PourError("+JSON.stringify(textStatus)+"): cannot find the direcotry file");
					this.checkDone();
				},this,c)
			});
		}
		//constant
		$.ajax({
			type: "GET",
	  		url: constant,
			dataType: "json",
			cache:false,
			success:$.proxy(function(json){
				this.globalConstant = json;
				this.doneConstant = true;
				this.checkDone();
			},this),
			error:$.proxy(function(reuqest,textStatus, errorThrown){
				this.doneConstant = true;
				console.error("PourError("+JSON.stringify(textStatus)+"): cannot find the constant file");
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
	this.rendering = function(){
		//breadcrumb
		var depth = Object.keys(this.directories).length;
		var path = [];
		for(var c = 0; c < depth-1; c++){
			path.push("..")
		}
		if(this.indexPage) {
			if(this.parent.length>0){
				console.error("Index Page does not have a parent page chain.");
			}
			for(var c = 0; c < depth; c++){
				var a =$("<li/>").appendTo($(".breadcrumb"));
				if(c == depth-1){
					a.html(this.directories[c]["title"]).attr("class","active");
				}else{
					a.html('<a href="./'+path.join("/")+(path.length==0?"":"/")+'">'+this.directories[c]["title"]+'</a>');
				}
				path.pop();
			}
		}else{
			for(var c = 0; c < depth; c++){
				var a =$("<li/>").appendTo($(".breadcrumb"));
				a.html('<a href="./'+path.join("/")+(path.length==0?"":"/")+'">'+this.directories[c]["title"]+'</a>'));
				path.pop();
			}
			for(var c = 0; c < this.parent.length; c++){
				var a =$("<li/>").appendTo($(".breadcrumb"));
				a.html('<a href="'+this.parent[c]["href"]+'">'+this.parent[c]["title"]+"</a>"));
			}
			var a =$("<li/>").appendTo($(".breadcrumb"));
			if(this.indexPage){
				a.attr("class","active").html(this.directories[c]["title"]));
			}else{
				a.attr("class","active").html(this.pageTitle));
			}
		}

		//page
		this.contents = "<h1>" + this.pageTitle + "</h1><p>" + this.contents;
		var contents = this.contents;
		var constant = contents.match(/\{\{[^\}]*\}\}/g);
		if(constant != null){
			for(var c = 0;c < constant.length; c++){
				var key = constant[c].toString().slice(2,-2);
				var mode = key.split(":");
				var replace = "";
				switch(mode[0]){
					case "url":
						replace = '<a href="'+this.globalConstant[key]+'">'+mode[1]+'</a>';
						break;
					case "mail":
						replace = '<a href="mailto:'+this.globalConstant[key]+'">'+mode[1]+'</a>';
						break;
					default:
						replace = this.globalConstant[key]
				}
				contents = contents.replace(constant[c].toString(),replace);
			}
		}
		var link = contents.match(/\[\[[^\]]*\]\]/g);
		if(link != null){
			for(var c = 0;c < link.length; c++){
				var target = link[c].toString().slice(2,-2);
				var text = target.split(" ");
				target = text.shift();
				if(text.length > 0){
					text = text.join(" ");
				}else{
					text = target;
				}
				contents = contents.replace(link[c].toString(),'<a href="'+target+'">'+text+"</a>");
			}
		}
		var bold = contents.match(/\'\'\'[^\']*\'\'\'/g);
		if(bold != null){
			for(var c = 0;c < bold.length; c++){
				var target = bold[c].toString().slice(3,-3);
				contents = contents.replace(bold[c].toString(),"<strong>"+target+"</strong>");
			}
		}
		var italic = contents.match(/\'\'[^\']*\'\'/g);
		if(italic != null){
			for(var c = 0;c < italic.length; c++){
				var target = italic[c].toString().slice(2,-2);
				contents = contents.replace(italic[c].toString(),"<em>"+target+"</em>");
			}
		}
		var headding = contents.match(/\={2,6}[^\=]*\={2,6}/g);
		if(headding != null){
			for(var c = 0;c < headding.length; c++){
				var n = headding[c].toString().match(/^\=+[^\=]/)[0].toString().length - 1;
				var target = headding[c].toString().slice(n,-n);
				contents = contents.replace(headding[c].toString(),"<h"+(n)+">"+target+"</h"+(n)+">");
			}
		}
		var lines  = contents.split("\n");
		contents = "";
		var render = new Pour.Render();
		for(var c = 0; c < lines.length; c++){
			if($.inArray(lines[c].charAt(0),["*","#",";"," ","@"]) != -1){
				render.append(lines[c]);
			}else if(lines[c] == "" || lines[c] == "\r"){
				contents += render.pack();
				contents += "<br>";
			}else{
				contents += render.pack();
				contents += lines[c];
			}
		}
		contents += render.pack();
		$("#contents").html(contents);
	}
	this.checkDone = function(){
		if(this.donePage 
			&& this.doneDir == 0
			&& this.doneParent == 0
		    && this.doneConstant
			&& this.globalStaticPourable.length == this.doneGStatic 
			&& this.globalDynamicPourable.length == this.doneGDynamic)
		{
			this.rendering();
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

Pour.Render = function(){
	this.list = [];
	this.context = [];
	this.append = function(item){
		var c = item.match(/^[\*\#\; \@]+/);
		if(c!= null){
			c = c[0].toString();
			var text = item.slice(c.length);
			var lastContext = this.ajustContext(c);
			switch(lastContext){
				case "@":
					if(text.charAt(0)=="-"){
						text = "<tr><th>" + text.slice(1)
						                        .replace(/^\s+|\s+$/g, "")
						                        .replace(/( *\t+ *| {4,})/g,"\t")
						                        .split("\t").join('</th><th>') + "</th></tr>";
					}else{
						text = "<tr><td>" + text.replace(/^\s+|\s+$/g, "")
											    .replace(/( *\t+ *| {4,})/g,"\t")
						                        .split("\t").join('</td><td>') + "</td></tr>";
					}
					break;
				case " ":
					break;
				case "*":
					text = "<li>"+text+"</li>";
					break;
				case "#":
					text = "<li>"+text+"</li>";
					break;
				case ";":
					text = text.split(":");
					if(text.length>1){
						text = "<dt>"+text[0]+"</dt><dd>"+text[1]+"</dd>";
					}else{
						text = "<dd>"+text[0]+"</dd>";
					}
					break;
			}
			this.list.push(text);
		}
	}
	this.ajustContext = function(context){
		var c=0;
		for(; c < this.context.length; c++){
			if(c > context.length){
				this.close(this.context.length - context.length);
				break;
			}
			if(this.context[c] != context.charAt(c)){
				this.close(this.context.length - c);
				break;
			}
		}
		if(c <= context.length){
			this.open(context.slice(c));
		}
		return context.charAt(context.length-1);
	}
	this.open = function(context){
		for(var c = 0; c < context.length; c++){
			switch(context.charAt(c)){
				case "@":
					this.list.push('<table class="table table table-condensed table-bordered table-striped">');
					break;
				case " ":
					this.list.push("<pre>");
					break;
				case "*":
					this.list.push("<ul>");
					break;
				case "#":
					this.list.push("<ol>");
					break;
				case ";":
					this.list.push('<dl class="dl-horizontal">');
					break;
			}
			this.context.push(context.charAt(c));
		}
	}
	this.close = function(n){
		for(var c = 0; c < n; c++){
			switch(this.context.pop()){
				case "@":
					this.list.push("</table>");
					break;
				case " ":
					this.list.push("</pre>");
					break;
				case "*":
					this.list.push("</ul>");
					break;
				case "#":
					this.list.push("</ol>");
					break;
				case ";":
					this.list.push("</dl>");
					break;
			}
		}
	}
	this.pack = function(){
		if(this.list.length > 0){
			this.close(this.context.length);
			var rtn = this.list.join("\n");
			this.list = [];
			return rtn;
		}else{
			return "";
		}
	}
}