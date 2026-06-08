/* 诊断 — 测试 router.huggingface.co 的不同路径格式 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.HF_API_KEY;
  const body = JSON.stringify({
    inputs: 'test pattern',
    parameters: { num_inference_steps: 1, width: 64, height: 64 },
  });

  const tests = [
    { label: 'models', url: 'https://router.huggingface.co/models/runwayml/stable-diffusion-v1-5' },
    { label: 'hf-inference', url: 'https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5' },
    { label: 'api', url: 'https://router.huggingface.co/api/models/runwayml/stable-diffusion-v1-5' },
    { label: '直接', url: 'https://router.huggingface.co/runwayml/stable-diffusion-v1-5' },
    { label: 'v1', url: 'https://router.huggingface.co/v1/models/runwayml/stable-diffusion-v1-5' },
  ];

  const results = {};

  for (const t of tests) {
    try {
      const resp = await fetch(t.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body,
        signal: AbortSignal.timeout(15000),
      });
      const text = await resp.text();
      results[t.label] = { status: resp.status, body: text.slice(0, 250) };
    } catch (err) {
      results[t.label] = { error: err.message };
    }
  }

  res.status(200).json(results);
}
