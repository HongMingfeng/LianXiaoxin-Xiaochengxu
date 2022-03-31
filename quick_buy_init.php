<?php

$_LANG1['flow_js']['consignee_not_null'] = '收货人姓名不能为空！';
$_LANG1['flow_js']['country_not_null'] = '请您选择收货人所在国家！';
$_LANG1['flow_js']['province_not_null'] = '请您选择收货人所在省份！';
$_LANG1['flow_js']['city_not_null'] = '请您选择收货人所在城市！';
$_LANG1['flow_js']['district_not_null'] = '请您选择收货人所在区域！';
$_LANG1['flow_js']['invalid_email'] = '您输入的邮件地址不是一个合法的邮件地址。';
$_LANG1['flow_js']['address_not_null'] = '收货人的详细地址不能为空！';
$_LANG1['flow_js']['tele_not_null'] = '电话不能为空！';
$_LANG1['flow_js']['shipping_not_null'] = '请您选择配送方式！';
$_LANG1['flow_js']['payment_not_null'] = '请您选择支付方式！';
$_LANG1['flow_js']['goodsattr_style'] = 1;
$_LANG1['flow_js']['tele_invaild'] = '电话号码不有效的号码';
$_LANG1['flow_js']['zip_not_num'] = '邮政编码只能填写数字';
$_LANG1['flow_js']['mobile_invaild'] = '手机号码不是合法号码';
$_LANG1['flow_no_shipping'] = '您必须选定一个配送方式。';
$_LANG1['flow_no_payment'] = '您必须选定一个支付方式。';
$_LANG1['plus'] = '加';
$_LANG1['minus'] = '减';
$smarty->assign('lang1',             $_LANG1);
require_once (ROOT_PATH . 'includes/lib_order.php');
$consignee = get_consignee($_SESSION['user_id']);

/* 取得国家列表、商店所在国家、商店所在国家的省列表 */
$smarty->assign('country_list',       get_regions());
$smarty->assign('shop_country',       $_CFG['shop_country']);
$smarty->assign('shop_province_list', get_regions(1,1));

if(empty($consignee['province']))
{
	$consignee['province'] = $GLOBALS['_CFG']['shop_province'];
}
if(empty($consignee['city']))
{
	$consignee['city'] = $GLOBALS['_CFG']['shop_city'];
}


$city_list    = get_regions(2, $consignee['province']);
$smarty->assign('city_list',     $city_list);
$district_list = get_regions(3, $consignee['city']);
$smarty->assign('district_list', $district_list);

$payment_list = available_payment_list(1, $cod_fee);
$smarty->assign('payment_list', $payment_list);
$smarty->assign('consignee', $consignee);

/* 取得配送列表 */
$region            = array(1, $consignee['province'], $consignee['city'], $consignee['district']);
$shipping_list     = available_shipping_list($region);
$insure_disabled   = true;
$cod_disabled      = true;

?>