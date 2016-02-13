<?php
namespace pl\fe\user;
/**
 * 平台管理端用户认证
 */
class auth extends \TMS_CONTROLLER {

	public function get_access_rule() {
		$rule_action = array(
			'rule_type' => 'black',
			'actions' => array(),
		);

		return $rule_action;
	}
	/**
	 * 进入平台管理页面用户身份验证页面
	 */
	public function index_action() {
		$path = TMS_APP_API_PREFIX . '/pl/fe/user/login';
		$path .= '?callback=' . urlencode(TMS_APP_API_PREFIX . '/pl/fe/user/auth/passed');
		$this->redirect($path);
	}
	/**
	 * 验证通过后的回调页面
	 */
	public function passed_action($uid) {
		$modelUsr = $this->model('mp\user');
		$fromip = $this->client_ip();
		$modelUsr->update_last_login($uid, $fromip);
		/**
		 * record account into session and cookie.
		 */
		$act = $modelUsr->byId($uid);
		/**
		 * 记录客户端登陆状态
		 */
		\TMS_CLIENT::account($act);
		/**
		 * 跳转到缺省页
		 */
		$this->redirect(TMS_APP_API_PREFIX . TMS_APP_AUTHED);
	}
}