---
title: ProDescriptions
---

ProDescriptions renders a single detail record with `antdv-next` Descriptions and supports Pro Components style `columns`, `request`, `valueType`, `valueEnum`, and inline editing.

## Basic

<demo src="./demo/basic.vue">Basic</demo>

## Request

<demo src="./demo/request.vue">Request</demo>

## Editable

<demo src="./demo/editable.vue">Editable</demo>

## API

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| `columns` | Description item schema | `ProDescriptionsColumn[]` | `[]` |
| `dataSource` | Current detail record | `Record<string, any>` | - |
| `request` | Request detail data | `(params) => Promise<{ data?: T; success?: boolean }>` | - |
| `params` | Request params; changes trigger reload | `Record<string, unknown>` | - |
| `actionRef` | Exposes `reload`, `dataSource`, `setDataSource`, and editable helpers | `Ref<ProDescriptionsActionType>` | - |
| `editable` | Inline editing config | `RowEditableConfig` | - |
| `emptyText` | Empty value placeholder | `VNodeChild` | `-` |

