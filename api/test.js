/* 诊断 — 用正确的 URL 格式测试不同模型 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.HF_API_KEY;
  const BASE = 'https://router.huggingface.co/hf-inference/models';

  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'stabilityai/stable-diffusion-2-1',
    'stabilityai/stable-diffusion-3.5-medium',
    'CompVis/stable-diffusion-v1-4',
  ];

  const results = {};

  for (const model of models) {
    try {
      const resp = await fetch(`${BASE}/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: { num_inference_steps: 1, width: 64, height: 64 },
        }),
        signal: AbortSignal.timeout(20000),
      });
      const text = await resp.text();
      results[model.split('/').pop()] = {
        status: resp.status,
        ok: resp.ok,
        body: text.slice(0, 250),
      };
    } catch (err) {
      results[model.split('/').pop()] = { error: err.message };
    }
  }

  res.status(200).json(results);
}
