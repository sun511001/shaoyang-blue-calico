/* ============================================================
   Vercel Serverless 函数 — HuggingFace API 代理
   前端调用 /api/generate，API Key 仅存在于服务端环境变量
   ============================================================ */

// HuggingFace 免费推理 API 模型
// 可选模型: stabilityai/stable-diffusion-2-1, runwayml/stable-diffusion-v1-5
const HF_MODEL = 'stabilityai/stable-diffusion-2-1';
const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

export default async function handler(req, res) {
  // CORS 头
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

  // 限制 prompt 长度，防止滥用
  const trimmedPrompt = prompt.slice(0, 500);

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: trimmedPrompt,
        parameters: {
          negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature',
          num_inference_steps: 25,
          guidance_scale: 7.5,
          width: 512,
          height: 512,
        },
      }),
    });

    if (!response.ok) {
      // 模型冷启动时会返回 503，提示需要等待
      if (response.status === 503) {
        const text = await response.text();
        const waitTime = text.includes('loading') ? '约 20-60 秒' : '几分钟';
        return res.status(503).json({
          error: `AI 模型正在加载中，请等待${waitTime}后重试`,
          retryable: true,
        });
      }
      const errText = await response.text();
      return res.status(response.status).json({
        error: `HuggingFace API 错误 (${response.status}): ${errText.slice(0, 200)}`,
        retryable: response.status >= 500,
      });
    }

    // HuggingFace 直接返回图片二进制
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';

    return res.status(200).json({
      image: `data:${contentType};base64,${base64}`,
      model: HF_MODEL,
    });
  } catch (err) {
    return res.status(500).json({
      error: `请求失败: ${err.message}`,
      retryable: true,
    });
  }
}
