// ====================================
// MOTIVATIONAL FITNESS QUOTES
// ====================================

const quotes = [
    "The only bad workout is the one that didn't happen! 💪",
    "No pain, no gain - push yourself today!",
    "Every step forward is progress. Keep moving!",
    "Fitness is not a destination, it's a way of life.",
    "You don't have to be great to start, but you have to start to be great.",
    "The hardest lift is the first rep. You've got this!",
    "Sweat is just fat crying. Cry on!",
    "Your body can stand almost anything. It's your mind that you need to convince.",
    "Don't wish for a good body, work for it!",
    "Rest when you're tired, not when you're done.",
    "Champions aren't made in gyms. Champions are made from something they have deep inside.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Stronger than yesterday, weaker than tomorrow!",
    "Believe in yourself and you'll be unstoppable!",
    "The pain you feel today will be the strength you feel tomorrow."
];

// ====================================
// LOCAL STORAGE MANAGEMENT
// ====================================

function loadWorkouts() {
    const data = localStorage.getItem('fitTrackerWorkouts');
    return data ? JSON.parse(data) : [];
}

function saveWorkouts(workouts) {
    localStorage.setItem('fitTrackerWorkouts', JSON.stringify(workouts));
}

function loadTheme() {
    return localStorage.getItem('fitTrackerTheme') || 'light';
}

function saveTheme(theme) {
    localStorage.setItem('fitTrackerTheme', theme);
}

// ====================================
// THEME TOGGLE (DARK/LIGHT MODE)
// ====================================

function toggleTheme() {
    const currentTheme = loadTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('themeIcon');
    icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    saveTheme(newTheme);
}

// Initialize theme on page load
function initializeTheme() {
    const theme = loadTheme();
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').textContent = '☀️';
    }
}

// ====================================
// NAVIGATION
// ====================================

function navigateTo(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));
    
    // Show selected section
    document.getElementById(section).classList.add('active');
    
    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    event?.target?.classList.add('active');
    
    // Update page content based on section
    if (section === 'dashboard') {
        updateDashboard();
    } else if (section === 'history') {
        displayHistory();
    } else if (section === 'analytics') {
        updateAnalytics();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// ====================================
// DISPLAY MOTIVATIONAL QUOTE
// ====================================

function displayMotivationalQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById('motivationalQuote').textContent = `"${quote}"`;
}

// ====================================
// SET TODAY'S DATE IN FORM
// ====================================

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('workoutDate').value = today;
}

// ====================================
// FORM SUBMISSION - ADD WORKOUT
// ====================================

document.getElementById('workoutForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formMessage = document.getElementById('formMessage');
    
    try {
        const workout = {
            id: Date.now(),
            date: document.getElementById('workoutDate').value,
            name: document.getElementById('workoutName').value,
            type: document.getElementById('workoutType').value,
            duration: parseInt(document.getElementById('duration').value),
            calories: parseInt(document.getElementById('calories').value),
            intensity: document.getElementById('intensity').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().getTime()
        };
        
        // Validate inputs
        if (!workout.date || !workout.name || !workout.type || !workout.duration || 
            !workout.calories || !workout.intensity) {
            throw new Error('Please fill in all required fields');
        }
        
        // Add to storage
        const workouts = loadWorkouts();
        workouts.push(workout);
        saveWorkouts(workouts);
        
        // Show success message
        formMessage.textContent = '✅ Workout logged successfully!';
        formMessage.className = 'success';
        
        // Reset form
        this.reset();
        setTodayDate();
        
        // Clear message after 3 seconds
        setTimeout(() => {
            formMessage.className = '';
            formMessage.textContent = '';
        }, 3000);
        
        // Update dashboard if visible
        if (document.getElementById('dashboard').classList.contains('active')) {
            updateDashboard();
        }
        
    } catch (error) {
        formMessage.textContent = '❌ ' + error.message;
        formMessage.className = 'error';
        setTimeout(() => {
            formMessage.className = '';
            formMessage.textContent = '';
        }, 3000);
    }
});

// ====================================
// DASHBOARD UPDATE
// ====================================

function updateDashboard() {
    const workouts = loadWorkouts();
    
    if (workouts.length === 0) {
        document.getElementById('dashTotalWorkouts').textContent = '0';
        document.getElementById('dashTotalCalories').textContent = '0';
        document.getElementById('dashTotalMinutes').textContent = '0';
        document.getElementById('dashWeekWorkouts').textContent = '0';
        document.getElementById('todayWorkout').innerHTML = '<p style="color: #666;">No workouts logged for today yet. Add one now!</p>';
        document.getElementById('recentWorkouts').innerHTML = '<p style="color: #666;">No workouts yet. Start by adding your first workout!</p>';
        displayMotivationalQuote();
        return;
    }
    
    // Calculate stats
    let totalCalories = 0;
    let totalMinutes = 0;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    let weekCount = 0;
    let todayWorkouts = [];
    let recentWorkouts = [];
    
    workouts.forEach(workout => {
        totalCalories += workout.calories;
        totalMinutes += workout.duration;
        
        const workoutDate = new Date(workout.date);
        if (workoutDate >= weekAgo) weekCount++;
        
        if (workoutDate >= today && workoutDate < todayEnd) {
            todayWorkouts.push(workout);
        }
        recentWorkouts.push(workout);
    });
    
    // Sort recent workouts by date
    recentWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    recentWorkouts = recentWorkouts.slice(0, 5);
    
    // Update stat cards
    document.getElementById('dashTotalWorkouts').textContent = workouts.length;
    document.getElementById('dashTotalCalories').textContent = totalCalories.toLocaleString();
    document.getElementById('dashTotalMinutes').textContent = totalMinutes;
    document.getElementById('dashWeekWorkouts').textContent = weekCount;
    
    // Display today's workouts
    if (todayWorkouts.length > 0) {
        const todayHtml = todayWorkouts.map(w => `
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
                <strong>${w.name}</strong> - ${w.duration} min | 🔥 ${w.calories} kcal | 💪 ${w.intensity}
            </div>
        `).join('');
        document.getElementById('todayWorkout').innerHTML = todayHtml;
    } else {
        document.getElementById('todayWorkout').innerHTML = '<p style="color: #666;">No workouts logged for today yet. Add one now!</p>';
    }
    
    // Display recent workouts
    if (recentWorkouts.length > 0) {
        const recentHtml = recentWorkouts.map(w => `
            <div class="workout-mini-card">
                <h4>${w.name}</h4>
                <p>📅 ${new Date(w.date).toLocaleDateString()}</p>
                <p>⏱️ ${w.duration} min | 🔥 ${w.calories} kcal | 💪 ${w.intensity}</p>
            </div>
        `).join('');
        document.getElementById('recentWorkouts').innerHTML = recentHtml;
    }
    
    displayMotivationalQuote();
}

// ====================================
// HISTORY - DISPLAY ALL WORKOUTS
// ====================================

function displayHistory() {
    const workouts = loadWorkouts();
    let filtered = [...workouts];
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply filters
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('filterType').value;
    
    if (searchTerm) {
        filtered = filtered.filter(w => 
            w.name.toLowerCase().includes(searchTerm) || 
            w.notes.toLowerCase().includes(searchTerm)
        );
    }
    
    if (typeFilter) {
        filtered = filtered.filter(w => w.type === typeFilter);
    }
    
    const container = document.getElementById('historyContainer');
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="color: #666; grid-column: 1/-1; text-align: center;">No workouts found matching your filters.</p>';
        return;
    }
    
    const html = filtered.map(w => `
        <div class="workout-card">
            <div class="workout-card-header">
                <div>
                    <div class="workout-card-title">${w.name}</div>
                    <div class="workout-card-date">${new Date(w.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</div>
                </div>
            </div>
            <div class="workout-card-type">${w.type}</div>
            <div class="workout-card-details">
                <div class="detail-item">
                    <span>⏱️</span>
                    <span>
                        <span class="detail-label">Duration</span>
                        <span class="detail-value">${w.duration} min</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span>🔥</span>
                    <span>
                        <span class="detail-label">Calories</span>
                        <span class="detail-value">${w.calories} kcal</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span>💪</span>
                    <span>
                        <span class="detail-label">Intensity</span>
                        <span class="detail-value">${w.intensity}</span>
                    </span>
                </div>
            </div>
            ${w.notes ? `<div class="workout-card-notes"><strong>Notes:</strong> ${w.notes}</div>` : ''}
            <div class="workout-card-actions">
                <button class="btn btn-danger delete-btn" onclick="deleteWorkout(${w.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Add event listeners for search and filter
document.getElementById('searchInput')?.addEventListener('input', displayHistory);
document.getElementById('filterType')?.addEventListener('change', displayHistory);

// ====================================
// DELETE WORKOUT
// ====================================

function deleteWorkout(id) {
    if (confirm('Are you sure you want to delete this workout?')) {
        let workouts = loadWorkouts();
        workouts = workouts.filter(w => w.id !== id);
        saveWorkouts(workouts);
        displayHistory();
        updateDashboard();
    }
}

// ====================================
// CLEAR ALL WORKOUTS
// ====================================

function clearAllWorkouts() {
    if (confirm('Are you sure? This will delete ALL workouts. This action cannot be undone!')) {
        saveWorkouts([]);
        displayHistory();
        updateDashboard();
        updateAnalytics();
    }
}

// ====================================
// ANALYTICS - CHARTS AND STATS
// ====================================

let weeklyChart, typesChart, intensityChart;

function updateAnalytics() {
    const workouts = loadWorkouts();
    
    // Update summary stats
    if (workouts.length === 0) {
        document.getElementById('analyTotalWorkouts').textContent = '0';
        document.getElementById('analyTotalCalories').textContent = '0';
        document.getElementById('analyAvgDuration').textContent = '0 min';
        document.getElementById('analyMostUsed').textContent = '—';
        return;
    }
    
    let totalCalories = 0;
    let totalDuration = 0;
    const typeCount = {};
    const intensityCount = {};
    
    workouts.forEach(w => {
        totalCalories += w.calories;
        totalDuration += w.duration;
        typeCount[w.type] = (typeCount[w.type] || 0) + 1;
        intensityCount[w.intensity] = (intensityCount[w.intensity] || 0) + 1;
    });
    
    const avgDuration = Math.round(totalDuration / workouts.length);
    const mostUsedType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0][0];
    
    document.getElementById('analyTotalWorkouts').textContent = workouts.length;
    document.getElementById('analyTotalCalories').textContent = totalCalories.toLocaleString();
    document.getElementById('analyAvgDuration').textContent = avgDuration + ' min';
    document.getElementById('analyMostUsed').textContent = mostUsedType;
    
    // Draw charts
    drawWeeklyChart(workouts);
    drawTypesChart(typeCount);
    drawIntensityChart(intensityCount);
    
    // Draw monthly calendar
    drawMonthlyCalendar(workouts);
}

// ====================================
// WEEKLY CHART
// ====================================

function drawWeeklyChart(workouts) {
    const labels = [];
    const data = [];
    
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(dayName);
        
        // Count workouts for this day
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const count = workouts.filter(w => {
            const wDate = new Date(w.date);
            return wDate >= dayStart && wDate < dayEnd;
        }).length;
        
        data.push(count);
    }
    
    const ctx = document.getElementById('weeklyChart')?.getContext('2d');
    if (!ctx) return;
    
    if (weeklyChart) weeklyChart.destroy();
    
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Workouts',
                data: data,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(102, 126, 234, 0.8)'
                ],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ====================================
// WORKOUT TYPES CHART
// ====================================

function drawTypesChart(typeCount) {
    const labels = Object.keys(typeCount);
    const data = Object.values(typeCount);
    
    const ctx = document.getElementById('typesChart')?.getContext('2d');
    if (!ctx) return;
    
    if (typesChart) typesChart.destroy();
    
    const colors = [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(240, 147, 251, 0.8)',
        'rgba(255, 217, 61, 0.8)',
        'rgba(76, 175, 80, 0.8)',
        'rgba(255, 107, 107, 0.8)'
    ];
    
    typesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ====================================
// INTENSITY CHART
// ====================================

function drawIntensityChart(intensityCount) {
    const labels = Object.keys(intensityCount);
    const data = Object.values(intensityCount);
    
    const ctx = document.getElementById('intensityChart')?.getContext('2d');
    if (!ctx) return;
    
    if (intensityChart) intensityChart.destroy();
    
    intensityChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Workouts',
                data: data,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(118, 75, 162, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ====================================
// MONTHLY CALENDAR
// ====================================

function drawMonthlyCalendar(workouts) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Create date to workouts map
    const workoutDates = {};
    workouts.forEach(w => {
        const key = w.date;
        workoutDates[key] = true;
    });
    
    let html = '';
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const hasWorkout = workoutDates[dateStr];
        const isCurrentMonth = currentDate.getMonth() === month;
        
        let className = 'calendar-day';
        if (hasWorkout) className += ' has-workout';
        if (isToday) className += ' today';
        
        html += `<div class="${className}" title="${dateStr}">${currentDate.getDate()}</div>`;
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    document.getElementById('monthlyCalendar').innerHTML = html;
}

// ====================================
// PAGE INITIALIZATION
// ====================================

document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    setTodayDate();
    updateDashboard();
    displayMotivationalQuote();
    
    // Refresh motivational quote every minute
    setInterval(displayMotivationalQuote, 60000);
});

// ====================================
// UTILITY - FORMAT DATE
// ====================================

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
