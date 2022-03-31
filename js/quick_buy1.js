var selectedBonus    = 0;
var selectedIntegral = 0;
function getId(str)
{
	return document.getElementById(str);
}
function get_consignee_str()
{
	frm = document.forms['ECS_FORMQUICKBUY'];
	var obj = new Object;
	obj.country = frm.elements['country'].value;
	obj.province = frm.elements['province'].value;
	obj.city = frm.elements['city'].value;
	obj.district = frm.elements['district'].value;
	obj.shipping_id = (frm.elements['shipping']) ? frm.elements['shipping'].value:1;
   
	/*for (i = 0; i < frm.elements.length; i ++ )
	{
		if (frm.elements[i].name == 'shipping' && frm.elements[i].checked)
		{
		   obj.shipping_id = frm.elements[i].value;
		}
	 }*/
	 
	for (i = 0; i < frm.elements.length; i ++ )
	{
		if (frm.elements[i].name == 'payment' && frm.elements[i].checked)
		{
		   obj.pay_id = frm.elements[i].value;
		}
	 }
	return "&country="+obj.country+"&province="+obj.province+"&city="+obj.city+"&district="+obj.district+"&shipping_id="+obj.shipping_id+"&pay_id="+obj.pay_id;
}

function quick_to_cart(goods_id)
{
	var frm = document.forms['ECS_FORMQUICKBUY']
	var goods_number = frm.qty.value;	
	Ajax.call('quick_buy.php?step=quick_to_cart', "goods_id="+goods_id+"&goods_number="+goods_number+get_consignee_str()+"&attr="+getQuickSelectedAttributes(frm), quick_to_cartResponse, "POST", "JSON");
}

function quick_to_cart1(goods_id)
{
	var frm = document.forms['ECS_FORMQUICKBUY']
	var goods_number = frm.qty.value;
	var goods_id = frm.goods_id.value;
	Ajax.call('quick_buy.php?step=quick_to_cart', "goods_id="+goods_id+"&goods_number="+goods_number+get_consignee_str()+"&attr="+getQuickSelectedAttributes(frm), quick_to_cartResponse, "POST", "JSON");
}


function getQuickSelectedAttributes(formBuy)
{
  var spec_arr = new Array();
  var j = 0;
  for (i = 0; i < formBuy.elements.length; i ++ )
  {
    var prefix = formBuy.elements[i].name.substr(0, 5);
	
    if (prefix == 'spec_' && (
      ((formBuy.elements[i].type == 'radio' || formBuy.elements[i].type == 'checkbox') && formBuy.elements[i].checked) ||
      formBuy.elements[i].tagName == 'SELECT'))
    {
      spec_arr[j] = formBuy.elements[i].value;
	  	
      j++ ;
    }
  }
  return spec_arr;
  
}

function quick_to_cartResponse(result)
{
    if(result.error>0)
	{
       alert(result.message);
	}
	else
	{
		getId('shipping_list').innerHTML = result.shipping_list;
		//getId('payment_list').innerHTML = result.payment_list;
		getId('total_price').innerHTML = result.goods_price;
		document.ECS_FORMQUICKBUY.goods_id.value = result.goods_id;
		//getId('ECS_ORDERTOTAL').innerHTML = result.order_total;
	}
}

function selectShipping() 
{
	Ajax.call('quick_buy.php?step=validate_bonus', get_consignee_str(), orderShippingSelectedResponse, 'GET', 'JSON');
}

function orderShippingSelectedResponse(result)
{
	if(result.error)
	{
	   	
	}
	getId('shipping_list').innerHTML = result.shipping_list;
}


function changeIntegral_1(val)
{
  if (selectedIntegral == val)
  {
    return;
  }
  else
  {
    selectedIntegral = val;
  }
  Ajax.call('quick_buy.php?step=change_integral'+get_consignee_str(), 'points=' + val, changeIntegralResponse_1, 'GET', 'JSON');
}


function changeIntegralResponse_1(obj)
{
  if (obj.error)
  {
    try
    {
      document.getElementById('ECS_INTEGRAL_NOTICE').innerHTML = obj.error;
      document.getElementById('ECS_INTEGRAL').value = '0';
      document.getElementById('ECS_INTEGRAL').focus();
    }
    catch (ex) { }
  }
  else
  {
    try
    {
      document.getElementById('ECS_INTEGRAL_NOTICE').innerHTML = '';
    }
    catch (ex) { }
	
	getId('ECS_ORDERTOTAL').innerHTML = obj.content;
	
  }
}



function changeBonus_1(val)
{
  if (selectedBonus == val)
  {
    return;
  }
  else
  {
    selectedBonus = val;
  }

  Ajax.call('quick_buy.php?step=change_bonus', 'bonus=' + val+get_consignee_str(), changeBonusResponse_1, 'GET', 'JSON');
}


function changeBonusResponse_1(obj)
{
  if (obj.error)
  {
    alert(obj.error);

    try
    {
      document.getElementById('ECS_BONUS').value = '0';
    }
    catch (ex) { }
  }
  else
  {
    getId('ECS_ORDERTOTAL').innerHTML = obj.content;
  }
}

/**
 * 验证红包序列号
 * @param string bonusSn 红包序列号
 */
function validateBonus(bonusSn)
{
	Ajax.call('quick_buy.php?step=validate_bonus', 'bonus_sn=' + bonusSn+get_consignee_str(), validateBonusResponse, 'GET', 'JSON');
}

function validateBonusResponse(obj)
{

	if (obj.error)
	  {
		alert(obj.error);
		getId('ECS_ORDERTOTAL').innerHTML = obj.content;
		try
		{
		  document.getElementById('ECS_BONUSN').value = '0';
		}
		catch (ex) { }
	  }
	  else
	  {
		getId('ECS_ORDERTOTAL').innerHTML = obj.content;
	  }
}




/* *
 * 回调函数
 */
function orderSelectedResponse(result)
{
  if (result.error)
  {
    alert(result.error);
    location.href = './';
  }

  try
  {
    var layer = document.getElementById("ECS_ORDERTOTAL");

    layer.innerHTML = (typeof result == "object") ? result.content : result;

    if (result.payment != undefined)
    {
      var surplusObj = document.forms['ECS_FORMQUICKBUY'].elements['surplus'];
      if (surplusObj != undefined)
      {
        surplusObj.disabled = result.pay_code == 'balance';
      }
    }
  }
  catch (ex) { }
}

/* *
 * 检查提交的订单表单
 */
function checkOrderForm(frm)
{
  var paymentSelected = false;
  var shippingSelected = false;
  
  var msg = new Array();
  var err = false;
  
  if (frm.elements['country'] && frm.elements['country'].value == 0)
  {
    msg.push(country_not_null);
    err = true;
  }

  if (frm.elements['province'] && frm.elements['province'].value == 0 && frm.elements['province'].length > 1)
  {
    err = true;
    msg.push(province_not_null);
  }

  if (frm.elements['city'] && frm.elements['city'].value == 0 && frm.elements['city'].length > 1)
  {
    err = true;
    msg.push(city_not_null);
  }

  if (frm.elements['district'] && frm.elements['district'].length > 1)
  {
    if (frm.elements['district'].value == 0)
    {
      err = true;
      msg.push(district_not_null);
    }
  }

  if (frm.elements['consignee']&&Utils.isEmpty(frm.elements['consignee'].value))
  {
    err = true;
    msg.push(consignee_not_null);
  }
  
  /*
  if ( frm.elements['email'] && ! Utils.isEmail(frm.elements['email'].value))
  {
    err = true;
    msg.push(invalid_email);
  }
  */
  

  if (frm.elements['address'] && Utils.isEmpty(frm.elements['address'].value))
  {
    err = true;
    msg.push(address_not_null);
  }

  if (frm.elements['zipcode'] && frm.elements['zipcode'].value.length > 0 && (!Utils.isNumber(frm.elements['zipcode'].value)))
  {
    err = true;
    msg.push(zip_not_num);
  }

  if (frm.elements['tel']&&Utils.isEmpty(frm.elements['tel'].value))
  {
    err = true;
    msg.push(tele_not_null);
  }
  else
  {
    if (frm.elements['tel']&&!Utils.isTel(frm.elements['tel'].value))
    {
      err = true;
      msg.push(tele_invaild);
    }
  }

  if (frm.elements['mobile'] && frm.elements['mobile'].value.length > 0 && (!Utils.isTel(frm.elements['mobile'].value)))
  {
    err = true;
    msg.push(mobile_invaild);
  }
  
  if (frm.elements['shipping'] && Utils.isEmpty(frm.elements['shipping'].value))
  {
     err = true;
     msg.push(flow_no_shipping);
  }
  
/*  if (frm.elements['payment'] && Utils.isEmpty(frm.elements['payment'].value))
  {
     err = true;
     msg.push(flow_no_payment);
  }*/
  
for (i = 0; i < frm.elements.length; i ++ )
  {
    if (frm.elements[i].name == 'payment' && frm.elements[i].checked)
    {
      paymentSelected = true;
    }
  }
  
  if ( ! paymentSelected)
  {
	 err = true;
     msg.push(flow_no_payment);
  }

  if (err)
  {
    message = msg.join("\n");
    alert(message);
	return false;
  }

 /* // 检查是否选择了支付配送方式
  for (i = 0; i < frm.elements.length; i ++ )
  {
    if (frm.elements[i].name == 'shipping' && frm.elements[i].checked)
    {
      shippingSelected = true;
    }

    if (frm.elements[i].name == 'payment' && frm.elements[i].checked)
    {
      paymentSelected = true;
    }
  }*/

  /*if ( ! shippingSelected)
  {
    alert(flow_no_shipping);
    return false;
  }

  if ( ! paymentSelected)
  {
    alert(flow_no_payment);
    return false;
  }*/

  // 检查用户输入的余额
  if (document.getElementById("ECS_SURPLUS"))
  {
    var surplus = document.getElementById("ECS_SURPLUS").value;
    var error   = Utils.trim(Ajax.call('quick_buy.php?step=check_surplus', 'surplus=' + surplus, null, 'GET', 'TEXT', false));

    if (error)
    {
      try
      {
        document.getElementById("ECS_SURPLUS_NOTICE").innerHTML = error;
      }
      catch (ex)
      {
      }
      return false;
    }
  }

  // 检查用户输入的积分
  if (document.getElementById("ECS_INTEGRAL"))
  {
    var integral = document.getElementById("ECS_INTEGRAL").value;
    var error    = Utils.trim(Ajax.call('quick_buy.php?step=check_integral', 'integral=' + integral, null, 'GET', 'TEXT', false));

    if (error)
    {
      return false;
      try
      {
        document.getElementById("ECS_INTEGRAL_NOTICE").innerHTML = error;
      }
      catch (ex)
      {
      }
    }
  }
  frm.action = frm.action + '?step=done';
  return true;
}


//产品列表页鼠标显示中图效果
function showMiddelImg(obj,left,goods_id)
{
    var inputid = obj.id;
  
    if (!getobj("inputid"))
    {
        //若尚未创建就创建层
		if(left<0)
		{
			var className = 'productInfo productInfo1';
		}
		else
		{
			var className = 'productInfo';
		}
        var productInfoId = "productInfo"+inputid;
		crertdiv("" , "div",productInfoId,className);//创建层"messagediv"
		Ajax.call('miniGoods.php', 'goods_id='+goods_id+'&inputid='+inputid, showMiddelImgResponse, 'GET', 'JSON');
        //getobj("messagea").innerHTML = show_div_exit;
        //getobj("messagea").onclick = function(){hidediv("messagediv");};
    }
    var newdiv = getobj(productInfoId);
    newdiv.style.left    = (getAbsoluteLeft(obj) + left) + "px";
    newdiv.style.top     = (getAbsoluteTop(obj) - 65) + "px";
    newdiv.style.display = "block";
}
function showMiddelImgResponse(res)
{ 
   
   getobj("productInfo"+res.inputid).innerHTML = res.result;
}

function hiddenMiddelImg(obj)
{
	var inputid = obj.id;
	
	var productInfoId = "productInfo"+inputid;
	if (getobj(productInfoId))
	{
	   getobj(productInfoId).style.display = "none";
	   getobj(productInfoId).innerHTML='';
	}
}

function doQuickBuy()
{
	
	/*if(document.getElementById("quickBoxOuter")){
	  
	  document.getElementById("quickBoxOuter").style.top = (document.minitop-300)+"px";
	  document.getElementById("quickBoxOuter").style.left = (document.minileft-300)+"px";
   }*/
	document.getElementById("quickBoxOuter").style.display = "block";
	document.getElementById('fade').style.display='block';
}

function closeLogin(obj)
{   
	document.getElementById(obj).style.display='none';
	document.getElementById('fade').style.display='none'
}

function getmousepos1(e){
    var pos = mousePos1(e);
	document.minileft = pos.x;
	document.minitop = pos.y;
}
/*获取鼠标坐标*/
function mousePos1(e){
        var x,y;
        e = e || window.event;
        return {
        x:e.pageX||(e.clientX?e.clientX+(document.documentElement.scrollLeft?document.documentElement.scrollLeft:document.body.scrollLeft):0),
        y:e.pageY||(e.clientY?e.clientY+(document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop):0)
        };
}