/* ============================================================
   Vercel Serverless 函数 — HuggingFace API 代理
   前端调用 /api/generate，API Key 仅存在于服务端环境变量
   ============================================================ */

// 强制使用 Node.js 运行时（支持 Buffer）
export const config = {
  runtime: 'nodejs18.x',
};

// 模型：SD v1.5 — 质量稳定，HuggingFace 免费 API 可用
const HF_MODEL = 'runwayml/stable-diffusion-v1-5';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: '请提供 prompt 参数' });
  }

  // 检查 API Key 是否配置
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    console.error('[AIGC] HF_API_KEY 环境变量未设置');
    return res.status(500).json({
      error: '服务器未配置 HuggingFace API Key，请在 Vercel 环境变量中设置 HF_API_KEY',
      debug: 'env_missing',
    });
  }

  const trimmedPrompt = prompt.slice(0, 500);
  console.log('[AIGC] 生成请求:', trimmedPrompt.slice(0, 80));

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: trimmedPrompt,
        parameters: {
          negative_prompt:
            'blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature',
          num_inference_steps: 25,
          guidance_scale: 7.5,
          width: 512,
          height: 512,
        },
      }),
    });

    // 模型冷启动 / 加载中
    if (response.status === 503) {
      const text = await response.text();
      console.log('[AIGC] 模型加载中:', text.slice(0, 150));
      return res.status(503).json({
        error: 'AI 模型正在加载中，请等待约 20-60 秒后重试',
        retryable: true,
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AIGC] HF API 错误:', response.status, errText.slice(0, 300));

      let hint = '';
      if (errText.includes('Authorization header')) {
        hint = '（HF_API_KEY 无效或未配置）';
      } else if (errText.includes('not found') || errText.includes('404')) {
        hint = '（模型不存在或名称错误）';
      } else if (errText.includes('rate') || errText.includes('limit')) {
        hint = '（API 调用频率超限，请稍后再试）';
      }

      return res.status(response.status).json({
        error: `HuggingFace API 错误 (${response.status}): ${errText.slice(0, 250)}${hint}`,
        retryable: response.status >= 500 || response.status === 429,
      });
    }

    // 返回的是图片二进制
    const arrayBuf = await response.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuf);
    // 使用纯 JS 转 base64（兼容所有 Vercel 运行时）
    let base64 = '';
    const chunk = 8192;
    for (let i = 0; i < uint8.length; i += chunk) {
      const slice = uint8.subarray(i, i + chunk);
      base64 += String.fromCharCode.apply(null, slice);
    }
    base64 = btoa(base64);
    const contentType = response.headers.get('content-type') || 'image/png';

    console.log('[AIGC] 生成成功, 图片大小:', (base64.length / 1024).toFixed(1), 'KB');

    return res.status(200).json({
      image: `data:${contentType};base64,${base64}`,
      model: HF_MODEL,
    });
  } catch (err) {
    console.error('[AIGC] fetch 异常:', err.message);
    return res.status(500).json({
      error: `请求 HuggingFace 失败: ${err.message}`,
      hint: '可能是网络超时或 DNS 解析失败',
      retryable: true,
    });
  }
}
