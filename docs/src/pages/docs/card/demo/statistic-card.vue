<docs lang="zh-CN">
StatisticCard 用于承载数字指标和趋势信息。
</docs>

<template>
  <StatisticCard
    title="销售额"
    :statistic="{ title: '本月销售额', value: 128930, suffix: '元' }"
    footer="较上月增长 12%"
  />
</template>
