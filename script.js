// Modern JavaScript - Enhanced UX

// Toast notification system
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type}`;

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Register user with validation
function registerUser() {
  const name = document.getElementById("name")?.value;
  const email = document.getElementById("regEmail")?.value;
  const password = document.getElementById("regPassword")?.value;

  if (!name || !email || !password) {
    showToast('Please fill all fields', 'error');
    return false;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return false;
  }

  localStorage.setItem("name", name);
  localStorage.setItem("email", email);
  localStorage.setItem("password", password);

  showToast('Registered successfully! 🎉', 'success');

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);

  return false;
}

// Login user
function loginUser() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    showToast('Please enter email and password', 'error');
    return false;
  }

  const storedEmail = localStorage.getItem("email");
  const storedPassword = localStorage.getItem("password");

  if (email === storedEmail && password === storedPassword) {
    showToast('Welcome back! 👋', 'success');
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  } else {
    showToast('Invalid email or password', 'error');
  }

  return false;
}

// Apply for job with animation
function applyJob(job) {
  const history = document.getElementById("history");
  let jobs = localStorage.getItem("jobs") || "";

  // Check if already applied
  if (jobs.includes(job)) {
    showToast(`You already applied for ${job}`, 'info');
    return;
  }

  // Add to history with timestamp
  const timestamp = new Date().toLocaleDateString();
  const newEntry = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border-left: 3px solid var(--success); animation: fadeInUp 0.3s ease-out;">
      <div>
        <strong style="color: var(--white);">${job}</strong>
        <div style="font-size: 0.8rem; color: var(--gray);">Applied on ${timestamp}</div>
      </div>
      <span style="background: rgba(16, 185, 129, 0.2); color: var(--success); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem;">Applied</span>
    </div>
  `;

  jobs += newEntry;
  localStorage.setItem("jobs", jobs);

  // Update applied count
  const count = jobs.split('Applied on').length - 1;
  const countEl = document.getElementById('appliedCount');
  if (countEl) {
    countEl.textContent = count;
    countEl.style.transform = 'scale(1.2)';
    setTimeout(() => countEl.style.transform = 'scale(1)', 200);
  }

  showToast(`Applied for ${job} successfully! 🎯`, 'success');
  showHistory();
}

// Show application history
function showHistory() {
  const history = document.getElementById("history");
  if (!history) return;

  const data = localStorage.getItem("jobs");
  if (data && data.trim()) {
    history.innerHTML = data;
  } else {
    history.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--gray);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
        <p>No applications yet</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Start applying to jobs above!</p>
      </div>
    `;
  }
}

// Logout with confirmation
function logoutUser() {
  showToast('Logging out...', 'info');
  setTimeout(() => {
    window.location.href = "login.html";
  }, 800);
}

// Toggle dark/light mode
function toggleMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);
  showToast(isDark ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'info');
}

// Upload profile photo with preview
function uploadPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2MB', 'error');
    return;
  }

  const reader = new FileReader();

  reader.onload = function() {
    localStorage.setItem("photo", reader.result);
    const pic = document.getElementById("profilePic");
    if (pic) {
      pic.src = reader.result;
      pic.style.transform = 'scale(0.8)';
      setTimeout(() => pic.style.transform = 'scale(1)', 300);
    }
    showToast('Profile photo updated! 📸', 'success');
  };

  reader.onerror = function() {
    showToast('Failed to load image', 'error');
  };

  reader.readAsDataURL(file);
}

// Search jobs with highlighting
function searchJobs() {
  const input = document.getElementById("searchBox")?.value.toLowerCase();
  const jobs = document.getElementsByClassName("job");
  let visibleCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const title = jobs[i].getAttribute('data-title')?.toLowerCase() || '';
    const company = jobs[i].getAttribute('data-company')?.toLowerCase() || '';
    const location = jobs[i].getAttribute('data-location')?.toLowerCase() || '';

    const matches = title.includes(input) || company.includes(input) || location.includes(input);

    if (matches) {
      jobs[i].style.display = "block";
      jobs[i].style.animation = 'fadeInUp 0.3s ease-out';
      visibleCount++;
    } else {
      jobs[i].style.display = "none";
    }
  }

  // Show results count
  if (input && visibleCount === 0) {
    showToast('No jobs found matching your search', 'info');
  }
}

// Initialize on page load
window.onload = function() {
  // Set welcome message
  const welcome = document.getElementById("welcome");
  if (welcome) {
    const name = localStorage.getItem("name") || "Student";
    welcome.innerHTML = `Welcome, <span style="color: var(--primary-light);">${name}</span>`;
  }

  // Load profile photo
  const photo = localStorage.getItem("photo");
  const profilePic = document.getElementById("profilePic");
  if (photo && profilePic) {
    profilePic.src = photo;
  }

  // Load dark mode preference
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark");
  }

  // Show history
  showHistory();

  // Add scroll animations
  initScrollAnimations();
};

// Scroll animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.glass-card, .stat-card, .job-card').forEach(el => {
    observer.observe(el);
  });
}

// Smooth scroll to features
function startNow() {
  const features = document.getElementById("features");
  if (features) {
    features.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast('Explore amazing opportunities! 🚀', 'info');
  }
}

// Navbar scroll effect (fallback)
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K for search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.focus();
  }

  // Escape to close toast
  if (e.key === 'Escape') {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
  }
});