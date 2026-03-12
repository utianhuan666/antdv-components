<docs lang="zh-CN">
带统计区域的列表页骨架屏，通过 statistic 设置统计列数。
</docs>

<docs lang="en-US">
List page skeleton with statistic area. Set column count via statistic prop.
</docs>

<template>
  <div style="background: #fafafa; padding: 24px;">
    <ProSkeleton :statistic="2" type="list" />
  </div>
</template>
