<?php
class zCoreSwoole
{
    private $server;
    protected $serverMap = [];//服务映射

    public function __construct() {
    }

    public function createServer($key) {
        $this->server = new swoole_server("127.0.0.1", 9501, SWOOLE_BASE, SWOOLE_SOCK_TCP);
    }
}
