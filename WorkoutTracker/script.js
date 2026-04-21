// script.js - Workout Tracker Functionality

// DOM Elements
const darkModeToggle = document.getElementById('darkModeToggle');
const workoutForm = document.getElementById('workoutForm');
const workoutsTableBody = document.getElementById('workoutsTableBody');
const historyTableBody = document.getElementById('historyTableBody');
const filterDate = document.getElementById('filterDate');
const searchExercise = document.getElementById('searchExercise');
const clearFilters = document.getElementById('clearFilters');
const totalWorkouts = document.getElementById('totalWorkouts');
const mostFrequent = document.getElementById('mostFrequent');
const weeklyProgress = document.getElementById('weeklyProgress');
const userName = document.getElementById('userName');
const fitnessGoal = document.getElementById('fitnessGoal');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const editProfileForm = document.getElementById('editProfileForm');
const editName = document.getElementById('editName');
const editGoal = document.getElementById('editGoal');
const personalBests = document.getElementById('personalBests');
const restReminder = document.getElementById('restReminder');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadDarkMode();
    loadWorkouts();
    loadProfile();
    updateHistory();
    updateProfileStats();
    checkRestDayReminder();
    
    // Set default date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
});

// Dark Mode Toggle
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Update icon
    const icon = darkModeToggle.querySelector('i');
    icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
}

function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) {
            darkModeToggle.querySelector('i').className = 'fas fa-sun';
        }
    }
}

// Workout Form Handling
if (workoutForm) {
    workoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const workout = {
            id: Date.now(),
            exercise: document.getElementById('exerciseName').value,
            sets: parseInt(document.getElementById('sets').value),
            reps: parseInt(document.getElementById('reps').value),
            weight: parseFloat(document.getElementById('weight').value),
            date: document.getElementById('date').value
        };
        
        saveWorkout(workout);
        workoutForm.reset();
        document.getElementById('date').valueAsDate = new Date();
        loadWorkouts();
        updateHistory();
        updateProfileStats();
        checkRestDayReminder();
    });
}

// Save workout to localStorage
function saveWorkout(workout) {
    const workouts = getWorkouts();
    workouts.push(workout);
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

// Get workouts from localStorage
function getWorkouts() {
    return JSON.parse(localStorage.getItem('workouts') || '[]');
}

// Load workouts in tracker page
function loadWorkouts() {
    if (!workoutsTableBody) return;
    
    const workouts = getWorkouts();
    workoutsTableBody.innerHTML = '';
    
    workouts.forEach(workout => {
        const row = createWorkoutRow(workout);
        workoutsTableBody.appendChild(row);
    });
}

// Create workout table row
function createWorkoutRow(workout) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${workout.exercise}</td>
        <td>${workout.sets}</td>
        <td>${workout.reps}</td>
        <td>${workout.weight}kg</td>
        <td>${formatDate(workout.date)}</td>
        <td>
            <button class="btn-secondary" onclick="editWorkout(${workout.id})">Edit</button>
            <button class="btn-secondary" onclick="deleteWorkout(${workout.id})">Delete</button>
        </td>
    `;
    return row;
}

// Edit workout
function editWorkout(id) {
    const workouts = getWorkouts();
    const workout = workouts.find(w => w.id === id);
    if (!workout) return;
    
    // Populate form with workout data
    document.getElementById('exerciseName').value = workout.exercise;
    document.getElementById('sets').value = workout.sets;
    document.getElementById('reps').value = workout.reps;
    document.getElementById('weight').value = workout.weight;
    document.getElementById('date').value = workout.date;
    
    // Remove old workout
    deleteWorkout(id);
}

// Delete workout
function deleteWorkout(id) {
    const workouts = getWorkouts();
    const filteredWorkouts = workouts.filter(w => w.id !== id);
    localStorage.setItem('workouts', JSON.stringify(filteredWorkouts));
    loadWorkouts();
    updateHistory();
    updateProfileStats();
    checkRestDayReminder();
}

// Update history page
function updateHistory() {
    if (!historyTableBody) return;
    
    const workouts = getWorkouts();
    historyTableBody.innerHTML = '';
    
    workouts.forEach(workout => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${workout.exercise}</td>
            <td>${workout.sets}</td>
            <td>${workout.reps}</td>
            <td>${workout.weight}kg</td>
            <td>${formatDate(workout.date)}</td>
        `;
        historyTableBody.appendChild(row);
    });
    
    // Update summary
    updateSummaryStats(workouts);
}

// Filter functionality
if (filterDate) {
    filterDate.addEventListener('change', filterWorkouts);
}

if (searchExercise) {
    searchExercise.addEventListener('input', filterWorkouts);
}

if (clearFilters) {
    clearFilters.addEventListener('click', function() {
        filterDate.value = '';
        searchExercise.value = '';
        updateHistory();
    });
}

function filterWorkouts() {
    const workouts = getWorkouts();
    let filtered = workouts;
    
    if (filterDate.value) {
        filtered = filtered.filter(w => w.date === filterDate.value);
    }
    
    if (searchExercise.value) {
        const searchTerm = searchExercise.value.toLowerCase();
        filtered = filtered.filter(w => w.exercise.toLowerCase().includes(searchTerm));
    }
    
    historyTableBody.innerHTML = '';
    filtered.forEach(workout => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${workout.exercise}</td>
            <td>${workout.sets}</td>
            <td>${workout.reps}</td>
            <td>${workout.weight}kg</td>
            <td>${formatDate(workout.date)}</td>
        `;
        historyTableBody.appendChild(row);
    });
}

// Update summary statistics
function updateSummaryStats(workouts) {
    if (!totalWorkouts) return;
    
    // Total workouts
    totalWorkouts.textContent = workouts.length;
    
    // Most frequent exercise
    const exerciseCount = {};
    workouts.forEach(w => {
        exerciseCount[w.exercise] = (exerciseCount[w.exercise] || 0) + 1;
    });
    const mostFreq = Object.keys(exerciseCount).reduce((a, b) => 
        exerciseCount[a] > exerciseCount[b] ? a : b, 'None');
    mostFrequent.textContent = mostFreq;
    
    // Weekly progress
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;
    weeklyProgress.textContent = `${thisWeek} workouts this week`;
}

// Profile functionality
function loadProfile() {
    const profile = JSON.parse(localStorage.getItem('profile') || '{"name": "John Doe", "goal": "Build Muscle"}');
    if (userName) userName.textContent = profile.name;
    if (fitnessGoal) fitnessGoal.textContent = `Fitness Goal: ${profile.goal}`;
}

function updateProfileStats() {
    const workouts = getWorkouts();
    
    // Personal bests
    const bests = {};
    workouts.forEach(w => {
        if (!bests[w.exercise] || w.weight > bests[w.exercise]) {
            bests[w.exercise] = w.weight;
        }
    });
    
    if (personalBests) {
        personalBests.innerHTML = '';
        Object.keys(bests).slice(0, 3).forEach(exercise => {
            const li = document.createElement('li');
            li.textContent = `${exercise}: ${bests[exercise]}kg`;
            personalBests.appendChild(li);
        });
    }
}

// Edit profile modal
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', function() {
        const profile = JSON.parse(localStorage.getItem('profile') || '{"name": "John Doe", "goal": "Build Muscle"}');
        editName.value = profile.name;
        editGoal.value = profile.goal;
        editProfileModal.style.display = 'block';
    });
}

if (editProfileModal) {
    const closeBtn = editProfileModal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        editProfileModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });
}

if (editProfileForm) {
    editProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const profile = {
            name: editName.value,
            goal: editGoal.value
        };
        localStorage.setItem('profile', JSON.stringify(profile));
        loadProfile();
        editProfileModal.style.display = 'none';
    });
}

// Rest day reminder
function checkRestDayReminder() {
    const workouts = getWorkouts();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const hasWorkoutToday = workouts.some(w => w.date === today);
    const hasWorkoutYesterday = workouts.some(w => w.date === yesterday);
    
    if (restReminder) {
        if (!hasWorkoutToday && !hasWorkoutYesterday) {
            restReminder.textContent = 'Rest day reminder: You haven\'t worked out for 2 days. Consider a light session!';
            restReminder.style.color = '#ff6b6b';
        } else {
            restReminder.textContent = 'No rest day reminder needed.';
            restReminder.style.color = '#fff';
        }
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}