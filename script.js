var currentStep = 1;

// Realtime Password strength meter
document.getElementById('password').oninput = function() {
    var val = this.value;
    var meter = document.getElementById('strength-meter');
    var points = 0;

    if (val.length >= 6) points = points + 1;
    
    var hasUpper = false;
    for (var i = 0; i < val.length; i++) {
        if (val[i] >= 'A' && val[i] <= 'Z') {
            hasUpper = true;
        }
    }
    if (hasUpper === true) points = points + 1;

    var hasNumber = false;
    for (var j = 0; j < val.length; j++) {
        if (val[j] >= '0' && val[j] <= '9') {
            hasNumber = true;
        }
    }
    if (hasNumber === true) points = points + 1;

    if (points === 0) {
        meter.style.backgroundColor = "#e2e8f0";
        meter.style.width = "0%";
    } else if (points === 1) {
        meter.style.backgroundColor = "#ef4444";
        meter.style.width = "33%";
    } else if (points === 2) {
        meter.style.backgroundColor = "#f59e0b";
        meter.style.width = "66%";
    } else {
        meter.style.backgroundColor = "#10b981";
        meter.style.width = "100%";
    }
};

function validateStep(step) {
    var isValid = true;
    
    document.getElementById('err-name').textContent = "";
    document.getElementById('err-age').textContent = "";
    document.getElementById('err-phone').textContent = "";
    document.getElementById('err-email').textContent = "";
    document.getElementById('err-password').textContent = "";
    document.getElementById('err-confirmPassword').textContent = "";

    if (step === 1) {
        var name = document.getElementById('name').value.trim();
        var age = parseInt(document.getElementById('age').value);
        var phone = document.getElementById('phone').value.trim();

        if (name === "") {
            document.getElementById('err-name').textContent = "Name is required.";
            isValid = false;
        }
        if (isNaN(age) || age < 18 || age > 120) {
            document.getElementById('err-age').textContent = "Age must be between 18 and 120.";
            isValid = false;
        }

        // --- NEW PHONE VALIDATION CONCEPT ---
        // 1. Check if the input is empty or not exactly 10 characters long
        if (phone === "" || phone.length !== 10) {
            document.getElementById('err-phone').textContent = "Phone number must be exactly 10 digits.";
            isValid = false;
        } else {
            // 2. Simple manual loop to make sure every single character is a number
            var onlyNumbers = true;
            for (var i = 0; i < phone.length; i++) {
                if (phone[i] < '0' || phone[i] > '9') {
                    onlyNumbers = false;
                }
            }
            if (onlyNumbers === false) {
                document.getElementById('err-phone').textContent = "Phone number can only contain numbers.";
                isValid = false;
            }
        }
    }

    if (step === 2) {
        var email = document.getElementById('email').value.trim();
        var pass = document.getElementById('password').value;
        var confirmPass = document.getElementById('confirmPassword').value;

        if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {
            document.getElementById('err-email').textContent = "Enter a valid email structure.";
            isValid = false;
        }
        if (pass.length < 6) {
            document.getElementById('err-password').textContent = "Password must be at least 6 characters.";
            isValid = false;
        }
        if (pass !== confirmPass) {
            document.getElementById('err-confirmPassword').textContent = "Passwords do not match.";
            isValid = false;
        }
    }

    return isValid;
}

function changeStep(direction) {
    if (direction === 1 && validateStep(currentStep) === false) {
        return; 
    }

    document.getElementById("step-" + currentStep).classList.remove("active");
    document.getElementById("dot-" + currentStep).classList.remove("active");

    currentStep = currentStep + direction;

    document.getElementById("step-" + currentStep).classList.add("active");
    document.getElementById("dot-" + currentStep).classList.add("active");

    if (currentStep === 3) {
        buildSummary();
    }
}

function buildSummary() {
    var nameVal = document.getElementById('name').value;
    var ageVal = document.getElementById('age').value;
    var phoneVal = document.getElementById('phone').value;
    var emailVal = document.getElementById('email').value;

    var summaryBox = document.getElementById('summary-content');
    summaryBox.innerHTML = 
        '<div class="summary-item"><strong>Name</strong> <span>' + nameVal + '</span></div>' +
        '<div class="summary-item"><strong>Age</strong> <span>' + ageVal + ' Yrs</span></div>' +
        '<div class="summary-item"><strong>Phone</strong> <span>' + phoneVal + '</span></div>' +
        '<div class="summary-item"><strong>Email</strong> <span>' + emailVal + '</span></div>';
}

function finalSubmit() {
    var entry = {
        id: new Date().getTime(),
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value
    };

    var savedData = localStorage.getItem('registrations');
    var dataArray = [];
    
    if (savedData !== null) {
        dataArray = JSON.parse(savedData);
    }
    
    dataArray.push(entry);
    localStorage.setItem('registrations', JSON.stringify(dataArray));
    
    document.getElementById('name').value = "";
    document.getElementById('age').value = "";
    document.getElementById('phone').value = "";
    document.getElementById('email').value = "";
    document.getElementById('password').value = "";
    document.getElementById('confirmPassword').value = "";
    document.getElementById('strength-meter').style.width = "0%";

    changeStep(-2);
    renderTable();
}

function renderTable() {
    var tbody = document.getElementById('db-table-body');
    tbody.innerHTML = ''; 
    
    var savedData = localStorage.getItem('registrations');
    var dataArray = [];
    
    if (savedData !== null) {
        dataArray = JSON.parse(savedData);
    }

    for (var i = 0; i < dataArray.length; i++) {
        var item = dataArray[i];
        var row = document.createElement('tr');
        
        row.innerHTML = 
            '<td style="font-weight:600; color:#0f172a;">' + item.name + '</td>' +
            '<td>' + item.age + '</td>' +
            '<td>' + item.phone + '</td>' +
            '<td>' + item.email + '</td>' +
            '<td><button class="delete-btn" data-id="' + item.id + '">Delete</button></td>';
            
        row.querySelector('.delete-btn').onclick = function() {
            var targetId = parseInt(this.getAttribute('data-id'));
            deleteEntry(targetId);
        };
        
        tbody.appendChild(row);
    }
}

function deleteEntry(id) {
    var savedData = localStorage.getItem('registrations');
    var dataArray = JSON.parse(savedData);
    var filteredArray = [];

    for (var i = 0; i < dataArray.length; i++) {
        if (dataArray[i].id !== id) {
            filteredArray.push(dataArray[i]);
        }
    }

    localStorage.setItem('registrations', JSON.stringify(filteredArray));
    renderTable();
}

document.getElementById('btn-next-1').onclick = function() { changeStep(1); };
document.getElementById('btn-back-2').onclick = function() { changeStep(-1); };
document.getElementById('btn-next-2').onclick = function() { changeStep(1); };
document.getElementById('btn-back-3').onclick = function() { changeStep(-1); };
document.getElementById('btn-submit').onclick = finalSubmit;

renderTable();