import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { DrawerForm, ModalForm, ProForm } from '../../form/layouts'

describe('form ssr compatibility', () => {
  it('renders form layouts through vue server renderer', async () => {
    await expect(renderToString(createSSRApp(() => <ProForm />))).resolves.toBeDefined()
    await expect(renderToString(createSSRApp(() => <ModalForm />))).resolves.toBeDefined()
    await expect(renderToString(createSSRApp(() => <DrawerForm />))).resolves.toBeDefined()
  })
})
