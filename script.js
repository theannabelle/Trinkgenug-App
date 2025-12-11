/* ============================================
   TRINK GENUG! - JavaScript
   Logik für Timer, Glas und Animationen
   ============================================ */

// ====== KONFIGURATION ======
// Hier kannst du Werte anpassen:

const CONFIG = {
    // Timer-Intervall in Millisekunden (2 Stunden = 7200000 ms)
    // Für Tests kannst du z.B. 10000 (10 Sekunden) verwenden
    REMINDER_INTERVAL: 20 * 1000, // 20 Sekunden (TEST-MODUS)
    
    // Wassermenge pro Klick in Litern
    WATER_PER_CLICK: 0.25,
    
    // Maximale Füllmenge des Glases in Litern
    MAX_WATER: 2.0,
    
    // Anzahl der Herzen bei der Feier-Animation
    HEART_COUNT: 50
};

// ====== GLOBALE VARIABLEN ======

// Aktueller Wasserstand (startet bei 0)
let currentWater = 0;

// Timer-Referenz für den Countdown
let countdownTimer = null;

// Zeitpunkt der nächsten Erinnerung
let nextReminder = null;

// ====== DOM-ELEMENTE LADEN ======
// Wir holen uns alle HTML-Elemente, die wir brauchen

document.addEventListener('DOMContentLoaded', function() {
    // DOM-Elemente referenzieren
    const water = document.getElementById('water');
    const currentAmountDisplay = document.getElementById('current-amount');
    const timerDisplay = document.getElementById('timer-display');
    const btnAdd = document.getElementById('btn-add');
    const btnReset = document.getElementById('btn-reset');
    const reminderPopup = document.getElementById('reminder-popup');
    const btnDismiss = document.getElementById('btn-dismiss');
    const heartsContainer = document.getElementById('hearts-container');
    const reminderSound = document.getElementById('reminder-sound');
    const gluckernSound = document.getElementById('gluckern-sound');
    const soundWarning = document.getElementById('sound-warning');

    // ====== TIMER-FUNKTIONEN ======

    /**
     * Startet den 2-Stunden-Timer für die Trinkerinnerung
     */
    function startReminderTimer() {
        // Nächste Erinnerung berechnen
        nextReminder = Date.now() + CONFIG.REMINDER_INTERVAL;
        
        // Bisherigen Timer stoppen (falls vorhanden)
        if (countdownTimer) {
            clearInterval(countdownTimer);
        }
        
        // Countdown jede Sekunde aktualisieren
        countdownTimer = setInterval(updateCountdown, 1000);
        
        // Sofort einmal aktualisieren
        updateCountdown();
        
        console.log('⏰ Timer gestartet! Nächste Erinnerung in 2 Stunden.');
    }

    /**
     * Aktualisiert die Countdown-Anzeige
     */
    function updateCountdown() {
        // Verbleibende Zeit berechnen
        const remaining = nextReminder - Date.now();
        
        // Wenn Zeit abgelaufen ist
        if (remaining <= 0) {
            showReminder();
            startReminderTimer(); // Timer neu starten
            return;
        }
        
        // Zeit in Stunden, Minuten, Sekunden umrechnen
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        // Formatierte Anzeige (mit führenden Nullen)
        timerDisplay.textContent = 
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');
    }

    /**
     * Zeigt die Trinkerinnerung an
     */
    function showReminder() {
        // Popup anzeigen
        reminderPopup.classList.add('active');
        
        // Timer pulsieren lassen
        timerDisplay.classList.add('pulse');
        
        // Erinnerungs-Sound abspielen (aus sounds Ordner)
        playSound(reminderSound);
        
        console.log('🔔 Erinnerung: Zeit zu trinken!');
    }

    /**
     * Versteckt die Trinkerinnerung
     */
    function hideReminder() {
        reminderPopup.classList.remove('active');
        timerDisplay.classList.remove('pulse');
        
        // Reminder-Sound stoppen
        if (reminderSound) {
            reminderSound.pause();
            reminderSound.currentTime = 0; // Zurück zum Anfang
        }
    }

    // ====== GLAS-FUNKTIONEN ======

    /**
     * Fügt Wasser zum Glas hinzu
     */
    function addWater() {
        // Prüfen, ob Glas bereits voll ist
        if (currentWater >= CONFIG.MAX_WATER) {
            // Glas ist voll - kurz schütteln als Feedback
            const glass = document.querySelector('.glass');
            glass.classList.add('shake');
            setTimeout(() => glass.classList.remove('shake'), 500);
            return;
        }
        
        // Wasser hinzufügen
        currentWater += CONFIG.WATER_PER_CLICK;
        
        // Auf Maximum begrenzen (für den Fall von Rundungsfehlern)
        if (currentWater > CONFIG.MAX_WATER) {
            currentWater = CONFIG.MAX_WATER;
        }
        
        // Anzeige aktualisieren
        updateWaterDisplay();
        
        // Gluckern-Sound abspielen (aus sounds Ordner)
        playSound(gluckernSound);
        
        // Puls-Animation für das Wasser
        water.classList.add('filling');
        setTimeout(() => water.classList.remove('filling'), 500);
        
        console.log(`💧 Wasser hinzugefügt: ${currentWater.toFixed(2)} L`);
        
        // Prüfen, ob Glas jetzt voll ist
        if (currentWater >= CONFIG.MAX_WATER) {
            // Kurze Verzögerung, dann Feier-Animation
            setTimeout(celebrateFullGlass, 800);
        }
    }

    /**
     * Setzt das Glas zurück auf leer
     */
    function resetWater() {
        currentWater = 0;
        updateWaterDisplay();
        console.log('🔄 Glas wurde geleert.');
    }

    /**
     * Aktualisiert die visuelle Darstellung des Wasserstands
     */
    function updateWaterDisplay() {
        // Prozentuale Füllung berechnen (0-100%)
        const fillPercent = (currentWater / CONFIG.MAX_WATER) * 100;
        
        // CSS-Höhe des Wassers setzen
        water.style.height = fillPercent + '%';
        
        // Textanzeige aktualisieren
        currentAmountDisplay.textContent = currentWater.toFixed(2).replace('.', ',');
    }

    // ====== FEIER-ANIMATION ======

    /**
     * Startet die Herz-Animation wenn das Glas voll ist
     */
    function celebrateFullGlass() {
        console.log('🎉 Glückwunsch! Das Glas ist voll!');
        
        // Viele Herzen erstellen
        for (let i = 0; i < CONFIG.HEART_COUNT; i++) {
            // Mit Verzögerung erstellen für Staffel-Effekt
            setTimeout(() => createHeart(), i * 100);
        }
    }

    /**
     * Erstellt ein einzelnes animiertes Herz
     */
    function createHeart() {
        // Neues Herz-Element erstellen
        const heart = document.createElement('div');
        heart.classList.add('heart');
        
        // Zufällige Position (horizontal)
        heart.style.left = Math.random() * 100 + 'vw';
        
        // Verschiedene blaue Herz-Emojis für Abwechslung
        const hearts = ['💙', '🩵', '💎', '🫧', '💦', '🌊'];
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        
        // Zufällige Größe
        const size = 1 + Math.random() * 2;
        heart.style.fontSize = size + 'rem';
        
        // Zufällige Animationsdauer
        const duration = 3 + Math.random() * 2;
        heart.style.animationDuration = duration + 's';
        
        // Zum Container hinzufügen
        heartsContainer.appendChild(heart);
        
        // Nach Animation entfernen (Speicher sparen)
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }

    // ====== HILFSFUNKTIONEN ======

    /**
     * Prüft, ob die Sound-Dateien verfügbar sind
     */
    function checkSoundsAvailability() {
        let soundsAvailable = true;
        let missingSounds = [];
        
        // Prüfe reminder-Sound
        reminderSound.addEventListener('error', function() {
            console.error('❌ reminder.m4a konnte nicht geladen werden!');
            console.log('📁 Erwarteter Pfad: sounds/reminder.m4a (oder reminder.mp3 als Fallback)');
            soundsAvailable = false;
            missingSounds.push('reminder.m4a');
            showSoundWarning();
        }, { once: true });
        
        // Prüfe gluckern-Sound
        gluckernSound.addEventListener('error', function() {
            console.error('❌ gluckern.m4a konnte nicht geladen werden!');
            console.log('📁 Erwarteter Pfad: sounds/gluckern.m4a (oder gluckern.mp3 als Fallback)');
            soundsAvailable = false;
            missingSounds.push('gluckern.m4a');
            showSoundWarning();
        }, { once: true });
        
        // Versuche die Sounds zu laden
        reminderSound.load();
        gluckernSound.load();
        
        // Prüfe nach kurzer Verzögerung, ob die Sounds geladen wurden
        setTimeout(() => {
            if (reminderSound.readyState === 0 || gluckernSound.readyState === 0) {
                if (!soundsAvailable) {
                    showSoundWarning();
                }
            }
        }, 1000);
        
        return soundsAvailable;
    }

    /**
     * Zeigt die Warnung an, wenn Sounds fehlen
     */
    function showSoundWarning() {
        if (soundWarning) {
            soundWarning.style.display = 'block';
        }
    }

    /**
     * Spielt einen Sound ab (mit verbesserter Fehlerbehandlung)
     * @param {HTMLAudioElement} audioElement - Das Audio-Element
     */
    function playSound(audioElement) {
        // Prüfe, ob das Audio-Element existiert
        if (!audioElement) {
            console.warn('⚠️ Audio-Element nicht gefunden!');
            return;
        }
        
        // Prüfe, ob die Datei geladen werden konnte
        if (audioElement.readyState === 0) {
            console.warn('⚠️ Sound-Datei wurde nicht geladen. Prüfe den Pfad!');
            console.log('💡 Stelle sicher, dass die MP3-Dateien im "sounds" Ordner liegen.');
            return;
        }
        
        // Zum Anfang zurücksetzen (falls schon abgespielt)
        audioElement.currentTime = 0;
        
        // Abspielen mit Promise (moderne Browser)
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Detaillierte Fehlerbehandlung
                if (error.name === 'NotAllowedError') {
                    console.warn('⚠️ Browser blockiert Audio-Wiedergabe. Klicke einmal auf die Seite, um Audio zu aktivieren.');
                } else if (error.name === 'NotSupportedError') {
                    console.warn('⚠️ Audio-Format wird nicht unterstützt. Stelle sicher, dass es MP3-Dateien sind.');
                } else {
                    console.warn('⚠️ Sound konnte nicht abgespielt werden:', error.name, error.message);
                    console.log('💡 Tipp: Stelle sicher, dass reminder.m4a und gluckern.m4a (oder .mp3) im "sounds" Ordner liegen.');
                }
            });
        }
    }

    // ====== EVENT-LISTENER ======
    // Hier verbinden wir die Buttons mit den Funktionen

    // Wasser hinzufügen Button
    btnAdd.addEventListener('click', addWater);

    // Reset Button
    btnReset.addEventListener('click', resetWater);

    // Erinnerung schließen Button
    btnDismiss.addEventListener('click', hideReminder);

    // Auch beim Klick außerhalb des Popups schließen
    reminderPopup.addEventListener('click', function(event) {
        // Nur wenn direkt auf den Hintergrund geklickt wurde
        if (event.target === reminderPopup) {
            hideReminder();
        }
    });

    // Tastatursteuerung (optional)
    document.addEventListener('keydown', function(event) {
        // Leertaste oder Enter fügt Wasser hinzu
        if (event.code === 'Space' || event.code === 'Enter') {
            // Nicht wenn Popup aktiv ist
            if (!reminderPopup.classList.contains('active')) {
                event.preventDefault();
                addWater();
            }
        }
        
        // Escape schließt Popup
        if (event.code === 'Escape') {
            hideReminder();
        }
        
        // R-Taste für Reset
        if (event.code === 'KeyR' && !event.ctrlKey && !event.metaKey) {
            resetWater();
        }
    });

    // ====== APP STARTEN ======
    
    // Timer automatisch starten
    startReminderTimer();
    
    // Initial-Anzeige setzen
    updateWaterDisplay();
    
    // Prüfe Sound-Verfügbarkeit
    const soundsOk = checkSoundsAvailability();
    
    console.log('✅ Trink Genug! App gestartet');
    if (soundsOk) {
        console.log('🔊 Sounds werden aus dem sounds Ordner geladen (reminder.m4a, gluckern.m4a)');
    } else {
        console.warn('⚠️ WARNUNG: Sound-Dateien fehlen oder konnten nicht geladen werden!');
        console.log('📁 Bitte lege reminder.m4a und gluckern.m4a (oder .mp3) in den sounds/ Ordner.');
    }
    console.log('📌 Shortcuts: Leertaste = Wasser hinzufügen, R = Reset, Escape = Popup schließen');
});
