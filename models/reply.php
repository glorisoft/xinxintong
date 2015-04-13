<?php
class reply_model extends TMS_MODEL {
    /**
     *
     */
    private function baseUrl() 
    {
        $url = "http://" . $_SERVER['HTTP_HOST'];
        //$port = $_SERVER["SERVER_PORT"];
        //$port != '80' && $port != '443'  && $url .= ':' . $port;
        return $url;
    }
    /**
     * 获得父公众号的ID
     */
    private function getParentMpid($mpid)
    {
        $q = array(
            'parent_mpid',
            'xxt_mpaccount',
            "mpid='$mpid'"
        );

        return $this->query_val_ss($q);
    }
    /**
     * 公众号是否支持根据文章编码检索
     */
    public function canCodesearch($mpid)
    {
        $q = array(
            'keyword',
            'xxt_text_call_reply',
            "mpid='$mpid' and matter_type='Inner' and matter_id='7'"
        );
        $k = $this->query_val_ss($q);

        return $k;
    }
    /**
     * 公众号是否支持根据活动编码检索
     */
    public function canActivityCodesearch($mpid)
    {
        $q = array(
            'keyword',
            'xxt_text_call_reply',
            "mpid='$mpid' and matter_type='Inner' and matter_id='8'"
        );
        $k = $this->query_val_ss($q);

        return $k;
    }
    /**
     * 根据menu key获得响应素材
     *
     * todo 代码的逻辑有问题，如果找不到回复信息怎么办？
     *
     * return array(素材的类型，素材的ID)
     */
    public function menu_call($mpid, $key) 
    {
        $q = array(
            'matter_type,matter_id,access_control,authapis',
            'xxt_menu_reply',
            "mpid='$mpid' and menu_key='$key' and published='Y'"
        );
        $q2['o'] = 'version desc';
        $q2['r']['o'] = '0'; 
        $q2['r']['l'] = '1'; 

        if ($cr = $this->query_objs_ss($q, $q2)) {
            return $cr[0];
        } else
            return false;
    }
    /**
     * 根据scene_id获得响应素材
     *
     * return array(素材的类型，素材的ID)
     */
    public function qrcode_call($mpid, $scene_id) 
    {
        $q[] = 'id,matter_type,matter_id,expire_at';
        $q[] = 'xxt_qrcode_call_reply';
        $q[] = "mpid='$mpid' and scene_id=$scene_id";

        $cr = $this->query_obj_ss($q);

        return $cr;
    }
    /**
     * 查找文本消息回复
     *
     * 返回回复对象
     *
     */
    public function text_call($mpid, $text) 
    {
        /**
         * mappings of text call and reply
         */
        $q = array(
            'id,keyword,match_mode,matter_type,matter_id,access_control,authapis',
            'xxt_text_call_reply',
        );
        /**
         * 如果存在父账号，优先从父账号中查找回复定义
         */
        if ($pmpid = $this->getParentMpid($mpid)) {
            $q[2] = "mpid='$pmpid'";
            $mps = $this->query_objs_ss($q);
            /**
             * match mapping.
             */
            $reply = false;
            foreach ($mps as $mp) {
                if ($mp->match_mode == 'full' && $text == $mp->keyword) {
                    $reply = $mp; 
                    break;
                }else if ($mp->match_mode == 'cmd' && preg_match('/^'.preg_quote($mp->keyword).'.?/i', $text) === 1) {
                    $reply = $mp; 
                    break;
                }
            }
            if ($reply) return $reply;
        }
        /**
         * 当前账号
         */
        $q[2] = "mpid='$mpid'";
        $mps = $this->query_objs_ss($q);
        /**
         * match mapping.
         */
        $reply = false;
        foreach ($mps as $mp) {
            if ($mp->match_mode == 'full' && $text == $mp->keyword) {
                $reply = $mp; 
                break;
            }else if ($mp->match_mode == 'cmd' && preg_match('/^'.preg_quote($mp->keyword).'.?/i', $text) === 1) {
                $reply = $mp; 
                break;
            }
        }
        return $reply;
    }
    /**
     * 关注回复素材
     */
    public function other_call($mpid,$name)
    {
        $p = array(
            'matter_type,matter_id',
            'xxt_other_call_reply',
            "mpid='$mpid' and name='$name'"
        );
        if ($reply = $this->query_obj_ss($p)) {
            if (empty($reply->matter_type) || empty($reply->matter_id))
                return false;
            else
                return $reply;
        }
        return false;
    }
    /**
     * 拼接URL中的参数
     * todo 应该挪到reply_model中
     */
    public function spliceParams($mpid, &$params, $mid=null, $src=null, $openid=null) 
    {
        $pairs = array();
        foreach ($params as $p) {
            switch($p->pvalue)
            {
            case '{{mpid}}':
                $v = $mpid;
                break;
            case '{{src}}':
                $v = $src;
                break;
            case '{{openid}}':
                $v = $openid;
                break;
            case '{{authed_identity}}':
                if (empty($mid))
                    $q = array(
                        'authed_identity',
                        'xxt_fans f,xxt_member m',
                        "f.mpid='$mpid' and m.forbidden='N' and f.mpid=m.mpid and f.src='$src' and f.openid='$openid' and f.fid=m.fid and authapi_id=$p->authapi_id"
                    );
                else
                    $q = array(
                        'authed_identity',
                        'xxt_member',
                        "mpid='$mpid' and m.forbidden='N' and mid='$mid' and authapi_id=$p->authapi_id"
                    );
                if (!($v = $this->query_val_ss($q))) {
                    $v = '';
                }
                break;
            default:
                $v = $p->pvalue;
            }
            $pairs[] = "$p->pname=$v";
        }
        $spliced = implode('&', $pairs);

        return $spliced;
    }
    /**
     * 
     * 获得素材的访问链接
     *
     * $runningMpid 当前正在运行的公众号。因为素材有可能属于父账号，所以不能素材的mpid和当前正在运行的mpid不一定一直 
     * $matter link|article|channel|news (id,type)
     * $openid
     * $src
     */
    public function getMatterUrl($runningMpid, $matter, $openid=null, $src=null) 
    {
        if (isset($matter->type) && lcfirst($matter->type) === 'link' && isset($matter->urlsrc)) {
            /**
             * link
             */
            switch ($matter->urlsrc) {
            case 0: // external link
                if ($matter->open_directly === 'Y') {
                    $url = $matter->url;
                    $q = array(
                        'pname,pvalue,authapi_id',
                        'xxt_link_param',
                        "link_id=$matter->id"
                    );
                    if ($params = $this->query_objs_ss($q)) {
                        $url .= (strpos($url, '?') === false) ? '?':'&';
                        $url .= $this->spliceParams($runningMpid, $params, null, $src, $openid);
                    }
                    if (preg_match('/^(http:|https:)/', $url) === 0)
                        $url = 'http://'.$url;
                    return $url;
                } else
                    $url = "?mpid=$runningMpid&id=$matter->id&type=link";
                break;
            case 1: // news
                $url = "?mpid=$runningMpid&type=news&id=".$matter->url;
                break;
            case 2: // channel
                $url = "?mpid=$runningMpid&type=channel&id=".$matter->url;
                break;
            default:
                die('unknown link urlsrc.');
            }
        } else if (isset($matter->type) && in_array(lcfirst($matter->type), array('activity','lottery','discuss'))) {
            /**
             * 活动
             */
            $url = 'http://'.$_SERVER['HTTP_HOST'];
            switch (lcfirst($matter->type)) {
            case 'activity':
                $url .= "/rest/activity/enroll?mpid=$runningMpid&aid=".(empty($matter->id) ? $matter->aid : $matter->id);
                break;
            case 'lottery':
                $url .= "/rest/activity/lottery?mpid=$runningMpid&lid=".(empty($matter->id) ? $matter->lid : $matter->id);
                break;
            case 'discuss':
                $url .= "/rest/activity/discuss?mpid=$runningMpid&wid=".(empty($matter->id) ? $matter->wid : $matter->id);
                break;
            }
            return $url;
        } else { 
            /**
             * article,news,channel
             */
            $url = "?mpid=$runningMpid&id=$matter->id&type=";
            $url .= isset($matter->type) ? strtolower($matter->type) : "article";
        }
        /**
         * 返回素材的打开链接
         */
        $url = $this->baseUrl()."/rest/mi/matter".$url;
        if (!empty($openid) && !empty($src))
            $url .= "&openid=$openid&src=$src";

        return $url;
    }
}
