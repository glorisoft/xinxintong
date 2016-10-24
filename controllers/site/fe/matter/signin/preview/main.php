<?php
namespace site\fe\matter\signin\preview;

/**
 * 签到活动预览
 */
class main extends \TMS_CONTROLLER {
	/**
	 * 返回活动页
	 *
	 * 活动是否只向会员开放，如果是要求先成为会员，否则允许直接
	 * 如果已经报过名如何判断？
	 * 如果已经是会员，则可以查看和会员的关联
	 * 如果不是会员，临时分配一个key，保存在cookie中，允许重新报名
	 *
	 * $siteid 因为活动有可能来源于父账号，因此需要指明活动是在哪个公众号中进行的
	 * $appid
	 * $page 要进入活动的哪一页
	 * $ek 登记记录的id
	 * $shareid 谁进行的分享
	 * $mocker 用于测试，模拟访问用户
	 * $code OAuth返回的code
	 *
	 */
	public function index_action($site, $app, $round = null, $shareby = '', $page = '', $ek = '', $ignoretime = 'N') {
		empty($site) && $this->outputError('没有指定站点ID');
		empty($app) && $this->outputError('签到活动ID为空');

		$modelApp = $this->model('matter\signin');
		$app = $modelApp->byId($app, ['cascade' => 'Y']);
		if ($app === false) {
			$this->outputError('指定的签到活动不存在，请检查参数是否正确');
		}

		/* 判断活动是否可用 */
		if ($app->state === '3') {
			$this->outputError('签到已经结束', $app->title);
		}
		if ($ignoretime === 'N') {
			$activeRound = $this->model('matter\signin\round')->getActive($site, $app->id);
			if (!$activeRound) {
				$this->outputError('签到还没有开始', $app->title);
			} else if (!empty($round) && $round !== $activeRound->rid) {
				$this->outputError('您签到的场次或时间不正确', $app->title);
			}
		}
		/* 计算打开哪个页面 */
		if (empty($page)) {
			/*没有指定页面*/
			$oPage = $this->_defaultPage($this->who, $site, $app, true);
		} else {
			foreach ($app->pages as $p) {
				if ($p->name === $page) {
					$oPage = &$p;
					break;
				}
			}
		}
		empty($oPage) && $this->outputError('没有可访问的页面');
		/* 返回签到活动页面 */
		\TPL::assign('title', $app->title);
		\TPL::output('/site/fe/matter/signin/preview');
		exit;
	}
	/**
	 * 当前用户的缺省页面
	 */
	private function &_defaultPage(&$user, $siteId, &$app, $redirect = false) {
		$page = $this->checkEntryRule($user, $siteId, $app, $redirect);
		$oPage = null;
		foreach ($app->pages as $p) {
			if ($p->name === $page) {
				$oPage = $p;
				break;
			}
		}
		if (empty($oPage)) {
			if ($redirect === true) {
				$this->outputError('指定的页面[' . $page . ']不存在');
				exit;
			}
		}

		return $oPage;
	}
	/**
	 * 返回签到登记记录
	 *
	 * @param string $siteid
	 * @param string $appid
	 * @param string $page page's name
	 */
	public function get_action($site, $app, $page = null) {
		$params = [];

		// 签到活动定义
		$signinApp = $this->modelApp->byId($app);
		$params['app'] = &$signinApp;

		// 站点页面设置
		if ($signinApp->use_site_header === 'Y' || $signinApp->use_site_footer === 'Y') {
			$params['site'] = $this->model('site')->byId(
				$site,
				['cascaded' => 'header_page_name,footer_page_name']
			);
		}
		// 项目页面设置
		if ($signinApp->use_mission_header === 'Y' || $signinApp->use_mission_footer === 'Y') {
			if ($signinApp->mission_id) {
				$params['mission'] = $this->model('matter\mission')->byId(
					$signinApp->mission_id,
					['cascaded' => 'header_page_name,footer_page_name']
				);
			}
		}

		// 当前访问用户的基本信息
		$user = $this->who;
		$params['user'] = $user;

		// 打开哪个页面？
		if (empty($page)) {
			$oPage = $this->_defaultPage($user, $site, $signinApp);
		} else {
			foreach ($signinApp->pages as $p) {
				if ($p->name === $page) {
					$oPage = &$p;
					break;
				}
			}
		}
		if (empty($oPage)) {
			return new \ResponseError('页面不存在');
		}

		// 页面定义
		$modelPage = $this->model('matter\signin\page');
		$oPage = $modelPage->byId($signinApp->id, $oPage->id, 'Y');
		$params['page'] = $oPage;

		$params['activeRound'] = $this->model('matter\signin\round')->getActive($site, $signinApp->id);

		// 签到记录
		$newForm = false;
		if ($oPage->type === 'I') {
			$options = [
				'fields' => '*',
				'cascaded' => 'Y',
			];
			$modelRec = $this->model('matter\signin\record');
			if (false === ($userRecord = $modelRec->byUser($user, $site, $signinApp, $options))) {
				// 如果关联了报名记录，从报名记录中获得登记信息
				if (!empty($signinApp->enroll_app_id)) {
					$userRecord = $this->_recordByEnroll($signinApp, $user);
				}
			}
			$params['record'] = $userRecord;
		}

		return new \ResponseData($params);
	}
	/**
	 * 从关联的登记活动中获得匹配的数据
	 */
	private function _recordByEnroll(&$signinApp, &$user) {
		$modelEnlRec = $this->model('matter\enroll\record');

		$records = $modelEnlRec->byUser($signinApp->enroll_app_id, $user);
		if (count($records)) {

			$signinRecord = new \stdClass;
			foreach ($records as $record) {
				if ($record->verified === 'Y') {
					$signinRecord->data = json_decode($record->data);
					return $signinRecord;
				}
			}
		}

		return false;
	}
}