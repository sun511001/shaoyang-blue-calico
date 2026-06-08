/* 诊断接口 — 测试 HF_API_KEY 是否配置成功 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.HF_API_KEY;

  res.status(200).json({
    status: 'ok',
    hfKeySet: !!apiKey,
    hfKeyPreview: apiKey
      ? apiKey.slice(0, 5) + '...' + apiKey.slice(-4)
      : '未设置',
    nodeVersion: process.version,
    message: apiKey
      ? '✅ HF_API_KEY 已配置'
      : '❌ HF_API_KEY 未设置！请在 Vercel Dashboard → Settings → Environment Variables 添加',
  });
}
