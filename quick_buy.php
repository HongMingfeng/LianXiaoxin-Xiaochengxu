<?php

/**
 * ECSHOP 购物流程
 * ============================================================================
 * 版权所有 2005-2010 上海商派网络科技有限公司，并保留所有权利。
 * 网站地址: http://www.ecshop.com；
 * ----------------------------------------------------------------------------
 * 这不是一个自由软件！您只能在不用于商业目的的前提下对程序代码进行修改和
 * 使用；不允许对程序代码以任何形式任何目的的再发布。
 * ============================================================================
 * $Author: liuhui $
 * $Id: flow.php 17164 2010-05-24 01:42:50Z liuhui $
 */

define('IN_ECS', true);

require(dirname(__FILE__) . '/includes/init.php');
require(ROOT_PATH . 'includes/lib_order.php');
require(ROOT_PATH . 'includes/lib_order_1.php');

/* 载入语言文件 */
require_once(ROOT_PATH . 'languages/' .$_CFG['lang']. '/user.php');

$_LANG['no_goods_in_cart'] = "商品清单为空";

require_once(ROOT_PATH . 'languages/' .$_CFG['lang']. '/shopping_flow.php');

/*------------------------------------------------------ */
//-- INPUT
/*------------------------------------------------------ */

if (!isset($_REQUEST['step']))
{
    $_REQUEST['step'] = "cart";
}

/*------------------------------------------------------ */
//-- PROCESSOR
/*------------------------------------------------------ */

assign_template();
assign_dynamic('flow');
$position = assign_ur_here(0, $_LANG['shopping_flow']);
$smarty->assign('page_title',       $position['title']);    // 页面标题
$smarty->assign('ur_here',          $position['ur_here']);  // 当前位置

$smarty->assign('lang',             $_LANG);
$smarty->assign('show_marketprice', $_CFG['show_marketprice']);
$smarty->assign('data_dir',    DATA_DIR);       // 数据目录

if ($_REQUEST['step'] == 'check_integral')
{
    /*------------------------------------------------------ */
    //-- 检查用户输入的余额
    /*------------------------------------------------------ */
    $points      = floatval($_GET['integral']);
    $user_info   = user_info($_SESSION['user_id']);
    $flow_points = flow_available_points_1();  // 该订单允许使用的积分
    $user_points = $user_info['pay_points']; // 用户的积分总数

    if ($points > $user_points)
    {
        die($_LANG['integral_not_enough']);
    }

    if ($points > $flow_points)
    {
        die(sprintf($_LANG['integral_too_much'], $flow_points));
    }
    exit;
}



if ($_REQUEST['step'] == 'check_surplus')
{
    /*------------------------------------------------------ */
    //-- 检查用户输入的余额
    /*------------------------------------------------------ */
    $surplus   = floatval($_GET['surplus']);
    $user_info = user_info($_SESSION['user_id']);

    if (($user_info['user_money'] + $user_info['credit_line'] < $surplus))
    {
        die($_LANG['surplus_not_enough']);
    }

    exit;
}



if ($_REQUEST['step'] == 'change_integral')
{
    /*------------------------------------------------------ */
    //-- 改变积分
    /*------------------------------------------------------ */
    include_once('includes/cls_json.php');

    $points    = floatval($_GET['points']);
    $user_info = user_info($_SESSION['user_id']);

    /* 取得订单信息 */
    $order = flow_order_info();

    $flow_points = flow_available_points_1();  // 该订单允许使用的积分
    $user_points = $user_info['pay_points']; // 用户的积分总数

    if ($points > $user_points)
    {
        $result['error'] = $_LANG['integral_not_enough'];
    }
    elseif ($points > $flow_points)
    {
        $result['error'] = sprintf($_LANG['integral_too_much'], $flow_points);
    }
    else
    {
        /* 取得购物类型 */
        $flow_type = isset($_SESSION['flow_type']) ? intval($_SESSION['flow_type']) : CART_GENERAL_GOODS;

        $order['integral'] = $points;

        /* 获得收货人信息 */

        /* 对商品信息赋值 */
		
		$consignee['country'] = isset($_REQUEST['country']) ? intval($_REQUEST['country']) : 0;
		$consignee['province']= isset($_REQUEST['province']) ? intval($_REQUEST['province']) : 0;
		$consignee['city'] = isset($_REQUEST['city']) ? intval($_REQUEST['city']) : 0;
		$consignee['district'] = isset($_REQUEST['district']) ? intval($_REQUEST['district']) : 0;
  
  /*
   * 计算订单的费用
   */
   
      $cart_goods = cart_goods_1(); // 取得商品列表，计算合计

	  if (empty($cart_goods))
	  {
		  $result['error'] = $_LANG['no_goods_in_cart'];
	  }
	  else
	  {
		  /* 计算订单的费用 */
		  $total = order_fee1($order, $cart_goods, $consignee);
		  $smarty->assign('total',  $total);
		  $smarty->assign('config', $_CFG);

		  /* 团购标志 */
		  if ($flow_type == CART_GROUP_BUY_GOODS)
		  {
			  $smarty->assign('is_group_buy', 1);
		  }

		  $result['content'] = $smarty->fetch('library/order_total1.lbi');
		  $result['error'] = '';
	  }
    }
    $json = new JSON();
    die($json->encode($result));
}

if ($_REQUEST['step'] == 'change_bonus')
{
    /*------------------------------------------------------ */
    //-- 改变红包
    /*------------------------------------------------------ */
    include_once('includes/cls_json.php');
    $result = array('error' => '', 'content' => '');

    /* 取得购物类型 */
    $flow_type = isset($_SESSION['flow_type']) ? intval($_SESSION['flow_type']) : CART_GENERAL_GOODS;

    /* 获得收货人信息 */
   	$consignee['country'] = isset($_REQUEST['country']) ? intval($_REQUEST['country']) : 0;
	$consignee['province']= isset($_REQUEST['province']) ? intval($_REQUEST['province']) : 0;
	$consignee['city'] = isset($_REQUEST['city']) ? intval($_REQUEST['city']) : 0;
	$consignee['district'] = isset($_REQUEST['district']) ? intval($_REQUEST['district']) : 0;

    /* 对商品信息赋值 */
    $cart_goods = cart_goods_1(); // 取得商品列表，计算合计

    if (empty($cart_goods))
    {
        $result['error'] = $_LANG['no_goods_in_cart'];
    }
    else
    {
        /* 取得购物流程设置 */
        $smarty->assign('config', $_CFG);

        /* 取得订单信息 */
        $order = flow_order_info();

        $bonus = bonus_info(intval($_GET['bonus']));

        if ((!empty($bonus) && $bonus['user_id'] == $_SESSION['user_id']) || $_GET['bonus'] == 0)
        {
            $order['bonus_id'] = $_GET['bonus'];
        }
        else
        {
            $order['bonus_id'] = 0;
            $result['error'] = $_LANG['invalid_bonus'];
        }

        /* 计算订单的费用 */
        $total = order_fee1($order, $cart_goods, $consignee);
        $smarty->assign('total', $total);

        /* 团购标志 */
        if ($flow_type == CART_GROUP_BUY_GOODS)
        {
            $smarty->assign('is_group_buy', 1);
        }

        $result['content'] = $smarty->fetch('library/order_total1.lbi');
    }

    $json = new JSON();
    die($json->encode($result));
}


/* 验证红包序列号 */
if ($_REQUEST['step'] == 'validate_bonus')
{
    $bonus_sn = trim($_REQUEST['bonus_sn']);
    if (is_numeric($bonus_sn))
    {
        $bonus = bonus_info(0, $bonus_sn);
    }
    else
    {
        $bonus = array();
    }


    $bonus_kill = price_format($bonus['type_money'], false);

    include_once('includes/cls_json.php');
    $result = array('error' => '', 'content' => '');

    /* 取得购物类型 */
    $flow_type = isset($_SESSION['flow_type']) ? intval($_SESSION['flow_type']) : CART_GENERAL_GOODS;

    /* 获得收货人信息 */
   	$consignee['country'] = isset($_REQUEST['country']) ? intval($_REQUEST['country']) : 0;
	$consignee['province']= isset($_REQUEST['province']) ? intval($_REQUEST['province']) : 0;
	$consignee['city'] = isset($_REQUEST['city']) ? intval($_REQUEST['city']) : 0;
	$consignee['district'] = isset($_REQUEST['district']) ? intval($_REQUEST['district']) : 0;

    /* 对商品信息赋值 */
    $cart_goods = cart_goods_1(); // 取得商品列表，计算合计

    if (empty($cart_goods))
    {
        $result['error'] = $_LANG['no_goods_in_cart'];
    }
    else
    {
        /* 取得购物流程设置 */
        $smarty->assign('config', $_CFG);

        /* 取得订单信息 */
        $order = flow_order_info();


        if (((!empty($bonus) && $bonus['user_id'] == $_SESSION['user_id']) || ($bonus['type_money'] > 0 && empty($bonus['user_id']))) && $bonus['order_id'] <= 0)
        {
            //$order['bonus_kill'] = $bonus['type_money'];
            $now = gmtime();
            if ($now > $bonus['use_end_date'])
            {
                $order['bonus_id'] = '';
                $result['error']=$_LANG['bonus_use_expire'];
            }
            else
            {
                $order['bonus_id'] = $bonus['bonus_id'];
                $order['bonus_sn'] = $bonus_sn;
            }
        }
        else
        {
            //$order['bonus_kill'] = 0;
            $order['bonus_id'] = '';
            $result['error'] = $_LANG['invalid_bonus'];
        }

        /* 计算订单的费用 */
        $total = order_fee1($order, $cart_goods, $consignee);

        $smarty->assign('total', $total);

        /* 团购标志 */
        if ($flow_type == CART_GROUP_BUY_GOODS)
        {
            $smarty->assign('is_group_buy', 1);
        }

        $result['content'] = $smarty->fetch('library/order_total1.lbi');
    }
    $json = new JSON();
    die($json->encode($result));
}

if ($_REQUEST['step'] == 'get_shipping_method')
{
	
	
	include_once('includes/cls_json.php');
    $result = array('error' => '', 'content' => '');

    /* 取得购物类型 */
    $flow_type = isset($_SESSION['flow_type']) ? intval($_SESSION['flow_type']) : CART_GENERAL_GOODS;

    /* 获得收货人信息 */
   	$consignee['country'] = isset($_REQUEST['country']) ? intval($_REQUEST['country']) : 0;
	$consignee['province']= isset($_REQUEST['province']) ? intval($_REQUEST['province']) : 0;
	$consignee['city'] = isset($_REQUEST['city']) ? intval($_REQUEST['city']) : 0;
	$consignee['district'] = isset($_REQUEST['district']) ? intval($_REQUEST['district']) : 0;

    /* 对商品信息赋值 */
    $cart_goods = cart_goods_1(); // 取得商品列表，计算合计

    if (empty($cart_goods))
    {
        $result['error'] = $_LANG['no_goods_in_cart'];
    }
    else
    {
       /* 取得购物流程设置 */
       $smarty->assign('config', $_CFG);

       /* 取得订单信息 */
       $order = flow_order_info();


	  $region            = array($consignee['country'], $consignee['province'], $consignee['city'], $consignee['district']);
	  $shipping_list     = available_shipping_list($region);
	  $insure_disabled   = true;
	  $cod_disabled      = true;
	  
	  $cart_weight_price = cart_weight_price_1();
	
	  // 查看购物车中是否全为免运费商品，若是则把运费赋为零
	  $sql = 'SELECT count(*) FROM ' . $ecs->table('cart1') . " WHERE `session_id` = '" . SESS_ID. "' AND `extension_code` != 'package_buy' AND `is_shipping` = 0";
	  $shipping_count = $db->getOne($sql);
	
	  foreach ($shipping_list AS $key => $val)
	  {
		  $shipping_cfg = unserialize_config($val['configure']);
		  $shipping_fee = ($shipping_count == 0 AND $cart_weight_price['free_shipping'] == 1) ? 0 : shipping_fee($val['shipping_code'], unserialize($val['configure']),
		  $cart_weight_price['weight'], $cart_weight_price['amount'], $cart_weight_price['number']);
	
		  $shipping_list[$key]['format_shipping_fee'] = price_format($shipping_fee, false);
		  $shipping_list[$key]['shipping_fee']        = $shipping_fee;
		  $shipping_list[$key]['free_money']          = price_format($shipping_cfg['free_money'], false);
		  $shipping_list[$key]['insure_formated']     = strpos($val['insure'], '%') === false ?
		  price_format($val['insure'], false) : $val['insure'];
	
		  /* 当前的配送方式是否支持保价 */
		  if ($val['shipping_id'] == $order['shipping_id'])
		  {
			  $insure_disabled = ($val['insure'] == 0);
			  $cod_disabled    = ($val['support_cod'] == 0);
		  }
	  }
	
	  $smarty->assign('shipping_list',   $shipping_list);
	  $smarty->assign('insure_disabled', $insure_disabled);
	  $smarty->assign('cod_disabled',    $cod_disabled);
	  
      $result['shipping_list'] = $smarty->fetch('library/shipping_list.lbi');
    }
    $json = new JSON();
    die($json->encode($result));
}
/*------------------------------------------------------ */
//-- 添加商品到购物车
/*------------------------------------------------------ */
if ($_REQUEST['step'] == 'quick_to_cart')
{
    include_once('includes/cls_json.php');
	$result = array('error' => 0, 'message' => '', 'content' => '', 'goods_id' => '', 'cart_list' => '', 'goods_amount' => '');
    $json  = new JSON;
	
   /* 取得购物类型 */
   $flow_type = isset($_SESSION['flow_type']) ? intval($_SESSION['flow_type']) : CART_GENERAL_GOODS;
   $smarty->assign('config', $_CFG);
   $user_info = user_info($_SESSION['user_id']);
	/*商品ID*/
   $goods_id = $_REQUEST['goods_id'];
   $goods_number = isset($_REQUEST['goods_number']) ? intval($_REQUEST['goods_number']) : 0;
   $spec    = isset($_REQUEST['attr']) ? explode(',', $_REQUEST['attr']) : array();
    
   $goods_id = $_REQUEST['goods_id'];	
   $result['goods_id'] = $goods_id;
	
	if(!empty($goods_id))
	{
		/* 检查：商品数量是否合法 */
		if (!is_numeric($goods_number))
		{
			$result['error']   = 1;
			$result['message'] = $_LANG['invalid_number'];
		}
		/* 更新：购物车 */
		else
		{
			 if($goods_number>0)
			 {
				/*取得商品信息*/
				$sql = "SELECT g.goods_id, g.goods_name, g.goods_sn, g.give_integral, g.is_on_sale, g.is_real,g.integral, ".
					"g.market_price, g.shop_price AS org_price, g.promote_price, g.promote_start_date, ".
					"g.promote_end_date, g.goods_weight, g.integral, g.extension_code, ".
					"g.goods_number, g.is_alone_sale, g.is_shipping,".
					"IFNULL(mp.user_price, g.shop_price * '$_SESSION[discount]') AS shop_price ".
				" FROM " .$GLOBALS['ecs']->table('goods'). " AS g ".
				" LEFT JOIN " . $GLOBALS['ecs']->table('member_price') . " AS mp ".
						"ON mp.goods_id = g.goods_id AND mp.user_rank = '$_SESSION[user_rank]' ".
				" WHERE g.goods_id = '$goods_id'" .
				" AND g.is_delete = 0";
				
				$goods = $GLOBALS['db']->getRow($sql);
				
				/* 计算商品的促销价格 */
				$spec_price             = spec_price($spec);
				$goods_price            = get_final_price($goods_id, $goods_number, true, $spec);
				$goods['market_price'] += $spec_price;
				$goods_attr             = get_goods_attr_info($spec);
				$goods_attr_id          = join(',', $spec);
				
				$goods['user_id'] = $_SESSION['user_id'];
				$goods['goods_price'] = $goods_price;
				$goods['goods_attr'] = $goods_attr;
				$goods['parent_id'] = 0;
				$goods['is_gift'] = 0;
				$goods['goods_number'] = $goods_number;
				$goods['subtotal'] = $goods_price*$goods_number;
				$goods['session_id'] = SESS_ID;
				
				$GLOBALS['db']->query("delete from ".$GLOBALS['ecs']->table('cart1'). " where session_id='".SESS_ID."'");
				$GLOBALS['db']->autoExecute($GLOBALS['ecs']->table('cart1'), $goods, 'INSERT');
				/*保存购物信息*/
			 }
			 else
			 {
				 $GLOBALS['db']->query("delete from ".$GLOBALS['ecs']->table('cart1'). " where session_id='".SESS_ID."'" );
			 }
		}
   }
	
	
   $cart_goods = get_cart_goods_1();
   $smarty->assign('goods_list', $cart_goods['goods_list']);
   $total = $cart_goods['total'];
   $result['cart_list'] = $GLOBALS['smarty']->fetch('library/quick_cart_list.lbi');
   $result['goods_amount'] = $total['goods_price'];
	
	
  /*
   * 取得订单信息
   */
  $order = flow_order_info();
  
  $order['shipping_id'] = isset($_REQUEST['shipping_id']) ? intval($_REQUEST['shipping_id']) : 0;
  $order['pay_id'] = isset($_REQUEST['pay_id']) ? intval($_REQUEST['pay_id']) : 0;
  
  $smarty->assign('order', $order);
  
  /* 计算折扣 */
  if ($flow_type != CART_EXCHANGE_GOODS && $flow_type != CART_GROUP_BUY_GOODS)
  {
	  $discount = compute_discount_1();
	  $smarty->assign('discount', $discount['discount']);
	  $favour_name = empty($discount['name']) ? '' : join(',', $discount['name']);
	  $smarty->assign('your_discount', sprintf($_LANG['your_discount'], $favour_name, price_format($discount['discount'])));
  }

  
  $consignee['country'] = isset($_REQUEST['country']) ? intval($_REQUEST['country']) : 0;
  $consignee['province']= isset($_REQUEST['province']) ? intval($_REQUEST['province']) : 0;
  $consignee['city'] = isset($_REQUEST['city']) ? intval($_REQUEST['city']) : 0;
  $consignee['district'] = isset($_REQUEST['district']) ? intval($_REQUEST['district']) : 0;
  
  /*
   * 计算订单的费用
   */
  $cart_goods = cart_goods_1($flow_type); // 取得商品列表，计算合计
  $total = order_fee1($order,$cart_goods , $consignee);

  //print_r($total);
  //exit;
  

  $smarty->assign('total', $total);
  
  $smarty->assign('shopping_money', sprintf($_LANG['shopping_money'], $total['formated_goods_price']));
  $smarty->assign('market_price_desc', sprintf($_LANG['than_market_price'], $total['formated_market_price'], $total['formated_saving'], $total['save_rate']));

  /* 取得配送列表 */
  $region            = array($consignee['country'], $consignee['province'], $consignee['city'], $consignee['district']);
  $shipping_list     = available_shipping_list($region);
  $insure_disabled   = true;
  $cod_disabled      = true;
  
  $cart_weight_price = cart_weight_price_1();

  // 查看购物车中是否全为免运费商品，若是则把运费赋为零
  $sql = 'SELECT count(*) FROM ' . $ecs->table('cart1') . " WHERE `session_id` = '" . SESS_ID. "' AND `extension_code` != 'package_buy' AND `is_shipping` = 0";
  $shipping_count = $db->getOne($sql);

  foreach ($shipping_list AS $key => $val)
  {
	  $shipping_cfg = unserialize_config($val['configure']);
	  $shipping_fee = ($shipping_count == 0 AND $cart_weight_price['free_shipping'] == 1) ? 0 : shipping_fee($val['shipping_code'], unserialize($val['configure']),
	  $cart_weight_price['weight'], $cart_weight_price['amount'], $cart_weight_price['number']);

	  $shipping_list[$key]['format_shipping_fee'] = price_format($shipping_fee, false);
	  $shipping_list[$key]['shipping_fee']        = $shipping_fee;
	  $shipping_list[$key]['free_money']          = price_format($shipping_cfg['free_money'], false);
	  $shipping_list[$key]['insure_formated']     = strpos($val['insure'], '%') === false ?
	  price_format($val['insure'], false) : $val['insure'];

	  /* 当前的配送方式是否支持保价 */
	  if ($val['shipping_id'] == $order['shipping_id'])
	  {
		  $insure_disabled = ($val['insure'] == 0);
		  $cod_disabled    = ($val['support_cod'] == 0);
	  }
  }

  $smarty->assign('shipping_list',   $shipping_list);
  $smarty->assign('insure_disabled', $insure_disabled);
  $smarty->assign('cod_disabled',    $cod_disabled);
  
  $result['shipping_list'] = $GLOBALS['smarty']->fetch('library/shipping_list.lbi');
  
  
  /* 取得支付列表 */
  if ($order['shipping_id'] == 0)
  {
	  $cod        = true;
	  $cod_fee    = 0;
  }
  else
  {
	  $shipping = shipping_info($order['shipping_id']);
	  $cod = $shipping['support_cod'];

	  if ($cod)
	  {
		  /* 如果是团购，且保证金大于0，不能使用货到付款 */
		  if ($flow_type == CART_GROUP_BUY_GOODS)
		  {
			  $group_buy_id = $_SESSION['extension_id'];
			  if ($group_buy_id <= 0)
			  {
				  show_message('error group_buy_id');
			  }
			  $group_buy = group_buy_info($group_buy_id);
			  if (empty($group_buy))
			  {
				  show_message('group buy not exists: ' . $group_buy_id);
			  }

			  if ($group_buy['deposit'] > 0)
			  {
				  $cod = false;
				  $cod_fee = 0;

				  /* 赋值保证金 */
				  $smarty->assign('gb_deposit', $group_buy['deposit']);
			  }
		  }

		  if ($cod)
		  {
			  $shipping_area_info = shipping_area_info($order['shipping_id'], $region);
			  $cod_fee            = $shipping_area_info['pay_fee'];
		  }
	  }
	  else
	  {
		  $cod_fee = 0;
	  }
  }

  // 给货到付款的手续费加<span id>，以便改变配送的时候动态显示
  $payment_list = available_payment_list(1, $cod_fee);
  if(isset($payment_list))
  {
	  foreach ($payment_list as $key => $payment)
	  {
		  if ($payment['is_cod'] == '1')
		  {
			  $payment_list[$key]['format_pay_fee'] = '<span id="ECS_CODFEE">' . $payment['format_pay_fee'] . '</span>';
		  }
		  /* 如果有易宝神州行支付 如果订单金额大于300 则不显示 */
		  if ($payment['pay_code'] == 'yeepayszx' && $total['amount'] > 300)
		  {
			  unset($payment_list[$key]);
		  }
		  /* 如果有余额支付 */
		  if ($payment['pay_code'] == 'balance')
		  {
			  /* 如果未登录，不显示 */
			  if ($_SESSION['user_id'] == 0)
			  {
				  unset($payment_list[$key]);
			  }
			  else
			  {
				  if ($_SESSION['flow_order']['pay_id'] == $payment['pay_id'])
				  {
					  $smarty->assign('disable_surplus', 1);
				  }
			  }
		  }
	  }
  }
  $smarty->assign('payment_list', $payment_list);
  $result['payment_list'] = $GLOBALS['smarty']->fetch('library/payment_list.lbi');
  
  
  /* 如果使用积分，取得用户可用积分及本订单最多可以使用的积分 */
  if ((!isset($_CFG['use_integral']) || $_CFG['use_integral'] == '1')
	  && $_SESSION['user_id'] > 0
	  && $user_info['pay_points'] > 0
	  && ($flow_type != CART_GROUP_BUY_GOODS && $flow_type != CART_EXCHANGE_GOODS))
  {
	
	  // 能使用积分
	  $smarty->assign('allow_use_integral', 1);
	  $smarty->assign('order_max_integral', flow_available_points_1());  // 可用积分
	  $smarty->assign('your_integral',      $user_info['pay_points']); // 用户积分
  }

  /* 如果使用红包，取得用户可以使用的红包及用户选择的红包 */
  if ((!isset($_CFG['use_bonus']) || $_CFG['use_bonus'] == '1')
	  && ($flow_type != CART_GROUP_BUY_GOODS && $flow_type != CART_EXCHANGE_GOODS))
  {
	  // 取得用户可用红包
	  $user_bonus = user_bonus($_SESSION['user_id'], $total['goods_price']);
	  if (!empty($user_bonus))
	  {
		  foreach ($user_bonus AS $key => $val)
		  {
			  $user_bonus[$key]['bonus_money_formated'] = price_format($val['type_money'], false);
		  }
		  $smarty->assign('bonus_list', $user_bonus);
	  }

	  // 能使用红包
	  $smarty->assign('allow_use_bonus', 1);
  }
  $result['otherInfo'] = $GLOBALS['smarty']->fetch('library/otherInfo.lbi');
  
  
  $result['order_total'] = $GLOBALS['smarty']->fetch('library/order_total1.lbi');
  $result['goods_price'] = $total['formated_goods_price'];
  

  
  $_SESSION['flow_order'] = $order;
  die($json->encode($result));
}

/*------------------------------------------------------ */
//-- 完成所有订单操作，提交到数据库
/*------------------------------------------------------ */
elseif ($_REQUEST['step'] == 'done')
{
    include_once('includes/lib_clips.php');
    include_once('includes/lib_payment.php');
    include_once('includes/lib_transaction.php');
    /* 取得购物类型 */
    $flow_type = isset($_SESSION['flow_type']) ? intval($_SESSION['flow_type']) : CART_GENERAL_GOODS;

     /* 检查购物车中是否有商品 */
    $sql = "SELECT COUNT(*) FROM " . $ecs->table('cart1') .
        " WHERE session_id = '" . SESS_ID . "' " .
        "AND parent_id = 0 AND is_gift = 0 AND rec_type = '$flow_type'";
    if ($db->getOne($sql) == 0)
    {
        show_message($_LANG['no_goods_in_cart'], '', '', 'warning');
    }


    /* 检查商品库存 */
    /* 如果使用库存，且下订单时减库存，则减少库存 */
    if ($_CFG['use_storage'] == '1' && $_CFG['stock_dec_time'] == SDT_PLACE)
    {
        $cart_goods_stock = get_cart_goods_1();
        $_cart_goods_stock = array();
        foreach ($cart_goods_stock['goods_list'] as $value)
        {
            $_cart_goods_stock[$value['goods_id']] = $value['goods_number'];
        }
        flow_cart_stock_1($_cart_goods_stock);
        unset($cart_goods_stock, $_cart_goods_stock);
    }

    /*
     * 检查用户是否已经登录
     * 如果用户已经登录了则检查是否有默认的收货地址
     * 如果没有登录则跳转到登录和注册页面
     */
    //if (empty($_SESSION['direct_shopping']) && $_SESSION['user_id'] == 0)
    //{
        /* 用户没有登录且没有选定匿名购物，转向到登录页面 */
        //ecs_header("Location: flow.php?step=login\n");
        //exit;
    //}


    /* 检查收货人信息是否完整 */
    //if (!check_consignee_info($consignee, $flow_type))
    //{
        /* 如果不完整则转向到收货人信息填写界面 */
        //ecs_header("Location: flow.php?step=consignee\n");
        //exit;
    //}
	
	 /*
	   * 保存收货人信息
	
	*/
	
	$consignee = array(
		  'address_id'    => empty($_POST['address_id']) ? 0  : intval($_POST['address_id']),
		  'consignee'     => empty($_POST['consignee'])  ? '' : trim($_POST['consignee']),
		  'country'       => empty($_POST['country'])    ? '' : $_POST['country'],
		  'province'      => empty($_POST['province'])   ? '' : $_POST['province'],
		  'city'          => empty($_POST['city'])       ? '' : $_POST['city'],
		  'district'      => empty($_POST['district'])   ? '' : $_POST['district'],
		  'email'         => empty($_POST['email'])      ? '' : $_POST['email'],
		  'address'       => empty($_POST['address'])    ? '' : $_POST['address'],
		  'zipcode'       => empty($_POST['zipcode'])    ? '' : make_semiangle(trim($_POST['zipcode'])),
		  'tel'           => empty($_POST['tel'])        ? '' : make_semiangle(trim($_POST['tel'])),
		  'mobile'        => empty($_POST['mobile'])     ? '' : make_semiangle(trim($_POST['mobile'])),
		  'sign_building' => empty($_POST['sign_building']) ? '' : $_POST['sign_building'],
		  'best_time'     => empty($_POST['best_time'])  ? '' : $_POST['best_time'],
	);
	
	if ($_SESSION['user_id'] > 0)
	{
		/* 如果用户已经登录，则保存收货人信息 */
		$consignee['user_id'] = $_SESSION['user_id'];
		save_consignee($consignee, true);
	}

	

	
	
    $_POST['how_oos'] = isset($_POST['how_oos']) ? intval($_POST['how_oos']) : 0;
    $_POST['card_message'] = isset($_POST['card_message']) ? htmlspecialchars($_POST['card_message']) : '';
    $_POST['inv_type'] = !empty($_POST['inv_type']) ? htmlspecialchars($_POST['inv_type']) : '';
    $_POST['inv_payee'] = isset($_POST['inv_payee']) ? htmlspecialchars($_POST['inv_payee']) : '';
    $_POST['inv_content'] = isset($_POST['inv_content']) ? htmlspecialchars($_POST['inv_content']) : '';
    $_POST['postscript'] = isset($_POST['postscript']) ? htmlspecialchars($_POST['postscript']) : '';

    $order = array(
        'shipping_id'     => intval($_POST['shipping']),
        'pay_id'          => intval($_POST['payment']),
        'pack_id'         => isset($_POST['pack']) ? intval($_POST['pack']) : 0,
        'card_id'         => isset($_POST['card']) ? intval($_POST['card']) : 0,
        'card_message'    => trim($_POST['card_message']),
        'surplus'         => isset($_POST['surplus']) ? floatval($_POST['surplus']) : 0.00,
        'integral'        => isset($_POST['integral']) ? intval($_POST['integral']) : 0,
        'bonus_id'        => isset($_POST['bonus']) ? intval($_POST['bonus']) : 0,
        'need_inv'        => empty($_POST['need_inv']) ? 0 : 1,
        'inv_type'        => $_POST['inv_type'],
        'inv_payee'       => trim($_POST['inv_payee']),
        'inv_content'     => $_POST['inv_content'],
        'postscript'      => trim($_POST['postscript']),
        'how_oos'         => isset($_LANG['oos'][$_POST['how_oos']]) ? addslashes($_LANG['oos'][$_POST['how_oos']]) : '',
        'need_insure'     => isset($_POST['need_insure']) ? intval($_POST['need_insure']) : 0,
        'user_id'         => $_SESSION['user_id'],
        'add_time'        => gmtime(),
        'order_status'    => OS_UNCONFIRMED,
        'shipping_status' => SS_UNSHIPPED,
        'pay_status'      => PS_UNPAYED,
        'agency_id'       => get_agency_by_regions(array($consignee['country'], $consignee['province'], $consignee['city'], $consignee['district'])),
		'user_agency_id'  => $user_agency_id
        );
     
	 

    
	 /* 收货人信息 */
    foreach ($consignee as $key => $value)
    {
        $order[$key] = addslashes($value);
    }

	
    /* 扩展信息 */
    if (isset($_SESSION['flow_type']) && intval($_SESSION['flow_type']) != CART_GENERAL_GOODS)
    {
        $order['extension_code'] = $_SESSION['extension_code'];
        $order['extension_id'] = $_SESSION['extension_id'];
    }
    else
    {
        $order['extension_code'] = '';
        $order['extension_id'] = 0;
    }

    /* 检查积分余额是否合法 */
    $user_id = $_SESSION['user_id'];
    if ($user_id > 0)
    {
        $user_info = user_info($user_id);

        $order['surplus'] = min($order['surplus'], $user_info['user_money'] + $user_info['credit_line']);
        if ($order['surplus'] < 0)
        {
            $order['surplus'] = 0;
        }

        // 查询用户有多少积分
        $flow_points = flow_available_points_1();  // 该订单允许使用的积分
        $user_points = $user_info['pay_points']; // 用户的积分总数

        $order['integral'] = min($order['integral'], $user_points, $flow_points);
        if ($order['integral'] < 0)
        {
            $order['integral'] = 0;
        }
    }
    else
    {
        $order['surplus']  = 0;
        $order['integral'] = 0;
    }

   
   
    /* 检查红包是否存在 */
    if ($order['bonus_id'] > 0)
    {
        $bonus = bonus_info($order['bonus_id']);

        if (empty($bonus) || $bonus['user_id'] != $user_id || $bonus['order_id'] > 0 || $bonus['min_goods_amount'] > cart_amount_1(true, $flow_type))
        {
            $order['bonus_id'] = 0;
        }
    }
    elseif (isset($_POST['bonus_sn']))
    {
        $bonus_sn = trim($_POST['bonus_sn']);
        $bonus = bonus_info(0, $bonus_sn);
        $now = gmtime();
        if (empty($bonus) || $bonus['user_id'] > 0 || $bonus['order_id'] > 0 || $bonus['min_goods_amount'] > cart_amount_1(true, $flow_type) || $now > $bonus['use_end_date'])
        {
        }
        else
        {
            if ($user_id > 0)
            {
                $sql = "UPDATE " . $ecs->table('user_bonus') . " SET user_id = '$user_id' WHERE bonus_id = '$bonus[bonus_id]' LIMIT 1";
                $db->query($sql);
            }
            $order['bonus_id'] = $bonus['bonus_id'];
            $order['bonus_sn'] = $bonus_sn;
        }
    }

    /* 订单中的商品 */
    $cart_goods = cart_goods_1($_SESSION['goods_list']);

    if (empty($cart_goods))
    {
        show_message($_LANG['no_goods_in_cart'], $_LANG['back_home'], './', 'warning');
    }

    /* 检查商品总额是否达到最低限购金额 */
    if ($flow_type == CART_GENERAL_GOODS && cart_amount_1(true, CART_GENERAL_GOODS) < $_CFG['min_goods_amount'])
    {
        show_message(sprintf($_LANG['goods_amount_not_enough'], price_format($_CFG['min_goods_amount'], false)));
    }


    /* 订单中的总额 */
    $total = order_fee1($order, $cart_goods, $consignee);
    


    $order['bonus']        = $total['bonus'];
    $order['goods_amount'] = $total['goods_price'];
    $order['discount']     = $total['discount'];
	$order['pay_discount'] = $total['pay_discount'];
    $order['surplus']      = $total['surplus'];
    $order['tax']          = $total['tax'];

    // 购物车中的商品能享受红包支付的总额
    $discount_amout = compute_discount_amount_1();
    // 红包和积分最多能支付的金额为商品总额
    $temp_amout = $order['goods_amount'] - $discount_amout;
    if ($temp_amout <= 0)
    {
        $order['bonus_id'] = 0;
    }

    /* 配送方式 */
    if ($order['shipping_id'] > 0)
    {
        $shipping = shipping_info($order['shipping_id']);
        $order['shipping_name'] = addslashes($shipping['shipping_name']);
    }
    $order['shipping_fee'] = $total['shipping_fee'];
    $order['insure_fee']   = $total['shipping_insure'];

    /* 支付方式 */
    if ($order['pay_id'] > 0)
    {
        $payment = payment_info($order['pay_id']);
        $order['pay_name'] = addslashes($payment['pay_name']);
    }
    $order['pay_fee'] = $total['pay_fee'];
    $order['cod_fee'] = $total['cod_fee'];

    /* 商品包装 */
    if ($order['pack_id'] > 0)
    {
        $pack               = pack_info($order['pack_id']);
        $order['pack_name'] = addslashes($pack['pack_name']);
    }
    $order['pack_fee'] = $total['pack_fee'];

    /* 祝福贺卡 */
    if ($order['card_id'] > 0)
    {
        $card               = card_info($order['card_id']);
        $order['card_name'] = addslashes($card['card_name']);
    }
    $order['card_fee']      = $total['card_fee'];

    $order['order_amount']  = number_format($total['amount'], 2, '.', '');

    /* 如果全部使用余额支付，检查余额是否足够 */
    if ($payment['pay_code'] == 'balance' && $order['order_amount'] > 0)
    {
        if($order['surplus'] >0) //余额支付里如果输入了一个金额
        {
            $order['order_amount'] = $order['order_amount'] + $order['surplus'];
            $order['surplus'] = 0;
        }
        if ($order['order_amount'] > ($user_info['user_money'] + $user_info['credit_line']))
        {
            show_message($_LANG['balance_not_enough']);
        }
        else
        {
            $order['surplus'] = $order['order_amount'];
            $order['order_amount'] = 0;
        }
    }

    /* 如果订单金额为0（使用余额或积分或红包支付），修改订单状态为已确认、已付款 */
    if ($order['order_amount'] <= 0)
    {
        $order['order_status'] = OS_CONFIRMED;
        $order['confirm_time'] = gmtime();
        $order['pay_status']   = PS_PAYED;
        $order['pay_time']     = gmtime();
        $order['order_amount'] = 0;
    }

    $order['integral_money']   = $total['integral_money'];
    $order['integral']         = $total['integral'];

    if ($order['extension_code'] == 'exchange_goods')
    {
        $order['integral_money']   = 0;
        $order['integral']         = $total['exchange_integral'];
    }

    $order['from_ad']          = !empty($_SESSION['from_ad']) ? $_SESSION['from_ad'] : '0';
    $order['referer']          = !empty($_SESSION['referer']) ? addslashes($_SESSION['referer']) : '';

    /* 记录扩展信息 */
    if ($flow_type != CART_GENERAL_GOODS)
    {
        $order['extension_code'] = $_SESSION['extension_code'];
        $order['extension_id'] = $_SESSION['extension_id'];
    }

    $affiliate = unserialize($_CFG['affiliate']);
    if(isset($affiliate['on']) && $affiliate['on'] == 1 && $affiliate['config']['separate_by'] == 1)
    {
        //推荐订单分成
        $parent_id = get_affiliate();
        if($user_id == $parent_id)
        {
            $parent_id = 0;
        }
    }
    elseif(isset($affiliate['on']) && $affiliate['on'] == 1 && $affiliate['config']['separate_by'] == 0)
    {
        //推荐注册分成
        $parent_id = 0;
    }
    else
    {
        //分成功能关闭
        $parent_id = 0;
    }
    $order['parent_id'] = $parent_id;

    /* 插入订单表 */
    $error_no = 0;
    do
    {
        $order['order_sn'] = get_order_sn(); //获取新订单号
        $GLOBALS['db']->autoExecute($GLOBALS['ecs']->table('order_info'), $order, 'INSERT');

        $error_no = $GLOBALS['db']->errno();

        if ($error_no > 0 && $error_no != 1062)
        {
            die($GLOBALS['db']->errorMsg());
        }
    }
    while ($error_no == 1062); //如果是订单号重复则重新提交数据

    $new_order_id = $db->insert_id();
    $order['order_id'] = $new_order_id;

     /* 插入订单商品 */
    $sql = "INSERT INTO " . $ecs->table('order_goods') . "( " .
                "order_id, goods_id, goods_name, goods_sn, product_id, goods_number, market_price, ".
                "goods_price, goods_attr, is_real, extension_code, parent_id, is_gift, goods_attr_id) ".
            " SELECT '$new_order_id', goods_id, goods_name, goods_sn, product_id, goods_number, market_price, ".
                "goods_price, goods_attr, is_real, extension_code, parent_id, is_gift, goods_attr_id".
            " FROM " .$ecs->table('cart1') .
            " WHERE session_id = '".SESS_ID."' AND rec_type = '$flow_type'";
    $db->query($sql);
	
    
    /* 修改拍卖活动状态 */
    if ($order['extension_code']=='auction')
    {
        $sql = "UPDATE ". $ecs->table('goods_activity') ." SET is_finished='2' WHERE act_id=".$order['extension_id'];
        $db->query($sql);
    }

    /* 处理余额、积分、红包 */
    if ($order['user_id'] > 0 && $order['surplus'] > 0)
    {
        log_account_change($order['user_id'], $order['surplus'] * (-1), 0, 0, 0, sprintf($_LANG['pay_order'], $order['order_sn']));
    }
    if ($order['user_id'] > 0 && $order['integral'] > 0)
    {
        log_account_change($order['user_id'], 0, 0, 0, $order['integral'] * (-1), sprintf($_LANG['pay_order'], $order['order_sn']));
    }


    if ($order['bonus_id'] > 0 && $temp_amout > 0)
    {
        use_bonus($order['bonus_id'], $new_order_id);
    }

    /* 如果使用库存，且下订单时减库存，则减少库存 */
    if ($_CFG['use_storage'] == '1' && $_CFG['stock_dec_time'] == SDT_PLACE)
    {
        change_order_goods_storage($order['order_id'], true, SDT_PLACE);
    }

    /* 给商家发邮件 */
    /* 增加是否给客服发送邮件选项 */
    if ($_CFG['send_service_email'] && $_CFG['service_email'] != '')
    {
        $tpl = get_mail_template('remind_of_new_order');
        $smarty->assign('order', $order);
        $smarty->assign('goods_list', $cart_goods);
        $smarty->assign('shop_name', $_CFG['shop_name']);
        $smarty->assign('send_date', date($_CFG['time_format']));
        $content = $smarty->fetch('str:' . $tpl['template_content']);
        send_mail($_CFG['shop_name'], $_CFG['service_email'], $tpl['template_subject'], $content, $tpl['is_html']);
    }

    /* 如果需要，发短信 */
    if ($_CFG['sms_order_placed'] == '1' && $_CFG['sms_shop_mobile'] != '')
    {
        include_once('includes/cls_sms.php');
        $sms = new sms();
        $msg = $order['pay_status'] == PS_UNPAYED ?
            $_LANG['order_placed_sms'] : $_LANG['order_placed_sms'] . '[' . $_LANG['sms_paid'] . ']';
        $sms->send($_CFG['sms_shop_mobile'], sprintf($msg, $order['consignee'], $order['tel']), 0);
    }

    /* 如果订单金额为0 处理虚拟卡 */
    if ($order['order_amount'] <= 0)
    {
        $sql = "SELECT goods_id, goods_name, goods_number AS num FROM ".
               $GLOBALS['ecs']->table('cart1') .
                " WHERE is_real = 0 AND extension_code = 'virtual_card'".
                " AND session_id = '".SESS_ID."' AND rec_type = '$flow_type'";

        $res = $GLOBALS['db']->getAll($sql);

        $virtual_goods = array();
        foreach ($res AS $row)
        {
            $virtual_goods['virtual_card'][] = array('goods_id' => $row['goods_id'], 'goods_name' => $row['goods_name'], 'num' => $row['num']);
        }

        if ($virtual_goods AND $flow_type != CART_GROUP_BUY_GOODS)
        {
            /* 虚拟卡发货 */
            if (virtual_goods_ship($virtual_goods,$msg, $order['order_sn'], true))
            {
                /* 如果没有实体商品，修改发货状态，送积分和红包 */
                $sql = "SELECT COUNT(*)" .
                        " FROM " . $ecs->table('order_goods') .
                        " WHERE order_id = '$order[order_id]' " .
                        " AND is_real = 1";
                if ($db->getOne($sql) <= 0)
                {
                    /* 修改订单状态 */
                    update_order($order['order_id'], array('shipping_status' => SS_SHIPPED, 'shipping_time' => gmtime()));

                    /* 如果订单用户不为空，计算积分，并发给用户；发红包 */
                    if ($order['user_id'] > 0)
                    {
                        /* 取得用户信息 */
                        $user = user_info($order['user_id']);

                        /* 计算并发放积分 */
                        $integral = integral_to_give($order);
                        log_account_change($order['user_id'], 0, 0, intval($integral['rank_points']), intval($integral['custom_points']), sprintf($_LANG['order_gift_integral'], $order['order_sn']));

                        /* 发放红包 */
                        send_order_bonus($order['order_id']);
                    }
                }
            }
        }

    }

    /* 清空购物车 */
    clear_cart_1($flow_type);
    /* 清除缓存，否则买了商品，但是前台页面读取缓存，商品数量不减少 */
    //clear_all_files();

    /* 插入支付日志 */
    $order['log_id'] = insert_pay_log($new_order_id, $order['order_amount'], PAY_ORDER);

    /* 取得支付信息，生成支付代码 */
    if ($order['order_amount'] > 0)
    {
        $payment = payment_info($order['pay_id']);

        include_once('includes/modules/payment/' . $payment['pay_code'] . '.php');

        $pay_obj    = new $payment['pay_code'];

        $pay_online = $pay_obj->get_code($order, unserialize_config($payment['pay_config']));

        $order['pay_desc'] = $payment['pay_desc'];

        $smarty->assign('pay_online', $pay_online);
    }
    if(!empty($order['shipping_name']))
    {
        $order['shipping_name']=trim(stripcslashes($order['shipping_name']));
    }

    /* 订单信息 */
    $smarty->assign('order',      $order);
    $smarty->assign('total',      $total);
    $smarty->assign('goods_list', $cart_goods);
    $smarty->assign('order_submit_back', sprintf($_LANG['order_submit_back'], $_LANG['back_home'], $_LANG['goto_user_center'])); // 返回提示

    user_uc_call('add_feed', array($order['order_id'], BUY_GOODS)); //推送feed到uc
    unset($_SESSION['flow_consignee']); // 清除session中保存的收货人信息
    unset($_SESSION['flow_order']);
    unset($_SESSION['direct_shopping']);
	$smarty->assign('step',            $_REQUEST['step']);
	assign_dynamic('shopping_flow');
	$smarty->display('flow.dwt');
}









?>