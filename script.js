document.addEventListener("DOMContentLoaded", function () {
    console.log("Login data will be cleared on page refresh");

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDg-K8lG66h8LTqqL-1L329nXLpps56TFE",
        authDomain: "joblist-6a81c.firebaseapp.com",
        projectId: "joblist-6a81c",
        storageBucket: "joblist-6a81c.appspot.com",
        messagingSenderId: "1053706215315",
        appId: "1:1053706215315:web:ba0a0d294a18c714ffd266",
        measurementId: "G-YD12J4VPDH"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    // Get Elements
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) console.error(`Element with ID '${id}' not found.`);
        return element;
    }

    // Toggle Login & Register Form
    window.toggleAuthMode = () => {
        const loginForm = getElement("login-form");
        const registerForm = getElement("register-form");

        if (loginForm.style.display === "none") {
            loginForm.style.display = "block";
            registerForm.style.display = "none";
        } else {
            loginForm.style.display = "none";
            registerForm.style.display = "block";
        }
    };

    // Update UI based on user authentication state
    function updateUserUI(user) {
        const loginSection = getElement("login-form");
        const registerSection = getElement("register-form");
        const profileSection = getElement("profile-section");
        const profileCircle = getElement("profile-circle");
        const logoutButton = getElement("logout-btn");

        if (!loginSection || !profileSection || !logoutButton || !registerSection || !profileCircle) {
            console.error("UI elements not found.");
            return;
        }

        if (user) {
            const userInitial = user.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : user.email.charAt(0).toUpperCase();

            profileCircle.innerText = userInitial;
            profileSection.style.display = "block";
            loginSection.style.display = "none";
            registerSection.style.display = "none";
        } else {
            profileSection.style.display = "none";
            loginSection.style.display = "block";
            registerSection.style.display = "none";
        }
    }

    // Google Sign-In
    window.loginWithGoogle = () => {
        if (auth.currentUser) {
            alert("Already logged in.");
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(result => {
                alert("Google Login Successful!");
                updateUserUI(result.user);
            })
            .catch(error => alert("Google Login Error: " + error.message));
    };

    // Email Login
    window.loginWithEmail = () => {
        if (auth.currentUser) {
            alert("Already logged in.");
            return;
        }

        const emailInput = getElement("email");
        const passwordInput = getElement("password");

        const email = emailInput?.value;
        const password = passwordInput?.value;

        if (!email || !password) return alert("Enter email and password");

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                alert("Login Successful!");
                updateUserUI(userCredential.user);
                emailInput.value = "";
                passwordInput.value = "";
            })
            .catch(error => alert("Login failed: " + error.message));
    };

    // Email Registration
    window.registerWithEmail = () => {
        const emailInput = getElement("register-email");
        const passwordInput = getElement("register-password");

        const email = emailInput?.value;
        const password = passwordInput?.value;

        if (!email || !password) return alert("Enter email and password");

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                alert("Registration successful!");
                updateUserUI(userCredential.user);
                emailInput.value = "";
                passwordInput.value = "";
            })
            .catch(error => {
                if (error.code === "auth/email-already-in-use") {
                    alert("Email already exists. Try logging in.");
                } else {
                    alert("Registration failed: " + error.message);
                }
            });
    };

    // Logout
    window.logout = () => {
        auth.signOut()
            .then(() => {
                alert("Logged out successfully!");
                updateUserUI(null);
            })
            .catch(error => alert("Logout failed: " + error.message));
    };

    // Auth State Listener (Executes on page load)
    auth.onAuthStateChanged(user => {
        updateUserUI(user);
    });

    const jobs = []; // Global array to store jobs

    function loadJobs() {
        fetch("job_listings[1].json") // Fetch data from JSON file
            .then(response => response.json()) // Convert response to JSON
            .then(data => {
                jobs.length = 0;  // Clear existing data
                jobs.push(...data); // Spread JSON data into the array
                displayJobs(); // Call function to display jobs
            })
            .catch(error => console.error("Error loading jobs:", error));
    }
    loadJobs();
    
    
    
    const jobListings = document.getElementById("job-listings");
    const modal = document.getElementById("job-modal");
    const modalTitle = document.getElementById("job-title");
    const modalDetails = document.getElementById("job-details");
    const applyBtn = document.getElementById("apply-btn");
    const closeModal = document.querySelector(".close");
    
    // Filter elements
    const searchInput = document.getElementById("search");
    const filterLocation = document.getElementById("filter-location");
    const filterType = document.getElementById("filter-type");
    const sortButton = document.getElementById("sort");
    
    // Function to display jobs
    function displayJobs(filteredJobs = jobs) {
        jobListings.innerHTML = ""; // Clear previous jobs
        filteredJobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.classList.add("job-card");
            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <p>${job.location} - ${job.type}</p>
                <p>💰 Salary: $${job.salary}</p>
            `;
            jobCard.onclick = () => openModal(job);
            jobListings.appendChild(jobCard);
        });
    }
    
    // Function to open job modal
    function openModal(job) {
        modalTitle.textContent = job.title;
        modalDetails.textContent = job.details;
        modal.style.display = "flex";
    }
    
    // Function to close modal
    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });
    
    // Function to filter jobs
    function filterJobs() {
        let searchText = searchInput.value.toLowerCase();
        let selectedLocation = filterLocation.value;
        let selectedType = filterType.value;
    
        let filteredJobs = jobs.filter(job => {
            return (
                (job.title.toLowerCase().includes(searchText) || job.details.toLowerCase().includes(searchText)) &&
                (selectedLocation === "" || job.location === selectedLocation) &&
                (selectedType === "" || job.type === selectedType)
            );
        });
    
        displayJobs(filteredJobs);
    }
    
    // Function to sort jobs by salary
    function sortJobsBySalary() {
        let sortedJobs = [...jobs].sort((a, b) => b.salary - a.salary);
        displayJobs(sortedJobs);
    }
    
    // Event Listeners for filtering & sorting
    searchInput.addEventListener("input", filterJobs);
    filterLocation.addEventListener("change", filterJobs);
    filterType.addEventListener("change", filterJobs);
    sortButton.addEventListener("click", sortJobsBySalary);
    
    function openModal(job) {
        modal.style.display = "flex";
        modalTitle.textContent = job.title;
        modalDetails.textContent = job.details;
        applyBtn.onclick = () => applyForJob(job);
    }

    function applyForJob(job) {
        if (!auth.currentUser) {
            alert("Please login to apply for jobs.");
            return;
        }

        alert(`You applied for ${job.title}`);
        sendEmailNotification(job);
    }

    function sendEmailNotification(job) {
        emailjs.init("QVswIR78b9srUGXFJ");

        const user = auth.currentUser;
        if (!user) {
            console.error("User is not logged in");
            return;
        }

        const templateParams = {
            subject: "Job Application",
            job_title: job.title,
            job_location: job.location,
            job_type: job.type,
            job_salary: job.salary,
            job_details: job.details,
            email: user.email // Use logged-in user's email
        };

        emailjs.send("service_n9xd3pm", "template_rnels4l", templateParams)
            .then(response => console.log("Email sent!", response.status, response.text))
            .catch(error => console.error("Error sending email:", error));
    }

    document.querySelector(".close").onclick = () => (modal.style.display = "none");
    window.onclick = event => { if (event.target === modal) modal.style.display = "none"; };

    document.getElementById("sort").onclick = () => {
        jobs.sort((a, b) => b.salary - a.salary);
        displayJobs();
    };

});
