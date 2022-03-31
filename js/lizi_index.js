$(function(){
	/*首页幻灯片效果 start*/
	$(".index-banner").slide({titCell:".triggers a",mainCell:".index-slide ul",autoPlay:true,titOnClassName:"current",effect:"fold"});
	/*首页幻灯片效果 end*/
	
	/*首页幻灯片效果 start*/
	$(".buy60s_main").slide({mainCell:"#buy60s_silde",nextCell:".buy60s_next",prevCell:".buy60s_prve",autoPage:true,effect:"left",vis:1,easing:"easeOutCirc"});
	/*首页幻灯片效果 end*/
	
	/*倒计时广告位鼠标移入效果 start*/
	$("#brand_temai li").on("mouseenter",function(){
		$(this).animate(1000,function(){
			$(this).addClass("ishover");
		})
	}).on("mouseleave",function(){
		$(this).animate(1000,function(){
			$(this).removeClass("ishover");
		})
	})
	/*倒计时广告位鼠标移入效果 end*/
	
	/*今日推荐商品鼠标移入效果 start*/
	$("#temai_list li").on("mouseenter",function(){
		$(this).animate(1000,function(){
			$(this).addClass("hover");
		})
	}).on("mouseleave",function(){
		$(this).animate(1000,function(){
			$(this).removeClass("hover");
		})
	})
	/*今日推荐商品鼠标移入效果 end*/
	
	/*首页倒计时广告 start*/
	setInterval(function(){
      $(".timer").each(function(){
        var obj = $(this);
        var endTime = new Date(parseInt(obj.attr('value')) * 1000);
		var show_day =  obj.attr('showday');
        var nowTime = new Date();
        var nMS=endTime.getTime() - nowTime.getTime() + 28800000;
        var myD=Math.floor(nMS/(1000 * 60 * 60 * 24));
		var myH_show=Math.floor(nMS/(1000*60*60) % 24);
        var myH=Math.floor(nMS/(1000*60*60));
        var myM=Math.floor(nMS/(1000*60)) % 60;
        var myS=Math.floor(nMS/1000) % 60;
        var myMS=Math.floor(nMS/100) % 10;
		var a = myH+myM+myS+myMS;
        if(a>0){
			if(show_day == 'show')
			{
				var str = '剩余'+myD+'天'+myH_show+'时'+myM+'分'+myS+'秒';
			}
			else
			{
				var str = '剩余'+myH+'时'+myM+'分'+myS+'秒';
			}
        }else{
			var str = "已结束！";	
		}
		obj.html(str);
      });
    }, 100);
	/*首页倒计时广告 end*/
})