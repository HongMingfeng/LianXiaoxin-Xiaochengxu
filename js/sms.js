function trim(str) {
	return str.replace(/^\s*(.*?)[\s\n]*$/g, '$1');
}

function getverifycode1(field_id, field_name) {
	
	var mobile = trim(document.getElementById(field_id).value);
	//var mobile = trim($(field_id).value);
	if(mobile == '') {
		alert(field_name+"不能为空！");
		$(field_id).focus();
		return;
	}
	Ajax.call('sms.php?step=getverifycode1&r=' + Math.random(), 'mobile=' + mobile, getverifycode1Response, 'POST', 'JSON');
}

function getverifycode2() {
	var mobile = trim(document.getElementById("mobile").value);
	//var mobile = trim($("mobile").value);
	if(mobile == '') {
		alert("手机号不能为空！");
		$("mobile").focus();
		return;
	}
	Ajax.call('sms.php?step=getverifycode2&r=' + Math.random(), 'mobile=' + mobile, getverifycode2Response, 'POST', 'JSON');
}

function getverifycode1Response(result) {
	if (result.error==0){
		RemainTime();		
	}
	alert(result.message);
}

function getverifycode2Response(result) {
	if (result.error==0){
		RemainTime();		
	}
	alert(result.message);
}

var iTime = parseInt(ztime)-1;
var Account;
function RemainTime(){
	document.getElementById('zphone').disabled = true;
	var iSecond,sSecond="",sTime="";
	if (iTime >= 0){
		iSecond = parseInt(iTime%60);
		iMinute = parseInt(iTime/60)
		if (iSecond >= 0){
			if(iMinute>0){
				sSecond = iMinute + "分" + iSecond + "秒";
			}else{
				sSecond = iSecond + "秒";
			}
		}
		sTime=sSecond;
		if(iTime==0){
			clearTimeout(Account);
			sTime='获取验证码';
			iTime = parseInt(ztime)-1;
			document.getElementById('zphone').disabled = false;
		}else{
			Account = setTimeout("RemainTime()",1000);
			iTime=iTime-1;
		}
	}else{
		sTime='没有倒计时';
	}
	document.getElementById('zphone').value = sTime;
}