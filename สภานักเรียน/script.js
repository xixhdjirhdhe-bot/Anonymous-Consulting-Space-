// ================= ตั้งค่าระบบ Firebase & LINE (กรอกข้อมูลของคุณที่นี่) =================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://anonymous-9d2e4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// เริ่มต้นระบบ Firebase (จะทำงานเมื่อมีการใส่ Config ที่ถูกต้อง)
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
}

// ฟังก์ชันส่งแจ้งเตือนเข้า LINE Notify ผ่าน Webhook (เช่น Make.com, Zapier หรือ Backend ของคุณ)
function sendLineNotification(roleName, roomId) {
    const message = `📢 มีผู้ใช้งานกดเลือก: [${roleName}] กำลังรอสายในระบบ! คุณสามารถกดเข้าเชื่อมต่อห้องแชทได้ที่นี่: ${window.location.origin}/?room=${roomId}`;
    
    // เปลี่ยน YOUR_WEBHOOK_URL เป็น URL Webhook จริงของคุณ
    fetch("YOUR_WEBHOOK_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    }).catch(err => console.log("Line Notification Error:", err));
}

// ================= ตัวแปรและระบบควบคุมหน้าหลัก =================
let queueInterval = null;
let breathingInterval = null;
let mascotQuoteInterval = null;
let countdownSeconds = 45;
let currentRole = "";
let currentRoomId = null;
let toggleUserFlag = true;

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

// ================= ระบบจัดการเวลาคิวและแอนิเมชันหายใจ (Real-time ล็อกคิว) =================

function startMatching(roleName) {
    currentRole = roleName;
    currentRoomId = "room_" + Math.floor(Math.random() * 100000);

    // แสดงหน้าจอน้อนก้อนเมฆฝึกหายใจและตั้งค่าเริ่มต้นก่อน
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('role-instruction').innerText = `คุณกำลังรอในฐานะ: ${roleName}`;
    document.getElementById('breathing-companion').style.display = 'flex';
    document.getElementById('cloud-mascot-container').innerHTML = cloudSVG.inhale;

    initQueueTimer();
    initBreathingGuide();

    // บันทึกข้อมูลห้องลง Firebase และยิงแจ้งเตือนเข้า LINE (ถ้าต่อ Firebase แล้ว)
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.database().ref('global_queue/' + currentRoomId).set({
            status: "waiting",
            role: roleName,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            sendLineNotification(roleName, currentRoomId);
            listenForPartner(currentRoomId);
        });
    }
}

function cancelMatching() {
    clearInterval(queueInterval);
    clearInterval(breathingInterval);
    
    // ลบข้อมูลห้องในคิวออกเมื่อกดยกเลิก
    if (currentRoomId && typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.database().ref('global_queue/' + currentRoomId).remove();
        firebase.database().ref('global_queue/' + currentRoomId).off();
    }
    
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
            clearInterval(queueInterval); // หยุดนับเมื่อครบ 45 วินาที
            
            // ปรับแก้ตามบรีฟ: ค้างหน้านี้ไว้และแสดงสถานะค้นหาต่อไปเรื่อยๆ ไม่เด้งเข้าแชทอัตโนมัติเองแล้ว
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
            // เมื่อเวลาคิวหมดแล้ว แต่น้องก้อนเมฆยังคงสลับท่าทางหายใจเข้าออกวนลูปต่อไปเรื่อยๆ
            if (isInhaling) {
                container.innerHTML = cloudSVG.inhale;
            } else {
                container.innerHTML = cloudSVG.exhale;
            }
        }
    }, 4000);
}

// ฟังก์ชันเปิดการรับฟัง Firebase ว่ามีสภาท่านไหนกดลิงก์จากไลน์เข้ามาคุยด้วยหรือยัง
function listenForPartner(roomId) {
    firebase.database().ref('global_queue/' + roomId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.status === "connected") {
            clearInterval(queueInterval);
            clearInterval(breathingInterval);
            firebase.database().ref('global_queue/' + roomId).off(); 
            enterChatRoom(roomId);
        }
    });
}

// ================= ระบบจัดการห้องแชทสดสนทนาเสมือนจริง =================

function enterChatRoom(roomId) {
    switchView('chat-page');
    
    const chatMascot = document.getElementById('chat-mascot-container');
    if (chatMascot) chatMascot.innerHTML = cloudSVG.exhale;
    
    const chatLogs = document.getElementById('chat-logs');
    if (chatLogs) {
        chatLogs.innerHTML = `<div class="system-log">เชื่อมต่อกับห้องสนทนาสำเร็จ คุณได้คุยในฐานะ "${currentRole}" แล้วค่ะ</div>`;
    }
    
    document.getElementById('alert-disconnect-box').style.display = "none";
    document.getElementById('status-text').innerText = "คู่สนทนากำลังออนไลน์";
    document.getElementById('status-text').style.color = "";
    
    clearInterval(mascotQuoteInterval);
    mascotQuoteInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * mascotQuotes.length);
        document.getElementById('mascot-text').innerText = mascotQuotes[randomIndex];
    }, 7000);
}

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
        
        // ฟังก์ชันจำลองคู่สนทนาพิมพ์ตอบกลับ (จะทำงานในโหมดทดสอบ/หรือเมื่อยังไม่ได้เชื่อม Database สมบูรณ์)
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
    
    // ลบห้องออกจากฐานข้อมูลเมื่อคุยเสร็จและกดออกจากห้อง
    if (currentRoomId && typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.database().ref('global_queue/' + currentRoomId).remove();
    }
    
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

// ================= ระบบตรวจสอบลิงก์ URL สำหรับ สมาชิกสภา (เข้าล็อกห้องพักสาย) =================

function checkIncomingUrl() {
    if (typeof firebase === 'undefined' || firebaseConfig.apiKey === "YOUR_API_KEY") return;

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');

    if (roomId) {
        currentRoomId = roomId;
        const roomRef = firebase.database().ref('global_queue/' + roomId);

        roomRef.get().then((snapshot) => {
            if (snapshot.exists()) {
                const roomData = snapshot.val();
                
                // ตรวจสอบว่ามีสภาคนอื่นกดรับไปก่อนหน้าแล้วหรือยัง
                if (roomData.status === "waiting") {
                    // หากยังว่าง ให้สภาท่านแรกล็อกสถานะห้องเป็นติดสายทันที คนถัดไปจะแย่งกดไม่ได้
                    roomRef.update({
                        status: "connected"
                    }).then(() => {
                        currentRole = "สภานักเรียน/ผู้ให้คำปรึกษา";
                        enterChatRoom(roomId);
                    });
                } else {
                    // หากห้องถูกล็อกไปแล้วโดยสภาคนอื่น
                    alert("⚠️ ขออภัยด้วยค่ะ! เคสการปรึกษานี้มีสมาชิกสภาท่านอื่นกดรับฟังสายไปเรียบร้อยแล้ว");
                    window.location.href = window.location.origin; // ส่งกลับหน้าหลัก
                }
            } else {
                alert("ไม่พบรหัสห้องสนทนานี้ หรือห้องถูกยกเลิกไปแล้ว");
                window.location.href = window.location.origin;
            }
        });
    }
}

// เรียกให้ระบบตรวจสอบพารามิเตอร์ลิงก์ห้องจาก URL ทุกครั้งที่เปิดหน้าเว็บขึ้นมาใหม่
window.addEventListener('DOMContentLoaded', checkIncomingUrl);
