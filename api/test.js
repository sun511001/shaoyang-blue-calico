/* 诊断接口 — 测试网络连通性 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.HF_API_KEY;
  const results = {};

  // 1. 外部网络连通性（httpbin 通用测试）
  try {
    const resp = await fetch('https://httpbin.org/get', {
      signal: AbortSignal.timeout(10000),
    });
    results.external = { ok: resp.ok, status: resp.status };
  } catch (err) {
    results.external = { ok: false, error: err.message };
  }

  // 2. HuggingFace 首页连通性
  try {
    const resp = await fetch('https://huggingface.co', {
      signal: AbortSignal.timeout(10000),
    });
    results.hfSite = { ok: resp.ok, status: resp.status };
  } catch (err) {
    results.hfSite = { ok: false, error: err.message };
  }

  // 3. HuggingFace API 连通性
  try {
    const resp = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Vercel-Serverless/1.0',
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: { num_inference_steps: 1, width: 64, height: 64 },
        }),
        signal: AbortSignal.timeout(20000),
      },
    );
    const text = await resp.text();
    results.hfApi = { ok: resp.ok, status: resp.status, body: text.slice(0, 300) };
  } catch (err) {
    results.hfApi = { ok: false, error: err.message, cause: err.cause?.message || '' };
  }

  res.status(200).json(results);
}
