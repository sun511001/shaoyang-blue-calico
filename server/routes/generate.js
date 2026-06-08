/* ============================================================
   AIGC 纹样生成路由 — HuggingFace API 代理
   ============================================================ */

const { Router } = require('express');
const { authOptional } = require('../middleware');

const router = Router();

const HF_MODEL = 'black-forest-labs/FLUX.1-schnell';
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

// POST /api/generate
router.post('/', authOptional, async (req, res) => {
  const { prompt, style } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: '请提供 prompt 参数' });
  }

  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器未配置 HF_API_KEY' });
  }

  const trimmed = prompt.slice(0, 500);

  try {
    const resp = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: trimmed,
        parameters: {
          width: 512,
          height: 512,
          num_inference_steps: 4,
          guidance_scale: 0,
        },
      }),
    });

    if (resp.status === 503) {
      return res.status(503).json({
        error: 'AI 模型正在加载中，请等待约 20-60 秒后重试',
        retryable: true,
      });
    }

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({
        error: `HuggingFace API (${resp.status}): ${errText.slice(0, 250)}`,
        retryable: resp.status >= 500 || resp.status === 429,
      });
    }

    const arrayBuf = await resp.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuf);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64 = btoa(binary);
    const contentType = resp.headers.get('content-type') || 'image/jpeg';

    return res.json({
      image: `data:${contentType};base64,${base64}`,
      model: HF_MODEL,
      prompt: trimmed,
      style: style || 'blue_calico',
    });
  } catch (err) {
    return res.status(500).json({
      error: `请求失败: ${err.message}`,
      retryable: true,
    });
  }
});

module.exports = router;
