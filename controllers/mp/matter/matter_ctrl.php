<?php
namespace mp\matter;

require_once dirname(dirname(__FILE__)).'/mp_controller.php';

class matter_ctrl extends \mp\mp_controller {
    /**
     *
     */
    public function __construct() 
    {
        parent::__construct();
        
        $prights = $this->model('mp\permission')->hasMpRight(
            $this->mpid, 
            array(
                'matter_article',
                'matter_text',
                'matter_news',
                'matter_channel',
                'matter_link',
                'matter_tmplmsg'
            ), 
            'read'
        );

        $entries = array();
        
        (true === $prights || $prights['matter_article']['read_p'] === 'Y') && $entries['articles'] = array('title'=>'单图文');
        (true === $prights || $prights['matter_text']['read_p'] === 'Y') && $entries['texts'] = array('title'=>'文本');
        (true === $prights || $prights['matter_news']['read_p'] === 'Y') && $entries['news'] = array('title'=>'多图文');
        (true === $prights || $prights['matter_channel']['read_p'] === 'Y') && $entries['channels'] = array('title'=>'频道');
        (true === $prights || $prights['matter_link']['read_p'] === 'Y') && $entries['links'] = array('title'=>'链接');
        (true === $prights || $prights['matter_tmplmsg']['read_p'] === 'Y') && $entries['tmplmsgs'] = array('title'=>'模板消息');
        
        \TPL::assign('matter_view_entries', $entries);
    }
    public function get_access_rule()
    {
        $rule_action['rule_type'] = 'white';
        $rule_action['actions'][] = 'hello';
        return $rule_action;
    }
    /**
     * 设置访问白名单
     */
    public function setAcl_action($id)
    {
        if (empty($id))
            die('parameters invalid.');

        $acl = $this->getPostJson();
        if (isset($acl->id)) {
            $u['identity'] = $acl->identity;
            empty($acl->idsrc) && $u['label'] = $acl->identity;
            $rst = $this->model()->update('xxt_matter_acl', $u, "id=$acl->id");
            return new \ResponseData($rst);
        } else {
            $i['mpid'] = $this->mpid;
            $i['matter_type'] = $this->getMatterType();
            $i['matter_id'] = $id;
            $i['identity'] = $acl->identity;
            $i['idsrc'] = $acl->idsrc;
            $i['label'] = isset($acl->label) ? $acl->label : '';
            $i['id'] = $this->model()->insert('xxt_matter_acl', $i, true);

            return new \ResponseData($i);
        }
    }
    /**
     * 删除访问控制列表
     * $acl aclid
     */
    public function removeAcl_action($acl)
    {
        $rst = $this->model()->delete(
            'xxt_matter_acl', 
            "mpid='$this->mpid' and id=$acl"
        );
        return new \ResponseData($rst);
    }
}
