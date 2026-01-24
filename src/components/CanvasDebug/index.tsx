import React, { useState, useRef } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface CanvasDebugProps {
  canvasId?: string
}

const CanvasDebug: React.FC<CanvasDebugProps> = ({ canvasId = 'starfield' }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [canvasInfo, setCanvasInfo] = useState<any>(null)

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`].slice(-10))
    console.log(`[DEBUG] ${msg}`)
  }

  const checkCanvasStatus = () => {
    addLog('开始检查Canvas状态...')
    
    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId}`)
      .node((res: any) => {
        if (!res || !res.node) {
          addLog('❌ Canvas node不存在')
          setCanvasInfo({ error: 'Canvas node不存在' })
          return
        }

        const canvas = res.node
        addLog('✅ Canvas node找到')
        addLog(`  canvas.width=${canvas.width}, canvas.height=${canvas.height}`)

        // 检查getContext
        if (typeof canvas.getContext !== 'function') {
          addLog('❌ canvas.getContext不是函数')
          setCanvasInfo({ error: 'getContext不是函数' })
          return
        }

      addLog('✅ canvas.getContext存在')

      // 尝试获取context
      try {
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          addLog('❌ 2D context为null')
          setCanvasInfo({ ...data, error: '2D context为null' })
          return
        }
        addLog('✅ 2D context获取成功')

        // 获取系统信息
        const sysInfo = Taro.getSystemInfoSync()
        const dpr = sysInfo.pixelRatio || 1
        addLog(`  系统信息: dpr=${dpr}, windowWidth=${sysInfo.windowWidth}, windowHeight=${sysInfo.windowHeight}`)

        // 设置Canvas尺寸
        const testWidth = 400
        const testHeight = 300
        canvas.width = testWidth * dpr
        canvas.height = testHeight * dpr
        addLog(`  设置Canvas物理尺寸: ${testWidth * dpr} x ${testHeight * dpr}`)
        
        ctx.scale(dpr, dpr)

        // 清除背景
        addLog('📍 step1: clearRect...')
        ctx.clearRect(0, 0, testWidth, testHeight)
        addLog('  ✓ clearRect完成')

        // 黑色背景（16进制）
        addLog('📍 step2: 黑色背景（16进制）...')
        addLog(`  设置fillStyle前: "${ctx.fillStyle}"`)
        ctx.fillStyle = '#000000'
        addLog(`  设置fillStyle后: "${ctx.fillStyle}"`)
        ctx.fillRect(0, 0, testWidth, testHeight)
        addLog('  ✓ 黑色fillRect完成')

        // 白色直线（16进制）
        addLog('📍 step3: 白色直线（16进制）...')
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(50, 50)
        ctx.lineTo(350, 250)
        ctx.stroke()
        addLog('  ✓ 白线stroke完成')

        // 红色矩形（16进制）
        addLog('📍 step4: 红色矩形（16进制）...')
        addLog(`  设置fillStyle前: "${ctx.fillStyle}"`)
        ctx.fillStyle = '#ff0000'
        addLog(`  设置fillStyle后: "${ctx.fillStyle}"`)
        ctx.fillRect(100, 100, 200, 100)
        addLog('  ✓ 红矩形fillRect完成')

        // 尝试用fillText绘制文字（测试是否任何东西都能显示）
        addLog('📍 step5: 尝试绘制文字...')
        ctx.fillStyle = '#00ff00'
        ctx.font = 'bold 24px Arial'
        ctx.fillText('TEST', 50, 60)
        addLog('  ✓ 文字绘制完成')

        addLog('✅ 所有步骤完成')

        setCanvasInfo({
          success: true,
          dpr,
          contextType: '2d',
          message: '预期：黑底 + 白线 + 红矩形'
        })
      } catch (error) {
        addLog(`❌ 异常: ${error}`)
        setCanvasInfo({ error: String(error) })
      }
    })
    .exec()
  }

  const testDrawCircle = () => {
    addLog('测试绘制白色圆圈...')
    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId}`)
      .node((res: any) => {
        if (!res || !res.node) {
          addLog('❌ Canvas获取失败')
          return
        }

        const canvas = res.node
        const sysInfo = Taro.getSystemInfoSync()
        const dpr = sysInfo.pixelRatio || 1
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          addLog('❌ Context获取失败')
          return
        }

        try {
          ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(150, 150, 50, 0, Math.PI * 2)
          ctx.stroke()
          addLog('✅ 白色圆圈绘制成功')
        } catch (error) {
          addLog(`❌ 绘制失败: ${error}`)
        }
      })
      .exec()
  }

  const clearCanvas = () => {
    addLog('清除Canvas...')
    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId}`)
      .node((res: any) => {
        if (res && res.node) {
          const canvas = res.node
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            addLog('✅ Canvas已清除')
          }
        }
      })
      .exec()
  }

  const clearLogs = () => {
    setLogs([])
    addLog('日志已清空')
  }

  const checkCanvasVisibility = () => {
    addLog('检查Canvas可见性...')
    const query = Taro.createSelectorQuery()
    
    // 获取节点信息和位置
    query.select(`#${canvasId}`)
      .boundingClientRect()
      .exec((res: any) => {
        if (!res || !res[0]) {
          addLog('❌ Canvas未找到')
          return
        }

        const rect = res[0]
        addLog(`Canvas位置信息:`)
        addLog(`  left: ${rect.left}, top: ${rect.top}`)
        addLog(`  宽: ${rect.width}, 高: ${rect.height}`)
        addLog(`  right: ${rect.right}, bottom: ${rect.bottom}`)

        const sysInfo = Taro.getSystemInfoSync()
        addLog(`屏幕信息:`)
        addLog(`  windowWidth: ${sysInfo.windowWidth}`)
        addLog(`  windowHeight: ${sysInfo.windowHeight}`)
        addLog(`  screenWidth: ${sysInfo.screenWidth}`)
        addLog(`  screenHeight: ${sysInfo.screenHeight}`)

        if (rect.width === 0 || rect.height === 0) {
          addLog(`⚠️  Canvas宽或高为0 - 不可见!`)
        } else if (rect.top > sysInfo.windowHeight || rect.left > sysInfo.windowWidth) {
          addLog(`⚠️  Canvas位置超出屏幕范围`)
        } else {
          addLog(`✅ Canvas在屏幕范围内`)
        }
        
        // 再查询 node 信息
        const query2 = Taro.createSelectorQuery()
        query2.select(`#${canvasId}`)
          .node((res2: any) => {
            if (res2 && res2.node) {
              const canvas = res2.node
              addLog(`Canvas节点属性:`)
              addLog(`  node.width: ${canvas.width}`)
              addLog(`  node.height: ${canvas.height}`)
            }
          })
          .exec()
      })
  }

  return (
    <View className="canvas-debug">
      <View className="debug-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Text className="toggle-btn">{isOpen ? '▼' : '▶'} Canvas调试</Text>
      </View>

      {isOpen && (
        <View className="debug-panel">
          {/* Canvas状态 */}
          <View className="debug-section">
            <Text className="section-title">Canvas状态</Text>
            {canvasInfo ? (
              <View className="info-box">
                {canvasInfo.error ? (
                  <Text className="error">❌ {canvasInfo.error}</Text>
                ) : (
                  <>
                    <Text className="success">✅ Canvas正常</Text>
                    <Text>宽: {canvasInfo.width}, 高: {canvasInfo.height}</Text>
                    <Text>DPR: {canvasInfo.dpr}</Text>
                    <Text className="hint">{canvasInfo.message}</Text>
                  </>
                )}
              </View>
            ) : (
              <Text className="hint">点击"检查Canvas"查看状态</Text>
            )}
          </View>

          {/* 按钮组 */}
          <View className="debug-buttons">
            <Button size="mini" onClick={checkCanvasStatus} className="btn-primary">
              检查Canvas
            </Button>
            <Button size="mini" onClick={checkCanvasVisibility} className="btn-info">
              检查可见性
            </Button>
            <Button size="mini" onClick={testDrawCircle} className="btn-warn">
              绘制圆圈
            </Button>
            <Button size="mini" onClick={clearCanvas} className="btn-danger">
              清除Canvas
            </Button>
          </View>

          {/* 日志 */}
          <View className="debug-section">
            <Text className="section-title">日志 ({logs.length})</Text>
            <View className="log-box">
              {logs.map((log, idx) => (
                <Text key={idx} className="log-line">
                  {log}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default CanvasDebug
