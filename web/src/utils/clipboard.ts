export async function copyText(text: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error('当前环境不支持剪贴板写入')
  }

  await navigator.clipboard.writeText(text)
}
