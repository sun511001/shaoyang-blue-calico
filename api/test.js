/* 诊断 — 测试 HuggingFace 所有已知 API 域名 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.HF_API_KEY;
  const urls = [
    'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
    'https://router.huggingface.co/models/runwayml/stable-diffusion-v1-5',
    'https://inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
  ];
  const results = {};

  for (const url of urls) {
    const label = new URL(url).hostname;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: { num_inference_steps: 1, width: 64, height: 64 },
        }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await resp.text();
      results[label] = { ok: resp.ok, status: resp.status, body: text.slice(0, 200) };
    } catch (err) {
      results[label] = { ok: false, error: err.message };
    }
  }

  res.status(200).json(results);
}
