// הכנס כאן את הלינק המעודכן מה-Deploy החדש בגוגל
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXNsZFn8n4UQ45Sigv0VMsL4MEF1nRwdKRsNpFtD_rRBGuYCldXNEYWGslqT6chfbT/exec'; 

// ==========================================
// מאגר נתונים דמוי JSON (מייצג את אפשרויות התאריכים)
// ==========================================
const scheduleData = [
    { value: "2026-07-08T08:00:00,2026-07-08T08:30:00", label: "תאריך: 08/07/2026 (יום רביעי) שעות: 8:00 עד 8:30" },
    { value: "2026-07-16T09:00:00,2026-07-16T09:30:00", label: "תאריך: 16/07/2026 (יום חמישי) שעות: 9:00 עד 9:30" },
    { value: "2026-07-16T09:30:00,2026-07-16T10:00:00", label: "תאריך: 16/07/2026 (יום חמישי) שעות: 9:30 עד 10:00" },
    { value: "2026-08-01T08:00:00,2026-08-01T09:30:00", label: "תאריך: 01/08/2026 (יום שבת) שעות: 8:00 עד 9:30" },
    { value: "2026-08-01T09:30:00,2026-08-01T10:00:00", label: "תאריך: 01/08/2026 (יום שבת) שעות: 9:30 עד 10:00" },
    { value: "2026-08-01T10:00:00,2026-08-01T10:30:00", label: "תאריך: 01/08/2026 (יום שבת) שעות: 10:00 עד 10:30" },
    { value: "2026-08-20T08:30:00,2026-08-20T09:00:00", label: "תאריך: 20/08/2026 (יום חמישי) שעות: 8:30 עד 9:00 בבוקר" },
    { value: "2026-08-20T08:30:00,2026-08-20T09:30:00", label: "תאריך: 20/08/2026 (יום חמישי) שעות: 8:30 עד 9:30 בבוקר" },
    { value: "2026-08-20T09:30:00,2026-08-20T10:00:00", label: "תאריך: 20/08/2026 (יום חמישי) שעות: 9:30 עד 10:00 בבוקר" },
    { value: "2026-08-20T10:00:00,2026-08-20T12:00:00", label: "שעה אחרונה 20/08/2026 (יום חמישי) שעות: 10:00 עד 12:00" }
];

// ==========================================
// אינטראקציות DOM מופרדות מה-HTML
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. הזרקת הנתונים ל-Select של התאריכים
    const dateTimeSelect = document.getElementById('dateTime');
    scheduleData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        dateTimeSelect.appendChild(option);
    });

    // 2. ניהול דיירים
    let currentTenantCount = 1;
    const addTenantBtn = document.getElementById('addTenantBtn');
    
    addTenantBtn.addEventListener('click', () => {
        if (currentTenantCount < 6) {
            currentTenantCount++;
            document.getElementById(`tenant-row-${currentTenantCount}`).style.display = 'grid';
        }
        if (currentTenantCount === 6) {
            addTenantBtn.style.display = 'none';
        }
    });

    // 3. ניהול מעון אחר
    const leaveStatusSelect = document.getElementById('leaveStatus');
    const otherDormContainer = document.getElementById('otherDormContainer');
    const otherDormInput = document.getElementById('otherDorm');

    leaveStatusSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === 'עובר למעון אחר') {
            otherDormContainer.style.display = 'block';
            otherDormInput.required = true;
        } else {
            otherDormContainer.style.display = 'none';
            otherDormInput.required = false;
            otherDormInput.value = '';
        }
    });

    // ==========================================
    // טיפול בשליחת הטופס
    // ==========================================
    const form = document.getElementById('creditForm');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const btnText = submitBtn.querySelector('span');
    const successMsg = document.getElementById('successMsg');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        spinner.style.display = 'block';
        btnText.textContent = 'שומר נתונים...';
        successMsg.classList.remove('active');

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // לקיחת הטקסט של השעה
        data.dateTimeLabel = dateTimeSelect.options[dateTimeSelect.selectedIndex].text;

        // עיבוד ההערות וסטטוס העזיבה
        let combinedNotes = `סטטוס עזיבה: ${data.leaveStatus}\n`;
        if (data.leaveStatus === 'עובר למעון אחר') {
            combinedNotes += `עובר ל: ${data.otherDorm}\n`;
        }
        if (data.notes && data.notes.trim() !== '') {
            combinedNotes += `\nהערות נוספות:\n${data.notes}`;
        }
        data.combinedNotes = combinedNotes;

        try {
            if (GOOGLE_SCRIPT_URL === 'YOUR_WEB_APP_URL_HERE') {
                console.log("Mock submission (Update the URL!):", data);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    }
                });
                const result = await response.json();
                if(result.status !== 'success') throw new Error(result.message || 'Server Error');
            }

            successMsg.classList.add('active');
            form.reset();
            
            // איפוס תצוגת מעון אחר
            otherDormContainer.style.display = 'none';
            otherDormInput.required = false;
            
            // איפוס תצוגת דיירים
            for(let i = 2; i <= 6; i++) {
                document.getElementById(`tenant-row-${i}`).style.display = 'none';
            }
            currentTenantCount = 1;
            addTenantBtn.style.display = 'flex';

        } catch (error) {
            alert('אירעה שגיאה בשמירת הנתונים. ודא שחיברת את ה-URL כראוי.');
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            spinner.style.display = 'none';
            btnText.textContent = 'קבע פגישה ושמור בגליון';
            
            setTimeout(() => {
                successMsg.classList.remove('active');
            }, 6000);
        }
    });
});
