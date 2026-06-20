// ไฟล์: api/notify.js

export default async function handler(req, res) {
    // 1. อนุญาตเฉพาะการส่งข้อมูลแบบ POST เท่านั้น
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        // ดึงข้อมูลที่ LINE ส่งมาตรวจดู (เผื่อเอาไปใช้ซ่อมแซมระบบต่อ)
        const events = req.body.events;

        // 2. จุดสำคัญ: ถ้าเป็นการกดปุ่ม "Verify" จาก LINE Developer 
        // มักจะส่ง events มาเป็นอาร์เรย์ว่าง ๆ หรือมีเตือนระบบ ให้เราส่ง 200 OK กลับไปทันที
        if (!events || events.length === 0) {
            return res.status(200).json({ message: "Webhook verified successfully!" });
        }

        // --- (โค้ดสำหรับจัดการ Logic ส่ง LINE Notify หรือ Firebase ของคุณอยู่ตรงนี้) ---
        // ตัวอย่างเช่น:
        // const event = events[0];
        // if (event.type === 'message') { ... }
        
        // 3. เมื่อระบบทำงานฝั่งของคุณเสร็จแล้ว ต้องปิดท้ายด้วยการส่งสถานะ 200 เสมอ
        return res.status(200).json({ status: 'success' });

    } catch (error) {
        console.error("Webhook Error:", error);
        // หากโค้ดด้านในบัค ให้ส่งสถานะ 500 พร้อมบอกสาเหตุสั้นๆ จะได้ไม่งงซ่อมยาก
        return res.status(500).json({ error: error.message });
    }
}
