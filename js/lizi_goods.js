$(function(){
	$(".item-thumbs").slide({mainCell:".bd ul",autoPage:true,effect:"left",vis:5});

	$("#item-thumbs li a").click(function(){
		$("#item-thumbs li").removeClass("current");
		$(this).parent().addClass("current");
	})
	
	$("#membership,.membership_con").mouseenter(function(){
		$(".membership_con").show();
	})
	
	$("#membership,.membership_con").mouseleave(function(){
		$(".membership_con").hide();
	})
	
	$(".seemore_items").slide({mainCell:".bd ul",effect:"top",autoPage:true,scroll:3,vis:3});

	$("#skunum").on('click', 'span', function(e) {
		if ($(this).hasClass("add")) {
			countNum(1);
		} else {
			countNum(-1);
		}
		return false;
    });
	
	$(".sku_list a").click(function(){
		$(this).parent().find("a").removeClass("selected");
		$(this).addClass("selected");
		$(this).parent().find("input:radio").prop("checked",false);
		$(this).find("input:radio").prop("checked",true);
		changePrice();
	})
	
	$(".sku_list2").click(function(){
		$(this).parent().find("label").removeClass("selected");
		$(this).addClass("selected");
	})
	
	
	tabs_Top = $("#tabs_bar").offset().top;
	$(window).scroll(function(){		
		var c = $(window).scrollTop();
	
		if(c >= tabs_Top)
		{
			$(".tabs_bar").addClass("fixed").css({'position':'fixed'});
		}
		else
		{
			$(".tabs_bar").removeClass("fixed").css({'position':''});
		}
	})	
		
	$("#tabs_bar li").mouseenter(function(){
		$(this).animate(300,function(){
			$(this).addClass("hover");
		})	
	})
	
	$("#tabs_bar li").click(function(){
		$("#tabs_bar li").not($(this)).removeClass("current_select");
		$(this).addClass("current_select");
	})

	$(".pjxqitem").click(function(){
		$(".product_tabs .sectionbox:eq(0)").hide();
	})
	$(".spxqitem").click(function(){
		$(".product_tabs .sectionbox:eq(0)").show();
	})
	
	$("#taocan_tabs li").click(function(){
		$("#taocan_tabs li").removeClass("current");
		$(this).addClass("current");
		var i = $("#taocan_tabs li").index($(this));
		$("#taocan_panels .panel").hide();
		$("#taocan_panels .panel").eq(i).show();
	})
})


function countNum(i) {
	var $count_box = $("#skunum");
	var $input = $count_box.find('input');
	var num = $input.val();
    if (!$.isNumeric(num)) {
		alert("请您输入正确的购买数量!")
        $input.val('1');
        return;
	}
    num = parseInt(num) + i;
    switch (true) {
		case num == 0:
			$input.val('1');
			alert('您至少得购买1件商品！');
			break;
        default:
        	$input.val(num);
            break;
    }
	changePrice();
}

