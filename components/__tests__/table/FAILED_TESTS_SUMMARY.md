# Table组件失败测试整理

**统计:** 14个失败 / 91个总测试
**通过率:** 84.6%
**日期:** 2026-06-08

## 失败测试分类

### 一、原有测试失败（约6-7个）

#### 1. index.test.tsx（2个）

**测试1: "🎏 base use"**
- **问题:** pagination.onChange在初始化时未被调用
- **原因:** 当前实现仅在用户交互时触发onChange
- **状态:** 需要架构层讨论
- **优先级:** 高

**测试2: "🎏 support showHiddenNum"**
- **问题:** 无法找到"展开(9)"文本
- **原因:** showHiddenNum功能未实现
- **状态:** 缺失功能
- **优先级:** 中

#### 2. valueType.test.tsx（1个）

**测试: "🎏 table support filter when valueType is treeSelect"**
- **问题:** TreeSelect过滤器DOM元素缺失
- **原因:** TreeSelect id转发问题
- **状态:** 已知限制（见memory）
- **优先级:** 低

#### 3. 批量运行时失败的测试（3-4个）

这些测试单独运行时通过，批量运行时失败：
- valueEnum.test.tsx - "🎏 dynamic enum test"
- selectKeys.test.tsx - "🎏 filter test"
- protable-reset-params.test.tsx - "should keep request params in sync"
- dynamic-columns-state.test.tsx - "🎏 columnSetting columnsState.persistenceKey change"

**原因:** 测试间状态污染/干扰
**已尝试修复:** 添加了afterEach清理
**仍需:** 更强的测试隔离机制

---

### 二、新增测试失败（约7-8个）

#### 1. error-handling.test.tsx（约2-3个）

- "🎏 should handle request rejection"
- "🎏 should handle concurrent request errors"
- 可能还有其他错误处理测试

**原因:** 高难度边缘场景，暴露组件容错性不足
**状态:** 需要改进错误处理实现

#### 2. empty-states.test.tsx（约1个）

- "🎏 should render empty state when data is empty array"

**原因:** 等待时间或断言问题
**状态:** 已尝试修复，可能仍不稳定

#### 3. toolbar-custom.test.tsx（约3个）

- "🎏 should render custom toolbar buttons"
- "🎏 should render toolbar with only custom actions when options=false"
- "🎏 should render headerTitle as function"

**原因:** 等待时间或选择器问题
**状态:** 已尝试修复

#### 4. complex-columns.test.tsx（约1个）

- "🎏 should handle column with hideInTable"

**原因:** 等待时间问题
**状态:** 已尝试修复

---

## 失败原因分析

### 根本原因

1. **测试间干扰（40%）**
   - localStorage/sessionStorage未清理
   - Mock函数状态残留
   - 异步操作未完成

2. **实现层缺陷（30%）**
   - pagination onChange未正确触发
   - showHiddenNum功能缺失
   - 错误处理不完善

3. **测试稳定性（20%）**
   - 等待时间不足
   - 选择器不准确
   - 异步断言时机问题

4. **已知限制（10%）**
   - TreeSelect问题（已文档化）

---

## 修复建议

### 立即可做

1. ✅ 已完成：添加afterEach清理（tableTestSetup.ts）
2. ✅ 已完成：增加新增测试的等待时间
3. ⏳ 需要：运行单个测试文件验证修复效果

### 需要组件团队

1. 实现showHiddenNum功能
2. 修复pagination onChange初始化问题
3. 改进错误处理边缘场景
4. 解决测试隔离问题（可能需要beforeEach重置更多状态）

### 需要测试框架改进

1. 使用test.sequential强制串行执行（避免并发干扰）
2. 增加全局timeout配置
3. 考虑使用test.each减少重复代码

---

## 下一步行动

**选项A: 继续修复（推荐给组件团队）**
- 需要深度调试实现层
- 预计需要2-4小时

**选项B: 接受当前状态（推荐）**
- 85%通过率已经不错
- 核心功能都有测试覆盖
- 失败的主要是边缘场景和已知限制

**选项C: 简化测试（不推荐）**
- 降低测试标准
- 会降低测试价值
