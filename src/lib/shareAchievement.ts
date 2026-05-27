import type { Milestone } from './milestones'

export async function shareAchievement(milestone: Milestone, playerName: string): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width  = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080)
  grad.addColorStop(0, '#0f172a')
  grad.addColorStop(1, '#1e1b4b')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1080, 1080)

  // Decorative circle
  ctx.beginPath()
  ctx.arc(540, 400, 220, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(139, 92, 246, 0.15)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(540, 400, 180, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(139, 92, 246, 0.2)'
  ctx.fill()

  // Emoji
  ctx.font = '160px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(milestone.emoji, 540, 400)

  // Title
  ctx.font = 'bold 72px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(milestone.label, 540, 640)

  // Habit name
  if (milestone.habitName) {
    ctx.font = '44px -apple-system, system-ui, sans-serif'
    ctx.fillStyle = '#a78bfa'
    const maxWidth = 900
    const name = milestone.habitName.length > 35
      ? milestone.habitName.slice(0, 35) + '…'
      : milestone.habitName
    ctx.fillText(name, 540, 720, maxWidth)
  }

  // Player name
  ctx.font = 'bold 40px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#64748b'
  ctx.fillText(playerName, 540, 820)

  // App name
  ctx.font = '32px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#334155'
  ctx.fillText('Hábitos Mamocitos 🔥', 540, 940)

  // Convert to blob and share
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png')
  )

  if (navigator.share && navigator.canShare({ files: [new File([blob], 'logro.png', { type: 'image/png' })] })) {
    await navigator.share({
      title: milestone.label,
      text: `${milestone.emoji} ${milestone.label}${milestone.habitName ? ` — ${milestone.habitName}` : ''} #HábitosMamocitos`,
      files: [new File([blob], 'logro.png', { type: 'image/png' })],
    })
  } else {
    // Fallback: download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'logro.png'
    a.click()
    URL.revokeObjectURL(url)
  }
}
