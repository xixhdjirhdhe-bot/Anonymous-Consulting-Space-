// ไฟล์: api/notify.js

export default async function handler(req, res) {
    // ดักจับและอนุญาตสิทธิ์ CORS เพื่อให้หน้าเว็บส่งข้อมูลเข้ามาได้
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const body = req.body;

        // ดักจับปุ่ม Verify ของ LINE Developer Console (เพื่อให้ปุ่มยังเขียวอยู่เหมือนเดิม)
        if (body && body.events && body.events.length === 0) {
            return res.status(200).json({ message: "Webhook verified successfully!" });
        }

        // จุดส่งข้อความแจ้งเตือนจริงเมื่อเด็กกดปุ่มจากหน้าเว็บ
        if (body && body.message) {
            // ดึง Token ที่ถูกส่งมาจากไฟล์ script.js
            const lineAccessToken = body.token; 

            if (!lineAccessToken || lineAccessToken.includes("ใส่_TOKEN")) {
                return res.status(400).json({ error: "Missing or invalid LINE Access Token" });
            }
            
            // ยิงส่งข้อมูลตรงเข้าสู่ระบบ LINE Platform หลังบ้าน
            const lineResponse = await fetch("https://api.line.me/v2/bot/message/broadcast", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${lineAccessToken}`
                },
                body: JSON.stringify({
                    messages: [{ type: "text", text: body.message }]
                })
            });

            const resultLog = await lineResponse.json();
            return res.status(200).json({ status: 'success', info: resultLog });
        }

        return res.status(200).json({ status: 'received' });

    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
