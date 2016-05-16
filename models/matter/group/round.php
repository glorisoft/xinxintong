<?php
namespace matter\group;

class round_model extends \TMS_MODEL {
	/**
	 * 创建轮次
	 */
	public function &create($app, $prototype = array()) {
		$targets = isset($prototype['targets']) ? $this->toJson($prototype['targets']) : '[]';
		$round = array(
			'aid' => $app,
			'round_id' => uniqid(),
			'create_at' => time(),
			'title' => isset($prototype['title']) ? $prototype['title'] : '新分组',
			'times' => isset($prototype['times']) ? $prototype['times'] : 0,
			'targets' => $targets,
		);
		$this->insert('xxt_group_round', $round, false);

		$round = (object) $round;

		return $round;
	}
	/**
	 * 获得抽奖的轮次
	 *
	 * @param string $app
	 * @param array $options
	 */
	public function &find($appId, $options = array()) {
		$fields = isset($options['fields']) ? $options['fields'] : '*';
		$q = array(
			$fields,
			'xxt_group_round',
			"aid='$appId'",
		);
		$rounds = $this->query_objs_ss($q);

		return $rounds;
	}
}