/********迷你购物车加减********/
	function flowClickCartNum(a,b)
	{
		
		var b = parseInt(b);
		var c = $("#goods_number_"+a);
		var d = parseInt(c.val());
		if(d < 1 || !$.isNumeric(d))
		{
			alert("请输入正确的商品数量");	
			e = 1;
		}
		
		if(b == -1)		
		{
			if(d == 1)
			{
				alert("购买数量不能小于1件");	
			}
			else
			{
				e = d + b;
			}
		}
		else
		{
			e = d + b;
		}
		
		flow_change_goods_number(a,e);
	}
		
	function flow_change_goods_number(rec_id, goods_number)
	{     
		Ajax.call('flow.php?step=ajax_update_cart', 'rec_id=' + rec_id +'&goods_number=' + goods_number, flow_change_goods_number_response, 'POST','JSON');
	}
	function flow_change_goods_number_response(result)
	{              
	
		if (result.error == 0)
		{
			var rec_id = result.rec_id;
			
			$('#goods_number_' +rec_id).val(result.goods_number);//更新数量	
			$('#total_items_' +rec_id).html(result.goods_subtotal);//更新小计	
			$('#totalSkuPrice').html(result.total_price); //更新合计
			$('#selectedCount').html(result.total_goods_count);//更新购物车数量
			//$('#totalRePrice').html("- "+result.total_saving) //更新节省

		}
		else if (result.message != '')
		{
			alert(result.message);                
		}
	}

	/* *
 * 检查收货地址信息表单中填写的内容
 */
function checkConsignee(frm)
{
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

  if (Utils.isEmpty(frm.elements['consignee'].value))
  {
    err = true;
    msg.push(consignee_not_null);
  }

  if ( ! Utils.isEmail(frm.elements['email'].value))
  {
    err = true;
    msg.push(invalid_email);
  }

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

  if (Utils.isEmpty(frm.elements['mobile'].value))
  {
    err = true;
    msg.push(mobile_not_null);
  }
  else
  {
    if (!Utils.isMobile(frm.elements['mobile'].value))
    {
      err = true;
      msg.push(mobile_invaild);
    }
  }

  if (err)
  {
    message = msg.join("\n");
    alert(message);
  }
  return ! err;
}
