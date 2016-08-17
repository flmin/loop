# loop
v1.0.0.0817
是生成图片滚动的js插件
鼠标悬浮滚动效果取消.

将获取的dom元素作为对象
var loop = new loopImg( document.getElementById('loopImg') );

开启定时滚动.
loop.timer();
滚动至下一个
loop.showNext();
滚动至上一个
loop.showPrev();
根据下标的变更来滚动,如1->3
int last 是滚动之前的图片下标
int now 是滚动之后的图片下标

暂不支持自定义滚动速度,滚动方式.
我要继续的东西还很多(｀・ω・´)
