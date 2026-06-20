// ตัวแปรควบคุมระบบหน้าหลักและการเปลี่ยนสลับหน้า
function switchView(viewId) {
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(viewId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-theme');
}

// ================= คลังข้อมูลเวกเตอร์ SVG น้องก้อนเมฆ =================
const cloudSVG = {
    inhale: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M25,65 C12,65 8,52 18,42 C12,25 30,12 48,22 C58,8 82,14 85,32 C96,36 98,52 86,65 Z" fill="#e0f2fe" filter="drop-shadow(0 4px 6px rgba(186, 230, 253, 0.5))" stroke="#bae6fd" stroke-width="1.5"/>
        <circle cx="38" cy="46" r="4" fill="#2d3748"/>
        <circle cx="62" cy="46" r="4" fill="#2d3748"/>
        <circle cx="32" cy="52" r="5" fill="#fca5a5" opacity="0.7"/>
        <circle cx="68" cy="52" r="5" fill="#fca5a5" opacity="0.7"/>
        <circle cx="50" cy="52" r="4" fill="#2d3748"/>
    </svg>`,
    exhale: `<svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M25,65 C12,65 8,52 18,42 C12,25 30,12 48,22 C58,8 82,14 85,32 C96,36 98,52 86,65 Z" fill="#e0f2fe" filter="drop-shadow(0 4px 6px rgba(186, 230, 253, 0.5))" stroke="#bae6fd" stroke-width="1.5"/>
        <path d="M34,46 Q38,42 42,46" stroke="#2d3748" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M58,46 Q62,42 66,46" stroke="#2d3748" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="32" cy="52" r="5" fill="#fca5a5" opacity="0.7"/>
        <circle cx="68" cy="52" r="5" fill="#fca5a5" opacity="0.7"/>
        <path d="M44,53 Q50,59 56,53" stroke="#2d3748" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`
};

// คลังคำพูดให้กำลังใจสุ่มของน้องก้อนเมฆฝั่งซ้ายห้องแชท
const mascotQuotes = [
    "เก่งมากแล้วนะวันนี้! ยินดีที่ได้เจอกันครับ 🌟",
    "เหนื่อยไหมครับ? ค่อยๆ คุย ค่อยๆ ระบายออกมานะ 🍃",
    "พื้นที่ตรงนี้ปลอดภัยสำหรับคุณเสมอ ปลดปล่อยใจได้เลยนะ ☁️",
    "เราอยู่ข้างๆ คุณตรงนี้เสมอ ไม่ต้องกังวลไปนะจ๊ะ 😊",
    "ภูมิใจในตัวคุณที่สุดเลยที่ผ่านวันนี้มาได้ สู้ๆ นะ 💕"
];

// ================= ระบบจัดการเวลาคิวและแอนิเมชันหายใจ =================
let queueInterval = null;
let breathingInterval = null;
let mascotQuoteInterval = null;
let countdownSeconds = 45;
let currentRole = "";

function startMatching(roleName) {
    currentRole = roleName;
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('role-instruction').innerText = `คุณกำลังรอในฐานะ: ${roleName}`;
    document.getElementById('breathing-companion').style.display = 'flex';
    
    document.getElementById('cloud-mascot-container').innerHTML = cloudSVG.inhale;

    initQueueTimer();
    initBreathingGuide();
}

function cancelMatching() {
    clearInterval(queueInterval);
    clearInterval(breathingInterval);
    
    document.getElementById('cloud-mascot-container').innerHTML = "";
    document.getElementById('role-selection').style.display = 'flex';
    document.getElementById('breathing-companion').style.display = 'none';
    document.getElementById('role-instruction').innerText = 'ยินดีต้อนรับทุกท่าน เข้าสู่การปรึกษาแบบไม่เปิดเผยตัวตน คุณสามารถเลือกได้ว่าวันนี้จะทำอะไร';
    
    switchView('home-page');
}

function initQueueTimer() {
    countdownSeconds = 45; 
    document.getElementById('queue-timer').innerText = `คาดว่าจะได้คุยภายใน: ${countdownSeconds} วินาที`;
    
    queueInterval = setInterval(() => {
        countdownSeconds--;
        if (countdownSeconds <= 0) {
            clearInterval(queueInterval); // หยุดนับถอยหลังเมื่อครบกำหนด
            
            // เปลี่ยนข้อความแจ้งเตือนเพื่อให้รู้ว่าระบบกำลังพยายามค้นหาต่อไป (ไม่เด้งเข้าห้องแชทจำลองแล้ว)
            document.getElementById('queue-timer').innerText = "กำลังค้นหาคู่สนทนาที่เหมาะสมให้นานกว่าปกติ...";
            document.getElementById('breathing-text').innerText = "ใจเย็นๆ นะ น้อนก้อนเมฆยังอยู่เป็นเพื่อนคุณ ☁️";
        } else {
            document.getElementById('queue-timer').innerText = `คาดว่าจะได้คุยภายใน: ${countdownSeconds} วินาที`;
        }
    }, 1000);
}

function initBreathingGuide() {
    const textElement = document.getElementById('breathing-text');
    const container = document.getElementById('cloud-mascot-container');
    
    textElement.innerText = "หายใจเข้าช้าๆ... 🧘";
    container.innerHTML = cloudSVG.inhale;
    let isInhaling = true;
    
    breathingInterval = setInterval(() => {
        // เช็คเงื่อนไข: หากเวลานับถอยหลังหมดแล้ว ให้ข้อความแอนิเมชันหายใจยังคงทำงานต่อตามปกติ ไม่โดนเปลี่ยน
        isInhaling = !isInhaling;
        if (countdownSeconds > 0) {
            if (isInhaling) {
                textElement.innerText = "หายใจเข้าช้าๆ... 🧘";
                container.innerHTML = cloudSVG.inhale;
            } else {
                textElement.innerText = "ผ่อนลมหายใจออก... 🍃";
                container.innerHTML = cloudSVG.exhale;
            }
        } else {
            // ถ้านับถอยหลังจบแล้ว (แต่อยากให้มินิเกมลูปไปเรื่อยๆ) ก็เปลี่ยนแค่ท่าทางของ SVG น้อนก้อนเมฆตามจังหวะ
            if (isInhaling) {
                container.innerHTML = cloudSVG.inhale;
            } else {
                container.innerHTML = cloudSVG.exhale;
            }
        }
    }, 4000);
}

// ================= ระบบจัดการห้องแชทสดสนทนาเสมือนจริง =================

function enterChatRoom() {
    switchView('chat-page');
    
    const chatMascot = document.getElementById('chat-mascot-container');
    chatMascot.innerHTML = cloudSVG.exhale;
    
    const chatLogs = document.getElementById('chat-logs');
    chatLogs.innerHTML = `<div class="system-log">เชื่อมต่อกับห้องสนทนาสำเร็จ คุณได้คุยในฐานะ "${currentRole}" แล้วค่ะ</div>`;
    
    document.getElementById('alert-disconnect-box').style.display = "none";
    document.getElementById('status-text').innerText = "คู่สนทนากำลังออนไลน์";
    document.getElementById('status-text').style.color = "";
    
    clearInterval(mascotQuoteInterval);
    mascotQuoteInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * mascotQuotes.length);
        document.getElementById('mascot-text').innerText = mascotQuotes[randomIndex];
    }, 7000);
}

let toggleUserFlag = true;

function sendChatMessage() {
    const inputElement = document.getElementById('chat-input-field');
    const messageText = inputElement.value.trim();
    
    if (messageText === "") return;
    
    const chatLogs = document.getElementById('chat-logs');
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble');
    
    if (toggleUserFlag) {
        bubble.classList.add('user-1');
        bubble.innerText = `คนที่ 1: ${messageText}`;
        toggleUserFlag = false;
        
        setTimeout(() => {
            simulatePartnerReply();
        }, 1500);
    } else {
        bubble.classList.add('user-2');
        bubble.innerText = `คนที่ 2: ${messageText}`;
        toggleUserFlag = true;
    }
    
    chatLogs.appendChild(bubble);
    inputElement.value = "";
    chatLogs.scrollTop = chatLogs.scrollHeight;
}

function simulatePartnerReply() {
    const partnerReplies = [
        "เข้าใจเลยครับ เรื่องนี้มันหนักหนาจริงๆ",
        "ขอบคุณที่เล่าให้ฟังนะครับ ผมพร้อมรับฟังเสมอเลย",
        "แล้วคุณจัดการกับความรู้สึกนั้นยังไงหรอครับ?",
        "อืมมม... เป็นกำลังใจให้นะครับ ฟังแล้วรู้สึกเห็นใจเลย",
        "มีอะไรอยากระบายอีกไหมครับ เต็มที่ได้เลยนะ"
    ];
    
    const chatLogs = document.getElementById('chat-logs');
    if (!chatLogs) return;
    
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', 'user-2');
    
    const randomIndex = Math.floor(Math.random() * partnerReplies.length);
    bubble.innerText = `คนที่ 2: ${partnerReplies[randomIndex]}`;
    
    chatLogs.appendChild(bubble);
    chatLogs.scrollTop = chatLogs.scrollHeight;
    toggleUserFlag = true;
}

function leaveChatRoom() {
    clearInterval(mascotQuoteInterval);
    
    document.getElementById('alert-disconnect-box').style.display = "block";
    document.getElementById('status-text').innerText = "คู่สนทนาออฟไลน์แล้ว";
    document.getElementById('status-text').style.color = "#c53030";
    
    setTimeout(() => {
        document.getElementById('role-selection').style.display = 'flex';
        document.getElementById('breathing-companion').style.display = 'none';
        document.getElementById('role-instruction').innerText = 'ยินดีต้อนรับทุกท่าน เข้าสู่การปรึกษาแบบไม่เปิดเผยตัวตน คุณสามารถเลือกได้ว่าวันนี้จะทำอะไร';
        switchView('home-page');
    }, 1500); 
}