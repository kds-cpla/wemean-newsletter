export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://wemean-newsletter.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { company, employees, name, phone, email } = req.body;

    const employeesNum =
      employees === '300+'
        ? 300
        : parseInt(employees.split('-')[0], 10);

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          회사명: { title: [{ text: { content: company } }] },
          상시근로자수: { number: employeesNum },
          '담당자 이름': { rich_text: [{ text: { content: name } }] },
          '담당자 연락처': { phone_number: phone },
          '담당자 이메일': { email: email },
          신청일시: { date: { start: new Date().toISOString() } },
        },
      }),
    });

    if (!notionRes.ok) {
      const errBody = await notionRes.json();
      console.error('Notion API error:', errBody);
      return res.status(500).json({ error: 'Notion 저장 실패', detail: errBody });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('서버 오류:', err);
    return res.status(500).json({ error: '서버 오류' });
  }
}
