/* 诊断接口 — 测试 HuggingFace API 连通性 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.HF_API_KEY;

  // 测试模型列表
  const models = [
    'runwayml/stable-diffusion-v1-5',
    'stabilityai/stable-diffusion-2-1',
    'CompVis/stable-diffusion-v1-4',
  ];

  const results = {};

  for (const model of models) {
    try {
      const resp = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: 'test image, blue and white pattern',
            parameters: {
              num_inference_steps: 1,
              width: 64,
              height: 64,
            },
          }),
          signal: AbortSignal.timeout(15000),
        },
      );

      const text = await resp.text();
      results[model] = {
        status: resp.status,
        ok: resp.ok,
        bodyPreview: text.slice(0, 300),
      };
    } catch (err) {
      results[model] = {
        status: 'error',
        ok: false,
        bodyPreview: err.message,
      };
    }
  }

  res.status(200).json({
    hfKeySet: !!apiKey,
    hfKeyPreview: apiKey ? apiKey.slice(0, 5) + '...' + apiKey.slice(-4) : '未设置',
    nodeVersion: process.version,
    results,
  });
}
